from sklearn.neighbors import NearestNeighbors
from sqlalchemy import create_engine

import pandas as pd
import cv2
import numpy as np
import base64
import math
import os


# ==========================================
#  Mediapipe 안전 모드 (Try-Except)
# ==========================================
try:
    import mediapipe as mp
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
    USE_MEDIAPIPE = True
    print("✅ [AI] Mediapipe (자세 분석) 정상 로드 완료!")
except Exception as e:
    print(f"⚠️ [AI] Mediapipe 로드 실패 (자세 분석은 임시 비활성화됩니다): {e}")
    USE_MEDIAPIPE = False


# ==========================================
# MySQL 데이터베이스 연결 설정
# ==========================================
DB_URL = os.environ.get("DB_URL")
engine = create_engine(DB_URL)

# ==========================================
# SQL에서 데이터 불러와서 식단 AI 모델 학습
# ==========================================
try:
    query = "SELECT * FROM food"
    df_food = pd.read_sql(query, engine)
    if df_food.empty:
        print("⚠️ DB의 food 테이블이 비어있습니다!")
    else:
        print(f"✅ MySQL에서 음식 데이터 {len(df_food)}개 불러옴!")
        features = df_food[['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat']]
        knn_model = NearestNeighbors(n_neighbors=1, algorithm='auto').fit(features)
        print("✅ 식단 AI 모델 실전 데이터 학습 완료!")
except Exception as e:
    print(f"🚨 DB 연결 실패: {e}")

# ==========================================
# 식단 추천 로직 함수
# ==========================================
def get_best_diet(target_kcal, target_carbs, target_protein, target_fat, diet_type):
    if diet_type != "맞춤 식단":
        filtered_df = df_food[df_food['fo_type'] == diet_type]
    else:
        filtered_df = df_food

    if filtered_df.empty: filtered_df = df_food

    temp_features = filtered_df[['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat']]
    temp_model = NearestNeighbors(n_neighbors=1, algorithm='auto').fit(temp_features)

    target_meal = [[target_kcal, target_carbs, target_protein, target_fat]]
    distances, indices = temp_model.kneighbors(target_meal)
    best_food_row = filtered_df.iloc[indices[0][0]]
    
    return {
        "id": int(best_food_row['fo_num']),
        "menu": best_food_row['fo_name'],
        "kcal": int(best_food_row['fo_kcal']),
        "carbs": int(best_food_row['fo_carbs']),
        "protein": int(best_food_row['fo_protein']),
        "fat": int(best_food_row['fo_fat']),
        "sodium": int(best_food_row['fo_natrium']),
        "tags": [best_food_row['fo_type'], "AI 정밀분석"]
    }

#=======================================
# 두 좌표 사이의 기울기(각도)를 계산하는 함수
#=======================================
def calculate_angle(p1, p2):
    # 수평선을 기준으로 두 점이 얼마나 기울어져 있는지 계산
    dy = p2.y - p1.y
    dx = p2.x - p1.x
    angle = math.degrees(math.atan2(dy, dx))
    return abs(angle) # 무조건 양수(절대값)로 반환

# ==========================================
# 눈바디 AI 함수 (뼈대 그리기 / 실루엣 따기)
# ==========================================
def analyze_pose(image_bytes):
    if not USE_MEDIAPIPE:
        print("⚠️ 자세 분석 기능을 건너뛰고 원본 이미지를 반환합니다.")
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        _, buffer = cv2.imencode('.jpg', img)
        # 🌟 이제 단순 문자열이 아니라 딕셔너리(JSON 형태)로 반환합니다!
        return {"image_base64": base64.b64encode(buffer).decode('utf-8'), "score_data": None}

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    results = pose.process(img_rgb)
    score_data = None # 🌟 점수 데이터를 담을 변수

    if results.pose_landmarks:
        # 🌟 1. 랜드마크 좌표 추출
        landmarks = results.pose_landmarks.landmark
        
        # 어깨 (11: 왼쪽 어깨, 12: 오른쪽 어깨)
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        
        # 골반 (23: 왼쪽 골반, 24: 오른쪽 골반)
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
        
        # 🌟 2. 비대칭 각도 계산 (0도에 가까울수록 완벽한 대칭)
        shoulder_angle = calculate_angle(left_shoulder, right_shoulder)
        hip_angle = calculate_angle(left_hip, right_hip)
        
        # 🌟 3. 점수 계산 (100점 만점 기준, 1도 틀어질 때마다 3점씩 감점)
        shoulder_score = max(0, 100 - (shoulder_angle * 3))
        hip_score = max(0, 100 - (hip_angle * 3))
        total_score = (shoulder_score + hip_score) / 2
        
        # 🌟 4. 맞춤형 피드백 생성
        feedback = "훌륭합니다! 좌우 밸런스가 아주 좋습니다. 👏"
        if shoulder_angle > 3 and hip_angle > 3:
            feedback = "어깨와 골반이 모두 조금 틀어져 있습니다. 전신 교정 스트레칭이 필요해요! 🧘‍♀️"
        elif shoulder_angle > 3:
            feedback = "어깨 비대칭이 감지되었습니다. 한쪽으로 가방을 매거나 턱을 괴는 습관을 점검해보세요. 🎒"
        elif hip_angle > 3:
            feedback = "골반이 약간 틀어져 있습니다. 다리를 꼬고 앉는 습관을 피해주세요! 🪑"

        # 프론트엔드로 넘겨줄 점수 묶음(Dictionary) 생성
        score_data = {
            "shoulder_score": round(shoulder_score, 1),
            "hip_score": round(hip_score, 1),
            "total_score": round(total_score, 1),
            "feedback": feedback
        }

        # 기존처럼 뼈대 그리기
        mp_drawing.draw_landmarks(
            img, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
        )
        print(f"✅ [AI] 뼈대 분석 완료! (종합 점수: {total_score:.1f}점)")
    else:
        print("⚠️ [AI] 사람을 인식하지 못했습니다.")
        
    _, buffer = cv2.imencode('.jpg', img)
    
    # 🌟 이미지와 점수 데이터를 함께 반환
    return {
        "image_base64": base64.b64encode(buffer).decode('utf-8'),
        "score_data": score_data
    }
def extract_outline(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    
    img_bgr = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    print("✅ [AI] 윤곽선(실루엣) 추출 완료!")
    
    _, buffer = cv2.imencode('.jpg', img_bgr)
    return base64.b64encode(buffer).decode('utf-8')

# ==========================================
# 3줄 요약 코칭 피드백 생성 함수
# ==========================================
def generate_daily_feedback(grade, current_kcal, target_kcal, carbs, protein, fat, sodium):
    
    # 1줄차: 칼로리 분석 및 공감
    kcal_diff = target_kcal - current_kcal
    if kcal_diff > 300:
        line1 = f"목표보다 {kcal_diff}kcal 덜 드셨네요! 오늘은 속이 조금 가벼운 하루였겠어요. 😊"
    elif kcal_diff < -300:
        line1 = f"목표보다 {abs(kcal_diff)}kcal 더 드셨네요! 에너지가 넘치는 하루였군요. 💪"
    else:
        line1 = "목표 칼로리에 아주 근접하게 드셨어요! 양 조절을 정말 기가 막히게 하셨네요. 👏"

    # 2줄차: 영양소 기반 액션 플랜 (전문가 조언)
    # 기획에 맞게 기준 수치는 자유롭게 변경하세요!
    if protein < 50:
        line2 = "단백질 섭취가 조금 부족해요. 다음 끼니엔 두부, 계란, 닭가슴살을 곁들여 근육을 지켜볼까요? 🥚"
    elif carbs < 100:
        line2 = "탄수화물이 부족하면 뇌가 금방 지칠 수 있어요. 통밀빵이나 현미밥으로 건강한 에너지를 채워주세요! 🍞"
    elif fat > 60:
        line2 = "지방 섭취가 꽤 높은 편이에요! 내일은 튀긴 음식보다는 찌거나 굽는 조리법을 선택해 보는 건 어떨까요? 🥗"
    elif sodium > 2000:
        line2 = "나트륨 섭취량이 높아요! 몸이 붓지 않도록 오늘은 물을 한 잔 더 마시고 주무시는 걸 추천해요. 💧"
    else:
        line2 = "탄단지 균형이 꽤 훌륭해요! 지금처럼만 골고루 챙겨 드시면 완벽한 건강 식단입니다. ✨"

    # 3줄차: 등급 기반 다정한 동기부여
    if grade in ['A', 'B']:
        line3 = f"{grade}등급 달성을 축하해요! 냠냠플래닛 코치가 항상 응원할게요. 💖"
    else:
        line3 = "조금만 더 신경 쓰면 훨씬 좋아질 거예요. 내일은 더 건강하게 챙겨 먹어봐요! 화이팅! 🌈"

    # 3줄을 합쳐서 반환
    return f"{line1}\n{line2}\n{line3}"


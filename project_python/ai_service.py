# ai_service.py
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sqlalchemy import create_engine

import cv2
import numpy as np
import base64

# ==========================================
# 🌟 [긴급 처방] Mediapipe 안전 모드 (Try-Except)
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
# 1. MySQL 데이터베이스 연결 설정
# ==========================================
DB_URL = "mysql+pymysql://root:root@localhost:3306/nnp"
engine = create_engine(DB_URL)

# ==========================================
# 2. SQL에서 데이터 불러와서 식단 AI 모델 학습
# ==========================================
try:
    query = "SELECT * FROM food"
    df_food = pd.read_sql(query, engine)
    if df_food.empty:
        print("⚠️ DB의 food 테이블이 비어있습니다!")
    else:
        print(f"✅ MySQL에서 음식 데이터 {len(df_food)}개 불러옴!")
        features = df_food[['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat']]
        model = NearestNeighbors(n_neighbors=1, algorithm='auto').fit(features)
        print("✅ 식단 AI 모델 실전 데이터 학습 완료!")
except Exception as e:
    print(f"🚨 DB 연결 실패: {e}")

# ==========================================
# 3. 식단 추천 로직 함수
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

# ==========================================
# 4. 눈바디 AI 함수 (뼈대 그리기 / 실루엣 따기)
# ==========================================
def analyze_pose(image_bytes):
    # 🌟 안전 모드: Mediapipe가 고장 났다면 일단 원본을 돌려보내서 에러를 막습니다!
    if not USE_MEDIAPIPE:
        print("⚠️ 자세 분석 기능을 건너뛰고 원본 이미지를 반환합니다.")
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        _, buffer = cv2.imencode('.jpg', img)
        return base64.b64encode(buffer).decode('utf-8')

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    results = pose.process(img_rgb)
    if results.pose_landmarks:
        mp_drawing.draw_landmarks(
            img, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245,117,66), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(245,66,230), thickness=2, circle_radius=2)
        )
        print("✅ [AI] 뼈대 분석 완료!")
    else:
        print("⚠️ [AI] 사람을 인식하지 못했습니다.")
        
    _, buffer = cv2.imencode('.jpg', img)
    return base64.b64encode(buffer).decode('utf-8')


# 🌟 실루엣 기능은 OpenCV만 사용하므로 무조건 정상 작동합니다!
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
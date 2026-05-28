import os
import json
from google import genai
from sklearn.neighbors import NearestNeighbors
from sqlalchemy import create_engine
from google.genai import types
from dotenv import load_dotenv

import pandas as pd
import cv2
import numpy as np
import base64
import math
import random


# ==========================================
#  Mediapipe 안전 모드 (Try-Except)
# ==========================================
try:
    import mediapipe as mp

    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose

    pose = mp_pose.Pose(
        static_image_mode=True,
        min_detection_confidence=0.5
    )

    USE_MEDIAPIPE = True

    print("✅ [AI] Mediapipe (자세 분석) 정상 로드 완료!")

except Exception as e:

    print(
        f"⚠️ [AI] Mediapipe 로드 실패 "
        f"(자세 분석은 임시 비활성화됩니다): {e}"
    )

    USE_MEDIAPIPE = False


# ==========================================
# 🌟 구글 Gemini AI 설정 (나만의 새 API 키 적용)
# ==========================================
load_dotenv(".env") 

GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")

if GOOGLE_AI_API_KEY:
    try:
        client = genai.Client(api_key=GOOGLE_AI_API_KEY)
        USE_GEMINI = True
        
        masked_key = GOOGLE_AI_API_KEY[:10] + "..." if len(GOOGLE_AI_API_KEY) > 10 else "인식오류"
        print(f"✅ [AI] 구글 Gemini 최신 SDK 연동 완료! (현재 사용중인 키: {masked_key})")

    except Exception as e:
        print(f"⚠️ [AI] Gemini 초기화 실패: {e}")
        client = None
        USE_GEMINI = False
else:
    print(
        "⚠️ [AI] GOOGLE_API_KEY가 없습니다. "
        "텍스트 생성은 건너뜁니다."
    )
    client = None
    USE_GEMINI = False


# ==========================================
# MySQL 데이터베이스 연결 설정
# ==========================================

DB_HOST = os.getenv("DB_URL", "localhost")
DB_PASS = os.getenv("DB_PASSWORD", "root")

if DB_HOST == "localhost":
    DB_USER = "root"
    DB_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:3306/yummy"
else:
    DB_USER = "yummy"
    DB_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:3306/yummy?charset=utf8mb4"

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
        print(
            f"✅ MySQL에서 음식 데이터 "
            f"{len(df_food)}개 불러옴!"
        )

        features = df_food[
            [
                'fo_kcal',
                'fo_carbs',
                'fo_protein',
                'fo_fat'
            ]
        ]

        knn_model = NearestNeighbors(
            n_neighbors=1,
            algorithm='auto'
        ).fit(features)

        print("✅ 식단 AI 모델 실전 데이터 학습 완료!")

except Exception as e:
    print(f"🚨 DB 연결 실패: {e}")


# ==========================================
# 식단 추천 로직 함수 (3끼 무작위 추출)
# ==========================================

def get_best_diets(
    target_kcal,
    target_carbs,
    target_protein,
    target_fat,
    diet_type,
    num_samples=15 
):
    if diet_type != "맞춤 식단":
        filtered_df = df_food[df_food['fo_type'] == diet_type]
    else:
        filtered_df = df_food

    if filtered_df.empty:
        filtered_df = df_food

    temp_features = filtered_df[['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat']]
    
    n_neighbors = min(num_samples, len(filtered_df))
    if n_neighbors == 0:
        return []

    temp_model = NearestNeighbors(n_neighbors=n_neighbors, algorithm='auto').fit(temp_features)
    target_meal = [[target_kcal, target_carbs, target_protein, target_fat]]
    distances, indices = temp_model.kneighbors(target_meal)

    results = []
    for idx in indices[0]:
        row = filtered_df.iloc[idx]
        results.append({
            "id": int(row['fo_num']),
            "menu": row['fo_name'],
            "original_menu": row['fo_name'], 
            "kcal": int(row['fo_kcal']),
            "carbs": int(row['fo_carbs']),
            "protein": int(row['fo_protein']),
            "fat": int(row['fo_fat']),
            "sodium": int(row['fo_natrium']),
            "tags": [row['fo_type'], "AI 정밀분석"]
        })
    return results


# ==========================================
# AI 하이브리드 식단 추천
# ==========================================
def get_hybrid_diet_recommendation(
    target_kcal,
    target_carbs,
    target_protein,
    target_fat,
    diet_type,
    persona_mode="비즈니스"  
):
    top_foods = get_best_diets(target_kcal, target_carbs, target_protein, target_fat, diet_type, num_samples=20)
    selected_foods = random.sample(top_foods, min(5, len(top_foods)))
    roles = ["옵션 1", "옵션 2", "옵션 3", "옵션 4", "옵션 5"]
    
    for i, food in enumerate(selected_foods):
        food["meal_time"] = roles[i] if i < len(roles) else f"옵션 {i+1}"
        food["ai_comment"] = "건강한 식단입니다."
        food["main_ingredient"] = "기본" 

    if USE_GEMINI and client and len(selected_foods) >= 1:
        try:
            prompt = f"""
당신은 '{persona_mode}' 페르소나를 가진 냠냠플래닛의 수석 영양 코치입니다.
사용자의 목표({diet_type})에 맞춰서 아래 5가지 메뉴를 무작위로 골랐습니다.

[오늘의 선정 메뉴]
"""
            for food in selected_foods:
                prompt += f"- {food['meal_time']}: {food['original_menu']} ({food['kcal']}kcal)\n"

            prompt += f"""
이 메뉴들을 바탕으로 각 메뉴별로 먹음직스러운 '메뉴명(menu)', '{persona_mode}' 말투의 '코멘트(ai_comment)', 그리고 이미지 매핑을 위한 '핵심 재료(main_ingredient)'를 작성해주세요.

결과를 반드시 아래 JSON 배열 형식으로만 출력하세요 (5개 전부 작성):
[
  {{
    "meal_time": "옵션 1",
    "menu": "(원래 메뉴명을 더 맛있게 포장한 이름)",
    "main_ingredient": "(닭가슴살, 연어, 소고기, 돼지고기, 두부, 샐러드, 계란, 고구마 중 가장 가까운 식재료 단어 1개)",
    "ai_comment": "({persona_mode} 말투로 작성된 1줄 추천 멘트)"
  }},
  ... (옵션 5까지 작성) ...
]
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.8
                )
            )

            text = response.text.strip().replace("```json", "").replace("```", "")
            ai_data_list = json.loads(text)

            for ai_data in ai_data_list:
                for food in selected_foods:
                    if food["meal_time"] == ai_data.get("meal_time"):
                        food["menu"] = ai_data.get("menu", food["original_menu"])
                        food["ai_comment"] = ai_data.get("ai_comment", food["ai_comment"])
                        food["main_ingredient"] = ai_data.get("main_ingredient", "기본") 

            print(f"🤖 [Gemini] 5가지 옵션 작명 및 재료 추출 성공!")

        except Exception as e:
            print(f"⚠️ [Gemini] 5가지 호출 실패 (기본값으로 응답합니다): {e}")

    for food in selected_foods:
        if food["meal_time"] not in food["tags"]:
            food["tags"] = [food["meal_time"]] + food["tags"]

    return selected_foods

# ==========================================
# 두 좌표 사이의 기울기(각도)를 계산하는 함수
# ==========================================
def calculate_angle(p1, p2):
    dy = p2.y - p1.y
    dx = p2.x - p1.x
    angle = abs(math.degrees(math.atan2(dy, dx)))
    
    if angle > 90:
        angle = 180 - angle
        
    return angle


# ==========================================
# 🦴 눈바디 AI 함수 1 (뼈대 자세 분석 및 Gemini 코칭)
# ==========================================
def analyze_pose(image_bytes):
    if not USE_MEDIAPIPE:
        print("⚠️ 자세 분석 기능을 건너뛰고 원본 이미지를 반환합니다.")
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        _, buffer = cv2.imencode('.jpg', img)
        return {
            "image_base64": base64.b64encode(buffer).decode('utf-8'),
            "score_data": None
        }

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(img_rgb)
    score_data = None

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]

        shoulder_angle = calculate_angle(left_shoulder, right_shoulder)
        hip_angle = calculate_angle(left_hip, right_hip)

        shoulder_score = max(0, 100 - (shoulder_angle * 3))
        hip_score = max(0, 100 - (hip_angle * 3))
        total_score = (shoulder_score + hip_score) / 2

        # 1. 상태 판별 (방향 포함)
        shoulder_status = "좌우 대칭이 완벽합니다"
        if shoulder_angle > 3:
            shoulder_status = "왼쪽 어깨가 올라감" if left_shoulder.y < right_shoulder.y else "오른쪽 어깨가 올라감"
            
        hip_status = "좌우 대칭이 완벽합니다"
        if hip_angle > 3:
            hip_status = "왼쪽 골반이 올라감" if left_hip.y < right_hip.y else "오른쪽 골반이 올라감"

        # 🌟 2. 제미나이(Gemini)에게 동적 코칭 멘트 요청하기 🌟
        feedback = ""
        if USE_GEMINI and client:
            prompt = f"""
            당신은 다정하고 전문적인 체형 교정 AI 코치입니다.
            현재 사용자의 뼈대 분석 결과입니다:
            - 종합 자세 점수: {total_score:.1f}/100점
            - 어깨 상태: {shoulder_status} (틀어짐: {shoulder_angle:.1f}도)
            - 골반 상태: {hip_status} (틀어짐: {hip_angle:.1f}도)
            
            위 데이터를 바탕으로 사용자에게 공감과 칭찬을 건네고, 현재 틀어진 방향에 맞는 일상 생활의 습관 점검(예: 짝다리, 가방 매기 등)과 맞춤형 스트레칭 조언을 2~3줄로 다정하게 작성해주세요. 이모지를 섞어주세요.
            (마크다운 기호 없이 순수 텍스트로만 출력해주세요.)
            """
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.7)
                )
                feedback = response.text.strip()
                print("🤖 [Gemini] 뼈대 자세 교정 피드백 생성 완료!")
            except Exception as e:
                print(f"⚠️ [Gemini] 뼈대 피드백 실패: {e}")
                feedback = f"자세 점수는 {total_score:.1f}점입니다. 어깨: {shoulder_status}, 골반: {hip_status} 🏃‍♂️"
        else:
            feedback = f"자세 점수는 {total_score:.1f}점입니다. 어깨: {shoulder_status}, 골반: {hip_status} 🏃‍♂️"

        score_data = {
            "shoulder_score": round(shoulder_score, 1),
            "hip_score": round(hip_score, 1),
            "total_score": round(total_score, 1),
            "feedback": feedback
        }

        mp_drawing.draw_landmarks(
            img,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2)
        )
        print(f"✅ [AI] 뼈대 분석 완료! (종합 점수: {total_score:.1f}점)")
    else:
        print("⚠️ [AI] 사람을 인식하지 못했습니다.")

    _, buffer = cv2.imencode('.jpg', img)
    return {
        "image_base64": base64.b64encode(buffer).decode('utf-8'),
        "score_data": score_data
    }


# ==========================================
# 👤 눈바디 AI 함수 2 (실루엣 바디라인 분석 및 Gemini 코칭)
# ==========================================
def extract_outline(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    img_bgr = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    
    score_data = None
    
    if USE_MEDIAPIPE:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = pose.process(img_rgb)
        
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            l_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            r_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
            l_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
            r_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
            
            shoulder_width = math.sqrt((l_shoulder.x - r_shoulder.x)**2 + (l_shoulder.y - r_shoulder.y)**2)
            hip_width = math.sqrt((l_hip.x - r_hip.x)**2 + (l_hip.y - r_hip.y)**2)
            
            if shoulder_width > 0:
                body_ratio = round((hip_width / shoulder_width) * 100, 1)
            else:
                body_ratio = 100.0

            # 🌟 2. 제미나이(Gemini)에게 바디라인(실루엣) 코칭 멘트 요청하기 🌟
            feedback = ""
            if USE_GEMINI and client:
                prompt = f"""
                당신은 다정하고 긍정적인 다이어트 AI 코치입니다.
                사용자의 눈바디 실루엣 분석 결과, 어깨 너비 대비 허리/골반 너비 비율이 {body_ratio}% 로 측정되었습니다.
                (참고: 90% 이상은 일자 체형, 80%대는 표준, 70% 이하는 모래시계/역삼각형 체형에 가깝습니다.)
                
                이 비율을 바탕으로, 현재 체형의 매력을 칭찬해주고, 허리 라인을 더 예쁘게 다듬기 위한 맞춤형 추천 운동(예: 코어, 유산소, 옆구리 스트레칭 등)이나 식단 팁을 2~3줄로 다정하게 조언해주세요. 이모지를 적절히 섞어주세요.
                (마크다운 기호 없이 순수 텍스트로만 출력해주세요.)
                """
                try:
                    response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=prompt,
                        config=types.GenerateContentConfig(temperature=0.75)
                    )
                    feedback = response.text.strip()
                    print("🤖 [Gemini] 실루엣 바디라인 피드백 생성 완료!")
                except Exception as e:
                    print(f"⚠️ [Gemini] 실루엣 피드백 실패: {e}")
                    feedback = f"어깨 대비 허리 비율은 {body_ratio}% 입니다. 훌륭한 라인을 유지하고 계시네요! 👗"
            else:
                feedback = f"어깨 대비 허리 비율은 {body_ratio}% 입니다. 훌륭한 라인을 유지하고 계시네요! 👗"

            score_data = {
                "body_ratio": body_ratio,
                "feedback": feedback,
                "total_score": body_ratio
            }
            print(f"✅ [AI] 실루엣 및 바디 비율 분석 완료! (비율: {body_ratio}%)")

    _, buffer = cv2.imencode('.jpg', img_bgr)
    return {
        "image_base64": base64.b64encode(buffer).decode('utf-8'),
        "score_data": score_data
    }


# ==========================================
# 🌟 AI 3줄 요약 + 다이내믹 페르소나 피드백 생성 (식단용)
# ==========================================

def generate_daily_feedback(grade, current_kcal, target_kcal, carbs, protein, fat, sodium, persona_mode="다정"):
    if USE_GEMINI and client:
        try:
            # 1. 모드별 페르소나(말투) 설정
            persona_instruction = ""
            if persona_mode == "다정":
                persona_instruction = "당신은 다정하고 따뜻한 천사 영양 코치 '로로'입니다. 유저를 항상 응원하고 칭찬하며, 예쁜 이모지를 많이 사용하세요. (~해요, ~해볼까요?)"
            elif persona_mode == "팩폭":
                persona_instruction = "당신은 수치(팩트)를 기반으로 뼈를 때리는 엄격한 호랑이 코치입니다. 유저의 변명을 차단하고, 식단의 문제점을 냉정하고 날카롭게 지적하세요. 위로보다는 채찍질을 합니다. (~입니다, ~하세요.)"
            elif persona_mode == "열혈":
                persona_instruction = "당신은 근성장과 운동을 사랑하는 열혈 헬스 트레이너입니다. 유저를 '회원님!'이라고 부르며, 단백질 섭취와 에너지를 강조하는 파이팅 넘치는 말투를 사용하세요. 불타는 이모지를 즐겨 씁니다. (~하십쇼!, ~가보자고!)"
            elif persona_mode == "츤데레":
                persona_instruction = "당신은 무심하고 틱틱대지만 속으로는 유저를 챙기는 츤데레 코치입니다. 귀찮은 척하면서도 영양학적으로 완벽한 조언을 해줍니다. 칭찬할 때도 퉁명스럽게 말하세요. (~든가, ~하든지. 딱히 널 위해 말하는 건 아니야.)"
            else:
                persona_instruction = "당신은 다정하고 친절한 영양 코치입니다."

            # 2. 제미나이에게 던질 프롬프트 구성
            prompt = f"""
{persona_instruction}
사용자의 식단 기록을 분석하여, 당신의 페르소나에 완벽하게 빙의해서 평가를 작성해주세요.

[오늘의 식단 데이터]
- 달성 등급: {grade}
- 섭취 칼로리: {current_kcal} kcal (목표: {target_kcal} kcal)
- 탄수화물: {carbs}g, 단백질: {protein}g, 지방: {fat}g, 나트륨: {sodium}mg

[작성 가이드]
결과를 반드시 아래 JSON 형식으로만 출력하세요.
{{
  "grade_message": "(당신의 페르소나 말투로 작성한 1줄짜리 등급 총평. {grade}등급에 대한 직관적인 반응)",
  "ai_feedback": "(당신의 페르소나 말투로 작성한 상세 피드백. 줄바꿈 \\n 을 사용해 2~3줄로 작성. 칼로리와 탄단지 수치에 대한 구체적인 언급 필수)"
}}
"""
            # 3. JSON 무조건 강제 출력 설정
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json", 
                    temperature=0.8
                )
            )
            
            # JSON 텍스트 파싱
            text = response.text.strip().replace("```json", "").replace("```", "")
            result_data = json.loads(text)
            print(f"🤖 [Gemini] {persona_mode} 모드 피드백 생성 성공!")
            return result_data
            
        except Exception as e:
            print(f"⚠️ [Gemini] 피드백 생성 실패 (기본값 대체): {e}")

    # 4. 🛡️ AI 실패 시 작동하는 안전망(Fallback) 로직
    return {
        "grade_message": f"{grade}등급: 분석을 완료했어요! 📊",
        "ai_feedback": "현재 AI 코치에게 맞춤 응답을 받아오지 못했습니다.\n하지만 탄단지 비율을 잘 맞춰주시면 목표에 금방 다가갈 수 있어요! 💪"
    }
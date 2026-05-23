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

# 💡 만약 터미널을 껐다 켜도 환경변수 인식이 안 된다면, 
# 아래 따옴표 안에 새로 발급받은 API 키를 직접 붙여넣으세요! (최후의 수단)
load_dotenv("password.env") 

# 불러온 변수들 중에서 GEMINI_API_KEY 값을 찾아서 변수에 쏙 넣습니다.
GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")

if GOOGLE_AI_API_KEY:
    try:
        client = genai.Client(api_key=GOOGLE_AI_API_KEY)
        USE_GEMINI = True
        
        # 🌟 내가 넣은 키가 맞는지 확인하기 위한 앞 10자리 출력 로직
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

# 로컬(localhost)일 때는 root 계정, 실서버(AWS)일 때는 yummy 계정 사용
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
# 식단 추천 로직 함수 (3끼 무작위 추출로 업그레이드!)
# ==========================================

def get_best_diets(
    target_kcal,
    target_carbs,
    target_protein,
    target_fat,
    diet_type,
    num_samples=15 # 🌟 상위 15개를 넉넉하게 뽑아옵니다
):
    if diet_type != "맞춤 식단":
        filtered_df = df_food[df_food['fo_type'] == diet_type]
    else:
        filtered_df = df_food

    if filtered_df.empty:
        filtered_df = df_food

    temp_features = filtered_df[['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat']]
    
    # DB에 데이터가 부족할 경우를 대비한 안전장치
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
            "original_menu": row['fo_name'], # 제미나이에게 알려줄 원본 이름 보관
            "kcal": int(row['fo_kcal']),
            "carbs": int(row['fo_carbs']),
            "protein": int(row['fo_protein']),
            "fat": int(row['fo_fat']),
            "sodium": int(row['fo_natrium']),
            "tags": [row['fo_type'], "AI 정밀분석"]
        })
    return results


# ==========================================
# AI 하이브리드 식단 추천 (아침, 점심, 저녁 3끼 오마카세)
# ==========================================

def get_hybrid_diet_recommendation(
    target_kcal,
    target_carbs,
    target_protein,
    target_fat,
    diet_type
):
    # 1. DB에서 영양소가 맞는 후보군 최대 15개 찾기
    top_foods = get_best_diets(target_kcal, target_carbs, target_protein, target_fat, diet_type, num_samples=15)
    
    # 2. 그중에서 겹치지 않게 무작위로 3개 쏙쏙 뽑기
    selected_foods = random.sample(top_foods, min(3, len(top_foods)))
    roles = ["아침", "점심", "저녁"]
    
    # 기본 역할(태그) 부여
    for i, food in enumerate(selected_foods):
        food["meal_time"] = roles[i] if i < len(roles) else "간식"
        food["ai_comment"] = f"건강한 {food['meal_time']} 식단입니다." # AI 실패 시 땜빵용

    # 3. Gemini AI 호출 (3끼 한 방에 처리!)
    if USE_GEMINI and client and len(selected_foods) >= 1:
        try:
            prompt = f"""
너는 냠냠플래닛의 센스있고 다정한 다이어트 전문 수석 셰프야.
사용자가 '{diet_type}' 목표를 위해 하루 식단을 짜려고 해.
내가 영양학적 계산을 통해 아래와 같이 메뉴를 골랐어.

[오늘의 선정 메뉴]
"""
            for food in selected_foods:
                prompt += f"- {food['meal_time']}: {food['original_menu']} ({food['kcal']}kcal)\n"

            prompt += """
이 메뉴들을 바탕으로 하루 식단 구성을 평가하고, 각 메뉴별로 먹음직스러운 'AI 센스 네이밍(ai_name)'과 짧고 다정한 '추천 멘트(ai_comment, 1줄)'를 작성해줘.

결과를 반드시 아래 JSON 배열 형식으로만 출력해:
[
  {
    "meal_time": "아침",
    "ai_name": "(원래 메뉴명을 더 맛있게 포장한 이름)",
    "ai_comment": "(아침에 이 메뉴가 왜 좋은지 1줄 설명)"
  },
  {
    "meal_time": "점심",
    "ai_name": "(원래 메뉴명을 더 맛있게 포장한 이름)",
    "ai_comment": "(점심에 이 메뉴가 왜 좋은지 1줄 설명)"
  },
  {
    "meal_time": "저녁",
    "ai_name": "(원래 메뉴명을 더 맛있게 포장한 이름)",
    "ai_comment": "(저녁에 이 메뉴가 왜 좋은지 1줄 설명)"
  }
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

            # 4. 생성된 AI 데이터를 3개의 음식 데이터에 각각 덮어씌우기
            for ai_data in ai_data_list:
                for food in selected_foods:
                    if food["meal_time"] == ai_data.get("meal_time"):
                        food["menu"] = ai_data.get("ai_name", food["original_menu"])
                        food["ai_comment"] = ai_data.get("ai_comment", food["ai_comment"])

            print(f"🤖 [Gemini] 3끼 오마카세 작명 성공!")

        except Exception as e:
            print(f"⚠️ [Gemini] 3끼 호출 실패 (기본값으로 응답합니다): {e}")

    # 리액트 화면에 예쁘게 띄우기 위해 "아침", "점심", "저녁" 글자를 태그 맨 앞에 추가
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
    angle = math.degrees(math.atan2(dy, dx))
    return abs(angle)


# ==========================================
# 눈바디 AI 함수 (뼈대 그리기 / 실루엣 따기)
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

        feedback = "훌륭합니다! 좌우 밸런스가 아주 좋습니다. 👏"
        if shoulder_angle > 3 and hip_angle > 3:
            feedback = "어깨와 골반이 모두 조금 틀어져 있습니다. 전신 교정 스트레칭이 필요해요! 🧘‍♀️"
        elif shoulder_angle > 3:
            feedback = "어깨 비대칭이 감지되었습니다. 한쪽으로 가방을 매거나 턱을 괴는 습관을 점검해보세요. 🎒"
        elif hip_angle > 3:
            feedback = "골반이 약간 틀어져 있습니다. 다리를 꼬고 앉는 습관을 피해주세요! 🪑"

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
# 🌟 AI 3줄 요약 + 다이내믹 페르소나 피드백 생성 (Gemini)
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
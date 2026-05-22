import os
import json
from google import genai
from sklearn.neighbors import NearestNeighbors
from sqlalchemy import create_engine
from google.genai import types

import pandas as pd
import cv2
import numpy as np
import base64
import math


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
# 구글 Gemini AI 설정 (최신 SDK)
# ==========================================

GOOGLE_API_KEY = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("GOOGLE_AI_API_KEY")
    or os.getenv("GOOGLE_API_KEY")
)

if GOOGLE_API_KEY:

    try:

        client = genai.Client(api_key=GOOGLE_API_KEY)

        USE_GEMINI = True

        print("✅ [AI] 구글 Gemini 최신 SDK 연동 완료!")

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
# 식단 추천 로직 함수 (기존)
# ==========================================

def get_best_diet(
    target_kcal,
    target_carbs,
    target_protein,
    target_fat,
    diet_type
):

    if diet_type != "맞춤 식단":

        filtered_df = df_food[
            df_food['fo_type'] == diet_type
        ]

    else:

        filtered_df = df_food

    if filtered_df.empty:
        filtered_df = df_food

    temp_features = filtered_df[
        [
            'fo_kcal',
            'fo_carbs',
            'fo_protein',
            'fo_fat'
        ]
    ]

    temp_model = NearestNeighbors(
        n_neighbors=1,
        algorithm='auto'
    ).fit(temp_features)

    target_meal = [[
        target_kcal,
        target_carbs,
        target_protein,
        target_fat
    ]]

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

        "tags": [
            best_food_row['fo_type'],
            "AI 정밀분석"
        ]
    }


# ==========================================
# AI 하이브리드 식단 추천
# ==========================================

def get_hybrid_diet_recommendation(
    target_kcal,
    target_carbs,
    target_protein,
    target_fat,
    diet_type
):

    # 1. DB에서 영양소가 가장 완벽한 음식 찾기
    best_food = get_best_diet(
        target_kcal,
        target_carbs,
        target_protein,
        target_fat,
        diet_type
    )

    # 2. AI 실패 시 보여줄 기본값
    ai_name = best_food['menu']

    ai_comment = (
        "냠냠플래닛이 추천하는 "
        "영양 만점 맞춤 식단입니다!"
    )

    # 3. Gemini AI 호출
    if USE_GEMINI and client:

        try:

            prompt = f"""
너는 다정하고 전문적인 영양사야.

사용자가 '{diet_type}' 목표를 가지고 있어.

내가 영양학적으로 계산해서 찾은 메뉴는
'{best_food['menu']}' 이야.

칼로리는 {best_food['kcal']}kcal 이야.

이 메뉴를 바탕으로:

1. 먹고 싶어지는 센스 있는 메뉴 이름
2. 짧은 추천 멘트 1~2줄

을 JSON 형태로만 반환해.

예시:
{{
    "ai_name": "단백질 듬뿍 현미 닭가슴살 덮밥",
    "ai_comment": "근육 성장에 필요한 단백질이 가득해요!"
}}
"""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            text = (
                response.text
                .strip()
                .replace("```json", "")
                .replace("```", "")
            )

            ai_data = json.loads(text)

            ai_name = ai_data.get(
                "ai_name",
                best_food['menu']
            )

            ai_comment = ai_data.get(
                "ai_comment",
                ai_comment
            )

            print(f"🤖 [Gemini] 작명 성공: {ai_name}")

        except Exception as e:

            print(
                f"⚠️ [Gemini] 호출 실패 "
                f"(기본값으로 응답합니다): {e}"
            )

    # 4. 최종 결과 반환
    return {

        "id": best_food['id'],

        "menu": ai_name,

        "original_menu": best_food['menu'],

        "kcal": best_food['kcal'],

        "carbs": best_food['carbs'],

        "protein": best_food['protein'],

        "fat": best_food['fat'],

        "sodium": best_food['sodium'],

        "tags": best_food['tags'],

        "ai_comment": ai_comment
    }


# ==========================================
# 두 좌표 사이의 기울기(각도)를 계산하는 함수
# ==========================================

def calculate_angle(p1, p2):

    # 수평선을 기준으로 두 점이 얼마나 기울어져 있는지 계산

    dy = p2.y - p1.y
    dx = p2.x - p1.x

    angle = math.degrees(math.atan2(dy, dx))

    return abs(angle)  # 무조건 양수(절대값)로 반환


# ==========================================
# 눈바디 AI 함수 (뼈대 그리기 / 실루엣 따기)
# ==========================================

def analyze_pose(image_bytes):

    if not USE_MEDIAPIPE:

        print(
            "⚠️ 자세 분석 기능을 건너뛰고 "
            "원본 이미지를 반환합니다."
        )

        nparr = np.frombuffer(image_bytes, np.uint8)

        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        _, buffer = cv2.imencode('.jpg', img)

        return {
            "image_base64":
            base64.b64encode(buffer).decode('utf-8'),

            "score_data": None
        }

    nparr = np.frombuffer(image_bytes, np.uint8)

    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    results = pose.process(img_rgb)

    score_data = None

    if results.pose_landmarks:

        landmarks = results.pose_landmarks.landmark

        left_shoulder = landmarks[
            mp_pose.PoseLandmark.LEFT_SHOULDER.value
        ]

        right_shoulder = landmarks[
            mp_pose.PoseLandmark.RIGHT_SHOULDER.value
        ]

        left_hip = landmarks[
            mp_pose.PoseLandmark.LEFT_HIP.value
        ]

        right_hip = landmarks[
            mp_pose.PoseLandmark.RIGHT_HIP.value
        ]

        shoulder_angle = calculate_angle(
            left_shoulder,
            right_shoulder
        )

        hip_angle = calculate_angle(
            left_hip,
            right_hip
        )

        shoulder_score = max(
            0,
            100 - (shoulder_angle * 3)
        )

        hip_score = max(
            0,
            100 - (hip_angle * 3)
        )

        total_score = (
            shoulder_score + hip_score
        ) / 2

        feedback = (
            "훌륭합니다! "
            "좌우 밸런스가 아주 좋습니다. 👏"
        )

        if shoulder_angle > 3 and hip_angle > 3:

            feedback = (
                "어깨와 골반이 모두 조금 틀어져 있습니다. "
                "전신 교정 스트레칭이 필요해요! 🧘‍♀️"
            )

        elif shoulder_angle > 3:

            feedback = (
                "어깨 비대칭이 감지되었습니다. "
                "한쪽으로 가방을 매거나 "
                "턱을 괴는 습관을 점검해보세요. 🎒"
            )

        elif hip_angle > 3:

            feedback = (
                "골반이 약간 틀어져 있습니다. "
                "다리를 꼬고 앉는 습관을 피해주세요! 🪑"
            )

        score_data = {

            "shoulder_score":
            round(shoulder_score, 1),

            "hip_score":
            round(hip_score, 1),

            "total_score":
            round(total_score, 1),

            "feedback":
            feedback
        }

        mp_drawing.draw_landmarks(
            img,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,

            mp_drawing.DrawingSpec(
                color=(245, 117, 66),
                thickness=2,
                circle_radius=2
            ),

            mp_drawing.DrawingSpec(
                color=(245, 66, 230),
                thickness=2,
                circle_radius=2
            )
        )

        print(
            f"✅ [AI] 뼈대 분석 완료! "
            f"(종합 점수: {total_score:.1f}점)"
        )

    else:

        print("⚠️ [AI] 사람을 인식하지 못했습니다.")

    _, buffer = cv2.imencode('.jpg', img)

    return {

        "image_base64":
        base64.b64encode(buffer).decode('utf-8'),

        "score_data":
        score_data
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
            # 🌟 1. 모드별 페르소나(말투) 설정
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

            # 🌟 2. 제미나이에게 던질 프롬프트 구성
            prompt = f"""
{persona_instruction}
사용자의 식단 기록을 분석하여, 당신의 페르소나에 완벽하게 빙의해서 평가를 작성해주세요.

[오늘의 식단 데이터]
- 달성 등급: {grade}
- 섭취 칼로리: {current_kcal} kcal (목표: {target_kcal} kcal)
- 탄수화물: {carbs}g, 단백질: {protein}g, 지방: {fat}g, 나트륨: {sodium}mg

[작성 가이드]
결과를 반드시 아래 JSON 형식으로만 출력하세요. (마크다운 기호 없이 순수 JSON만)
{{
  "grade_message": "(당신의 페르소나 말투로 작성한 1줄짜리 등급 총평. {grade}등급에 대한 직관적인 반응)",
  "ai_feedback": "(당신의 페르소나 말투로 작성한 상세 피드백. 줄바꿈 \\n 을 사용해 2~3줄로 작성. 칼로리와 탄단지 수치에 대한 구체적인 언급 필수)"
}}
"""
            response = client.models.generate_content(
                model="gemini-1.5-flash",
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

    # 3. 🛡️ AI 실패 시 작동하는 안전망(Fallback) 로직
    return {
        "grade_message": f"{grade}등급: 데이터 분석 중입니다 ⏳",
        "ai_feedback": "현재 AI 코치와 연결이 지연되고 있습니다.\n잠시 후 다시 확인해주세요!"
    }
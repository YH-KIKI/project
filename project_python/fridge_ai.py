import os
import json

from dotenv import load_dotenv
from google import genai

# =========================
# 환경변수
# =========================

load_dotenv()

USE_DUMMY = True

# =========================
# Gemini Client
# =========================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# =========================
# AI 추천 생성
# =========================

def generate_ai_info(recipe, user_ingredients):

    # =================================
    # 더미 테스트 모드
    # =================================

    if USE_DUMMY:

        return {
            "reason":
                f"{recipe.rcpName} 만들기 딱 좋은 재료예요 😊",

            "hashtags": [
                "간편식",
                "집밥",
                "추천메뉴",
                "냉장고파먹기"
            ]
        }

    # =================================
    # Gemini 실제 호출
    # =================================

    prompt = f"""
너는 냠냠플래닛 AI 레시피 추천 시스템이야.

사용자 재료:
{", ".join(user_ingredients)}

추천 레시피:
{recipe.rcpName}

레시피 재료:
{recipe.rcpParts}

해야할 일:
1. 왜 이 레시피를 추천하는지 한 줄 설명
2. 해시태그 4개 생성

조건:
- 40자 이내
- 친근한 말투
- 귀엽고 자연스럽게
- 너무 AI같지 않게
- JSON만 반환

예시:

{{
  "reason": "집에 있는 재료로 간단하게 만들 수 있어요 🥪",
  "hashtags": [
    "간편식",
    "브런치",
    "든든한끼",
    "추천메뉴"
  ]
}}
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        text = response.text.strip()

        # markdown 제거
        text = text.replace("```json", "")
        text = text.replace("```", "")

        parsed = json.loads(text)

        return parsed

    except Exception as e:

        print("Gemini 오류:", e)

        return {
            "reason":
                "집에 있는 재료로 만들 수 있어요 😊",

            "hashtags": [
                "간편식",
                "집밥",
                "추천메뉴",
                "한끼"
            ]
        }
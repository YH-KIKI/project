import os
import json

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel, Field
from typing import List

# =========================
# 환경변수
# =========================

load_dotenv()

USE_DUMMY = True;

# =========================
# Gemini Client
# =========================

client = genai.Client(
    # api_key="사용키"
    api_key=os.getenv("GOOGLE_AI_API_KEY")
)

# =========================
# Gemini 응답 스키마
# =========================

class RecipeRecommendation(BaseModel):

    rcpNum: int = Field(
        description="레시피 번호"
    )

    reason: str = Field(
        description="추천 이유"
    )

    hashtags: List[str] = Field(
        description="해시태그 4개"
    )

class RecommendationResponse(BaseModel):

    recommendations: List[RecipeRecommendation]

# =========================
# AI 추천 생성
# =========================

def generate_ai_info(recipes, user_ingredients):

    # =================================
    # 더미 테스트 모드
    # =================================

    if USE_DUMMY:

        result = []

        for r in recipes:

            result.append({
                "rcpNum": r.rcpNum,
                "aiReason": f"{r.rcpName} 만들기 딱 좋아요 😊",
                "hashtags": [
                    "간편식",
                    "집밥",
                    "추천메뉴",
                    "냉장고파먹기"
                ]
            })

        return result

    # =================================
    # 레시피 문자열 생성
    # =================================

    recipe_contents = []

    for r in recipes:

        recipe_contents.append(
            f"- 번호:{r.rcpNum}, 이름:{r.rcpName}, 재료:{str(r.rcpParts)[:100]}"
        )

    recipe_string = "\n".join(recipe_contents)

    # =================================
    # 프롬프트
    # =================================

    prompt = f"""
사용자 재료:
{", ".join(user_ingredients)}

레시피 목록:
{recipe_string}

각 레시피마다:
- 추천 이유 1줄
- 해시태그 4개

조건:
- 친근한 말투
- 40자 이내
- JSON만 반환
"""

    # =================================
    # Gemini 호출
    # =================================

    try:

        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )

        text = response.text.strip()

        text = text.replace("```json", "")
        text = text.replace("```", "").strip()

        parsed_data = json.loads(text)

        return parsed_data["recommendations"]

    except Exception as e:

        print("Gemini 오류:", e)

        result = []

        for r in recipes:

            result.append({
                "rcpNum": r.rcpNum,
                "aiReason": f"{r.rcpName} 만들기 딱 좋아요 😊",
                "hashtags": [
                    "간편식",
                    "집밥",
                    "추천메뉴",
                    "한끼"
                ]
            })

        return result
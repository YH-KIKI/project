import os
from google import genai

USE_GEMINI = False  # 나중에 AI 쓰고 싶으면 True

client = None

if USE_GEMINI:

    api_key = (
        os.getenv("GEMINI_API_KEY")
        or os.getenv("GOOGLE_AI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
    )

    if not api_key:
        raise ValueError("Gemini API KEY 없음")

    client = genai.Client(api_key=api_key)


def generate_rule_feedback(meal_type, kcal, carbs, protein, fat, sodium):

    if kcal < 300:
        return f"{meal_type}은 조금 가볍게 드셨네요! 단백질 반찬을 더해보는 건 어떨까요? 🍳"

    if kcal > 900:
        return f"{meal_type}은 든든하게 드셨어요! 다음 끼니는 조금 가볍게 조절해봐요 🌿"

    if carbs < 30:
        return f"{meal_type}은 탄수화물이 조금 부족해요! 밥이나 고구마를 곁들여보세요 🍚"

    if carbs > 120:
        return f"{meal_type}은 탄수화물이 많은 편이에요! 다음 끼니는 조금 가볍게 먹어봐요 🌾"

    if protein < 10:
        return f"{meal_type}은 단백질이 조금 부족해요! 계란이나 두부를 곁들여보세요 🥚"

    if sodium > 800:
        return f"{meal_type}은 나트륨이 높은 편이에요! 물을 충분히 마셔주세요 💧"

    if fat > 30:
        return f"{meal_type}은 지방 함량이 조금 높아요! 채소를 함께 먹으면 좋아요 🥗"

    return f"{meal_type}은 영양 균형이 좋아요! 지금처럼 골고루 챙겨보세요 ✨"


def generate_meal_feedback(meal_type, kcal, carbs, protein, fat, sodium):

    print("🔥 meal_feedback 실행됨")

    if not USE_GEMINI or client is None:
        return generate_rule_feedback(
            meal_type,
            kcal,
            carbs,
            protein,
            fat,
            sodium
        )

    prompt = f"""
너는 냠냠플래닛 AI 식단 코치야.

식사:{meal_type}
칼로리:{kcal}
탄수화물:{carbs}
단백질:{protein}
지방:{fat}
나트륨:{sodium}

한줄 피드백:
- 60자 이내
- 친근한 말투
- 이모지 1개
"""

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return response.text.strip()

    except Exception as e:

        print("Gemini 오류:", e)

        return generate_rule_feedback(
            meal_type,
            kcal,
            carbs,
            protein,
            fat,
            sodium
        )
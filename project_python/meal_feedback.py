import os
from google import genai


USE_GEMINI = False  # 나중에 AI 쓰고 싶으면 True

api_key = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("GOOGLE_AI_API_KEY")
    or os.getenv("GOOGLE_API_KEY")
)

# 테스트용으로 직접 넣고 싶으면 위 대신 아래 사용
# api_key = ""

if USE_GEMINI and api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None


def generate_rule_feedback(meal_type, kcal, carbs, protein, fat, sodium):
    kcal = float(kcal or 0)
    carbs = float(carbs or 0)
    protein = float(protein or 0)
    fat = float(fat or 0)
    sodium = float(sodium or 0)

    messages = []

    if protein < 10:
        messages.append("단백질이 조금 부족해서 계란·두부·닭가슴살 같은 반찬을 더하면 좋아요")
    elif protein >= 25:
        messages.append("단백질은 꽤 잘 챙겼어요")

    if sodium > 900:
        messages.append("나트륨이 높은 편이라 다음 끼니는 국물이나 짠 반찬을 줄이면 좋아요")
    elif sodium < 400:
        messages.append("나트륨은 과하지 않게 잘 조절됐어요")

    if kcal < 300:
        messages.append("전체 양이 가벼운 편이라 다음 끼니는 조금 더 든든하게 챙겨도 괜찮아요")
    elif kcal > 850:
        messages.append("칼로리가 높은 편이라 다음 끼니는 채소 위주로 가볍게 맞춰봐요")

    if carbs > 100:
        messages.append("탄수화물이 많은 편이라 다음엔 밥·면 양을 살짝 줄여도 좋아요")
    elif carbs < 30 and kcal >= 300:
        messages.append("탄수화물이 적은 편이라 활동량이 많다면 밥이나 고구마를 조금 더해도 좋아요")

    if fat > 30:
        messages.append("지방이 높은 편이라 다음 끼니는 굽거나 찐 메뉴가 잘 맞아요")

    if not messages:
        return f"{meal_type}은 전체 균형이 좋아요! 다음 끼니도 단백질과 채소를 함께 챙겨봐요 ✨"

    main = messages[0]

    if len(messages) >= 2:
        sub = messages[1]
        return f"{meal_type}은 {main}. {sub} 😊"

    return f"{meal_type}은 {main} 😊"


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
너는 냠냠플래닛의 AI 식단 코치야.

아래 식사의 영양 정보를 보고 사용자에게 한 줄 피드백을 작성해.

식사 종류: {meal_type}
칼로리: {kcal} kcal
탄수화물: {carbs} g
단백질: {protein} g
지방: {fat} g
나트륨: {sodium} mg

작성 기준:
- 실제 영양소 수치를 근거로 피드백해
- 부족하거나 과한 영양소를 1개 이상 언급해
- 다음 식사에서 어떻게 조절하면 좋은지 포함해
- 너무 딱딱한 의학 조언 말고 따뜻한 코치 말투로 작성해
- 50자 이상 90자 이내
- 이모지는 1개만 사용
- 한 문장으로 작성
- JSON 말고 문장만 반환
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
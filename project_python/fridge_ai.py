import os
import json
import os
from google import genai


USE_DUMMY = True

client = None

if not USE_DUMMY:
    client = genai.Client(
        api_key=os.getenv("GOOGLE_AI_API_KEY")
        # api_key=""
    )


def clean_hashtags(tags):
    cleaned = []

    for tag in tags:
        tag = str(tag).replace("#", "").strip()

        if tag:
            cleaned.append(tag)

    while len(cleaned) < 4:
        cleaned.append("추천메뉴")

    return cleaned[:4]


def get_value(obj, name, default=0):
    if isinstance(obj, dict):
        return obj.get(name, default) or default

    return getattr(obj, name, default) or default


def generate_ai_info(recipes, user_ingredients, nutrition=None):

    if USE_DUMMY:
        return make_fallback_result(recipes)

    nutrition = nutrition or {}

    recipe_contents = []

    for r in recipes:
        recipe_contents.append(
            f"""
- 번호:{get_value(r, "rcpNum")}
  이름:{get_value(r, "rcpName", "")}
  재료:{str(get_value(r, "rcpParts", ""))[:120]}
  칼로리:{get_value(r, "rcpKcal")}kcal
  탄수화물:{get_value(r, "rcpCarbs")}g
  단백질:{get_value(r, "rcpProtein")}g
  지방:{get_value(r, "rcpFat")}g
  나트륨:{get_value(r, "rcpNatrium")}mg
"""
        )

    recipe_string = "\n".join(recipe_contents)

    prompt = f"""
너는 냠냠플래닛의 AI 냉장고 레시피 추천 담당이야.

사용자가 입력한 냉장고 재료:
{", ".join(user_ingredients)}

사용자의 오늘 섭취 현황:
- 목표 칼로리: {nutrition.get("targetKcal", 0)} kcal
- 현재 칼로리: {nutrition.get("currentKcal", 0)} kcal
- 목표 탄수화물: {nutrition.get("targetCarbs", 0)} g
- 현재 탄수화물: {nutrition.get("currentCarbs", 0)} g
- 목표 단백질: {nutrition.get("targetProtein", 0)} g
- 현재 단백질: {nutrition.get("currentProtein", 0)} g
- 목표 지방: {nutrition.get("targetFat", 0)} g
- 현재 지방: {nutrition.get("currentFat", 0)} g
- 목표 나트륨: {nutrition.get("targetNatrium", 0)} mg
- 현재 나트륨: {nutrition.get("currentNatrium", 0)} mg

추천 후보 레시피:
{recipe_string}

추천 기준:
1. 사용자가 가진 재료와 잘 맞는 레시피를 우선 추천해.
2. 오늘 부족한 영양소를 보완할 수 있는 메뉴를 좋게 평가해.
3. 단백질이 부족하면 단백질 보충 관점으로 추천해.
4. 칼로리가 이미 높으면 가볍게 먹기 좋은 이유를 설명해.
5. 나트륨이 높으면 짜지 않게 조절하면 좋다는 식으로 자연스럽게 말해.
6. 추천 이유는 냠냠플래닛 톤에 맞게 따뜻하고 귀엽게 작성해.

반드시 아래 JSON 형식으로만 반환해.

{{
  "recommendations": [
    {{
      "rcpNum": 1,
      "reason": "냉장고 재료를 활용하면서 부족한 단백질도 채우기 좋아요.",
      "hashtags": ["단백질보충", "냉장고파먹기", "든든한한끼", "균형식"]
    }}
  ]
}}

조건:
- 각 레시피마다 하나씩 생성
- reason은 35자 이상 70자 이내
- hashtags는 정확히 4개
- hashtags에는 # 기호 절대 넣지 말 것
- hashtags는 짧은 한국어 단어로만 작성
- JSON 외 텍스트 금지
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )

        text = response.text.strip()
        text = text.replace("```json", "").replace("```", "").strip()

        parsed_data = json.loads(text)

        if isinstance(parsed_data, list):
            recommendations = parsed_data
        else:
            recommendations = parsed_data.get("recommendations", [])

        result = []

        for item in recommendations:
            result.append({
                "rcpNum": item.get("rcpNum"),
                "aiReason": item.get(
                    "reason",
                    "냉장고 재료를 활용하기 좋은 추천 메뉴예요 😊"
                ),
                "hashtags": clean_hashtags(
                    item.get(
                        "hashtags",
                        ["추천메뉴", "집밥", "냉장고파먹기", "한끼"]
                    )
                )
            })

        return result

    except Exception as e:
        print("Gemini 오류:", e)
        return make_fallback_result(recipes)


def make_fallback_result(recipes):
    result = []

    for r in recipes:
        result.append({
            "rcpNum": get_value(r, "rcpNum"),
            "aiReason": f"{get_value(r, 'rcpName', '이 메뉴')}는 냉장고 재료로 만들기 좋고 한 끼로도 든든해요 😊",
            "hashtags": [
                "간편식",
                "집밥",
                "추천메뉴",
                "한끼"
            ]
        })

    return result
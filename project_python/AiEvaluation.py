import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from google import genai
from google.genai import types

app = FastAPI()

# 리액트(3000)에서 접근할 수 있도록 CORS 대문 열기
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 구글 제미나이 클라이언트 초기화
# 환경변수에 없으면 'AIzaSy...' 구글 진짜 키 문자열을 직접 두 번째 인자에 넣으세요!
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', '사용자님의_진짜_구글_GEMINI_API_KEY')
client = genai.Client(api_key=GOOGLE_API_KEY)
MODEL_NAME = "gemini-2.5-flash"

@app.post("/api/ai/evaluate")
async def evaluate_meal(request: Request):
    payload = await request.json()
    
    # 리액트가 8001번 포트로 쏴준 영양소 상자 데이터 열기
    meal_result = payload.get("mealResult", {})
    meal_target = payload.get("mealTarget", {})
    meal_type = payload.get("mealType", "식사")
    user_model = payload.get("userModel", "2")
    user_name = payload.get("userName", "회원")

    # 가입할 때 고른 모드 한글 매핑
    model_name_kr = {"1": "다이어트", "2": "건강유지", "3": "근육증량", "4": "저탄고지"}.get(user_model, "건강유지")

    # 냥이 영양사 가이드라인과 정체성(페르소나) 주입
    system_instruction = (
        "당신은 세상에서 가장 친절하고 귀여운 '냥이 영양사'입니다. "
        "말투는 '~했냥?', '~다냥!', '웅웅!' 같은 고양이 말투를 필수적으로 사용해야 합니다."
    )

    prompt = f"""
    [현재 사용자의 식단 상황]
    - 사용자 이름: {user_name}
    - 끼니 종류: {meal_type}
    - 목표 모드: {model_name_kr}

    [영양소 데이터 (실제 먹은 양 / 권장 목표량)]
    - 에너지(칼로리): {meal_result.get('kcal', 0)} / {meal_target.get('kcal', 0)} kcal
    - 탄수화물: {meal_result.get('carbs', 0)} / {meal_target.get('carbs', 0)} g
    - 단백질: {meal_result.get('protein', 0)} / {meal_target.get('protein', 0)} g
    - 지방: {meal_result.get('fat', 0)} / {meal_target.get('fat', 0)} g

    [요구사항]
    위 수치를 꼼꼼히 분석해서 {user_name}님이 방금 먹은 {meal_type} 식단에 대해 고양이 말투로 잘했으면 칭찬, 부족하거나 넘치면 귀엽게 잔소리를 3문장 이내로 짧고 강력하게 피드백해줘냥! 모드({model_name_kr})에 맞는 영양 팁도 하나 섞어라냥!
    """

    # Gemini API 호출
    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[prompt],
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.75
        )
    )

    return {"aiComment": response.text}

# 기존 YOLO(8000포트)와 안 겹치도록 8001번 포트로 독립 가동합니다!
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
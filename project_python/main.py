# main.py
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel # 🌟 새로 추가됨: 데이터 모델링용
from fastapi.middleware.cors import CORSMiddleware # 식단 피드백용

# 🌟 눈바디 분석 함수(analyze_pose, extract_outline) 및 피드백 함수(generate_daily_feedback) 불러오기
from schemas import UserInfo
from ai_service import get_hybrid_diet_recommendation, analyze_pose, extract_outline, generate_daily_feedback
# 대빵 - 식단 피드백 함수 
from meal_feedback import generate_meal_feedback
from fridge_ai import generate_ai_info

import os
import uvicorn
from google.genai import types

# Analyze.py 파일에서 필요한 로봇과 함수들을 쏙 뽑아오기!
from Analyze import get_food_predictions, client, MODEL_NAME

os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
app = FastAPI()

# 대빵 - 식단 피드백용 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 🌟 [새로 추가됨] AI 피드백을 받기 위한 데이터 형식
# ==========================================
class DietFeedbackRequest(BaseModel):
    userNum: int
    grade: str
    currentKcal: int
    targetKcal: int
    carbs: int
    protein: int
    fat: int
    sodium: int


# ==========================================
# 대빵 - 식단피드백 / 냉장고용 리퀘스트
# ==========================================
class MealFeedbackRequest(BaseModel):
    mealType: str
    kcal: int
    carbs: float
    protein: float
    fat: float
    sodium: float

class FridgeRecipeItem(BaseModel):
    rcpNum: int
    rcpName: str
    rcpParts: str

class FridgeRecommendRequest(BaseModel):

    ingredients: list[str]
    recipes: list[FridgeRecipeItem]

# ==========================================
# 1. AI 식단 추천 엔드포인트
# ==========================================
@app.post("/api/ai/recommend")
async def ai_recommend(user: UserInfo):
    print(f"🔥 [Python] 식단 추천 요청 도착! 유저번호: {user.userNum}")
    
    best_food = get_hybrid_diet_recommendation(
        target_kcal = user.targetCalorie / 3,
        target_carbs = user.carbs / 3,
        target_protein = user.protein / 3,
        target_fat = user.fat / 3,
        diet_type = user.type 
    )   
    
    print(f"🤖 AI 추천 식단: {best_food['menu']}")

    return [{
        "id": best_food["id"],
        "menu": best_food["menu"],
        "original_menu": best_food.get("original_menu", ""), # 추가됨
        "kcal": best_food["kcal"],
        "carbs": best_food["carbs"],
        "protein": best_food["protein"],
        "fat": best_food["fat"],
        "sodium": best_food["sodium"],
        "tags": best_food["tags"] + ["AI 정밀분석"],
        "aiComment": best_food.get("ai_comment", "") # 추가됨
    }]


# ==========================================
# 2. AI 눈바디 분석 엔드포인트 (기존)
# ==========================================
@app.post("/api/ai/bodycheck")
async def bodycheck_service(
    file: UploadFile = File(...),
    analyzeType: str = Form(...),
    userNum: int = Form(...)
):
    print(f"📸 [Python] 눈바디 사진 도착! 타입: {analyzeType}, 유저: {userNum}")
    
    image_bytes = await file.read()
    
    img_base64 = ""
    score_data = None # 추가됨
    
    if analyzeType == 'pose':
        result = analyze_pose(image_bytes)
        # 딕셔너리로 반환된 경우 분기 처리 추가
        if isinstance(result, dict):
            img_base64 = result["image_base64"]
            score_data = result.get("score_data")
        else:
            img_base64 = result
    elif analyzeType == 'outline':
        img_base64 = extract_outline(image_bytes)
        
    return {
        "status": "success",
        "analyzeType": analyzeType,
        "image_base64": img_base64,
        "score_data": score_data # 추가됨
    }

# ==========================================
# 3. 사진 분석 테스트용 (기존 유지)
# ==========================================
@app.post("/detect")
@app.post("/detect")
async def detect_service(message: str = Form(...), file: UploadFile = File(...)):
    file_name = file.filename
    print(f"4. [Python] 테스트용 파일명: {file_name}")
    return {
        "status": "success",
        "received_message": message,
        "received_filename": file_name
    }

# ==========================================
# 🌟 4. [새로 추가됨] AI 식단 3줄 요약 피드백 엔드포인트
# ==========================================
@app.post("/api/ai/feedback")
async def daily_feedback_service(data: DietFeedbackRequest):
    print(f"📝 [Python] AI 피드백 요청 도착! 유저번호: {data.userNum}, 등급: {data.grade}")
    
    # ai_service.py의 텍스트 생성 모델 호출
    feedback_result = generate_daily_feedback(
        grade=data.grade, 
        current_kcal=data.currentKcal, 
        target_kcal=data.targetKcal, 
        carbs=data.carbs, 
        protein=data.protein, 
        fat=data.fat, 
        sodium=data.sodium
    )
    
    print(f"🤖 AI 생성 피드백:\n{feedback_result}")
    
    return {
        "status": "success",
        "feedback": feedback_result
    }



# ==========================================
# 대빵 - 밀피드백(식단기록용)
# ==========================================
@app.post("/api/ai/meal-feedback")
async def meal_feedback_service(data: MealFeedbackRequest):

    feedback = generate_meal_feedback(
        meal_type=data.mealType,
        kcal=data.kcal,
        carbs=data.carbs,
        protein=data.protein,
        fat=data.fat,
        sodium=data.sodium
    )

    return {
        "status": "success",
        "feedback": feedback
    }

# ==========================================
# 대빵 - 냉장고 AI 추천
# ==========================================

@app.post("/api/ai/fridge-recommend")
async def fridge_recommend_service(
    data: FridgeRecommendRequest
):

    results = []

    for recipe in data.recipes:

        ai_data = generate_ai_info(
            recipe,
            data.ingredients
        )

        results.append({

            "rcpNum":
                recipe.rcpNum,

            "aiReason":
                ai_data["reason"],

            "hashtags":
                ai_data["hashtags"]

        })

    return {
        "status": "success",
        "results": results
    }

# ==================================================================================
# [창구 1] 음식 사진 자동 스캔 API
# ==================================================================================
@app.post("/api/ai/predict")
async def predict(file: UploadFile = File(...)):
    print("📸 [main.py] 사진 요청 도착 -> Analyze.py로 토스한다냥!")
    img_bytes = await file.read()
    
    # Analyze.py에 정의된 사진 인식 함수를 실행해서 결과를 받아옵니다냥!
    predictions = get_food_predictions(img_bytes)
    return {"results": predictions}


# ==================================================================================
# [창구 2] 제미나이 냥이 말투 식단 평가 API (422 검사 오류 완벽 방어!)
# ==================================================================================
@app.post("/api/ai/evaluate")
async def evaluate_meal(payload: dict): # 👈 422 억까 방어용 dict 타입 고정!
    print("🐱 [main.py] 영양 분석 요청 도착 -> 제미나이 소환한다냥!")
    
    # 리액트가 쏴준 영양소 상자 데이터 열기
    meal_result = payload.get("mealResult", {})
    meal_target = payload.get("mealTarget", {})
    meal_type = payload.get("mealType", "식사")
    user_model = payload.get("userModel", "2")
    user_name = payload.get("userName", "회원")

    model_name_kr = {"1": "다이어트", "2": "건강유지", "3": "근육증량", "4": "저탄고지"}.get(user_model, "건강유지")

    system_instruction = (
        "당신은 세상에서 가장 친절하고 귀여운 '냥이 영양사'입니다. "
        "말투는 '~했냥?', '~다냥!', '웅웅!' 같은 고양이 말투를 필수적으로 사용해야 합니다."
    )

    prompt = f"""
    [현재 사용자의 식단 상황]
    - 사용자 이름: {user_name} | 끼니 종류: {meal_type} | 목표 모드: {model_name_kr}
    [영양소 데이터 (실제 먹은 양 / 권장 목표량)]
    - 에너지(칼로리): {meal_result.get('kcal', 0)} / {meal_target.get('kcal', 0)} kcal
    - 탄수화물: {meal_result.get('carbs', 0)} / {meal_target.get('carbs', 0)} g
    - 단백질: {meal_result.get('protein', 0)} / {meal_target.get('protein', 0)} g
    - 지방: {meal_result.get('fat', 0)} / {meal_target.get('fat', 0)} g
    """

    # Analyze.py에서 가져온 client와 MODEL_NAME으로 구글 호출!
    response = client.models.generate_content(
        model=MODEL_NAME, contents=[prompt],
        config=types.GenerateContentConfig(system_instruction=system_instruction, temperature=0.75)
    )

    return {"aiComment": response.text}

if __name__ == "__main__":
    import uvicorn
    # 포트는 8000번 그대로 유지, 외부 접속 허용을 위해 0.0.0.0
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
# main.py
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel # 🌟 새로 추가됨: 데이터 모델링용
from fastapi.middleware.cors import CORSMiddleware # 식단 피드백용

# 🌟 눈바디 분석 함수(analyze_pose, extract_outline) 및 피드백 함수(generate_daily_feedback) 불러오기
from schemas import UserInfo
from ai_service import get_hybrid_diet_recommendation, analyze_pose, extract_outline, generate_daily_feedback
# 대빵 - 식단 피드백 함수 
from meal_feedback import generate_meal_feedback

app = FastAPI()

# 대빵 - 식단 피드백용 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
# 대빵 - 식단피드백용 리퀘스트
# ==========================================
class MealFeedbackRequest(BaseModel):
    mealType: str
    kcal: int
    carbs: float
    protein: float
    fat: float
    sodium: float

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
@app.post("/api/v1/ai/meal-feedback")
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

if __name__ == "__main__":
    import uvicorn
    # 포트는 8000번 그대로 유지, 외부 접속 허용을 위해 0.0.0.0
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
# main.py
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel 
from fastapi.middleware.cors import CORSMiddleware # 식단 피드백용

# 눈바디 분석 함수(analyze_pose, extract_outline) 및 피드백 함수(generate_daily_feedback) 불러오기
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
# AI 피드백을 받기 위한 데이터 형식 (personaMode 추가)
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
    personaMode: str = "다정" # 기본값은 '다정'
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
async def ai_recommend(data: dict):
    try:
        user_num = data.get("userNum", 1)
        target_kcal = data.get("targetCalorie", 600) 
        carbs = data.get("carbs", 75)
        protein = data.get("protein", 45)
        fat = data.get("fat", 13)
        diet_type = data.get("type", "맞춤 식단")
        
        # 🌟 자바(스프링)가 보내준 챗봇 말투 받기! (없으면 '비즈니스' 기본값)
        persona_mode = data.get("personaMode", "비즈니스") 

        # 🌟 5개 추출 함수로 파라미터 전부 전달!
        best_foods = get_hybrid_diet_recommendation(
            target_kcal, carbs, protein, fat, diet_type, persona_mode
        )

        print(f"📝 [Python] 5가지 식단 추천 완료! (유저: {user_num}, 목표: {diet_type}, 말투: {persona_mode})")
        
        return best_foods

    except Exception as e:
        print(f"❌ [Python] 추천 시스템 에러 발생: {e}")
        return []

# ==========================================
# 2-1. AI 눈바디 분석 엔드포인트 (자세 교정) 🌟 새로 추가됨 🌟
# ==========================================
@app.post("/api/ai/bodycam/pose")
async def bodycam_pose_service(file: UploadFile = File(...)):
    print(f"📸 [Python] 자세 분석(Pose) 요청 도착!")
    image_bytes = await file.read()
    
    result = analyze_pose(image_bytes)
    
    img_base64 = ""
    score_data = None
    
    # 딕셔너리로 반환된 경우 분기 처리
    if isinstance(result, dict):
        img_base64 = result["image_base64"]
        score_data = result.get("score_data")
    else:
        img_base64 = result
        
    return {
        "status": "success",
        "analyzeType": "pose",
        "image_base64": img_base64,
        "score_data": score_data
    }
# ==========================================
# 2-2. AI 눈바디 분석 엔드포인트 (프라이빗 실루엣) 🌟 새로 추가됨 🌟
# ==========================================
@app.post("/api/ai/bodycam/outline")
async def bodycam_outline_service(file: UploadFile = File(...)):
    print(f"🕵️‍♂️ [Python] 실루엣(Outline) 및 비율 추출 요청 도착!")
    image_bytes = await file.read()
    
    # 이제 실루엣 함수도 이미지와 점수를 딕셔너리로 반환합니다.
    result = extract_outline(image_bytes)
    
    img_base64 = ""
    score_data = None
    
    if isinstance(result, dict):
        img_base64 = result["image_base64"]
        score_data = result.get("score_data")
    else:
        img_base64 = result
        
    return {
        "status": "success",
        "analyzeType": "outline",
        "image_base64": img_base64,
        "score_data": score_data # 리액트로 비율 점수 토스!
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
# AI 식단 3줄 요약 피드백 엔드포인트
# ==========================================
@app.post("/api/ai/feedback")
async def daily_feedback_service(data: DietFeedbackRequest):
    print(f"📝 [Python] AI 피드백 요청 도착! 유저번호: {data.userNum}, 등급: {data.grade}, 모드: {data.personaMode}")
    
    # ai_service.py의 텍스트 생성 모델 호출 시 페르소나 모드(persona_mode) 함께 전달
    feedback_result = generate_daily_feedback(
        grade=data.grade, 
        current_kcal=data.currentKcal, 
        target_kcal=data.targetKcal, 
        carbs=data.carbs, 
        protein=data.protein, 
        fat=data.fat, 
        sodium=data.sodium,
        persona_mode=data.personaMode
    )
    
    print(f"🤖 AI 생성 다이내믹 피드백:\n{feedback_result}")
    
    # 제미나이가 만들어준 딕셔너리(JSON)에서 타이틀과 3줄 요약을 각각 꺼내서 스프링부트로 전송
    return {
        "status": "success",
        "gradeMessage": feedback_result.get("grade_message", f"{data.grade}등급: 분석 완료!"),
        "feedback": feedback_result.get("ai_feedback", "피드백을 불러오는 데 문제가 발생했습니다.")
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

    results = generate_ai_info(
        data.recipes,
        data.ingredients
    )

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
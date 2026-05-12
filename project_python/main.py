# main.py
from fastapi import FastAPI, UploadFile, File, Form

# 🌟 눈바디 분석 함수(analyze_pose, extract_outline)도 함께 불러옵니다!
from schemas import UserInfo
from ai_service import get_best_diet, analyze_pose, extract_outline

app = FastAPI()

# ==========================================
# 1. AI 식단 추천 엔드포인트 (기존)
# ==========================================
@app.post("/api/ai/recommend")
async def ai_recommend(user: UserInfo):
    print(f"🔥 [Python] 식단 추천 요청 도착! 유저번호: {user.userNum}")
    
    best_food = get_best_diet(
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
        "kcal": best_food["kcal"],
        "carbs": best_food["carbs"],
        "protein": best_food["protein"],
        "fat": best_food["fat"],
        "sodium": best_food["sodium"],
        "tags": best_food["tags"] + ["AI 정밀분석"]
    }]


# ==========================================
# 🌟 2. [새로 추가됨] AI 눈바디 분석 엔드포인트
# ==========================================
@app.post("/api/ai/bodycheck")
async def bodycheck_service(
    file: UploadFile = File(...),
    analyzeType: str = Form(...),
    userNum: int = Form(...)
):
    print(f"📸 [Python] 눈바디 사진 도착! 타입: {analyzeType}, 유저: {userNum}")
    
    # 1. 사진 데이터를 바이트로 읽기
    image_bytes = await file.read()
    
    # 2. 분석 타입에 따라 ai_service.py의 알맞은 함수 호출
    img_base64 = ""
    if analyzeType == 'pose':
        img_base64 = analyze_pose(image_bytes)
    elif analyzeType == 'outline':
        img_base64 = extract_outline(image_bytes)
        
    # 3. 분석된 이미지를 스프링부트로 반환
    return {
        "status": "success",
        "analyzeType": analyzeType,
        "image_base64": img_base64
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8000, reload=True)
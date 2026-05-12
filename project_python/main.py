# main.py
from fastapi import FastAPI, UploadFile, File, Form

# 🌟 방금 만든 두 파일에서 필요한 클래스와 함수를 가져옵니다!
from schemas import UserInfo
from ai_service import get_best_diet

app = FastAPI()

# 1. AI 식단 추천 엔드포인트
@app.post("/api/ai/recommend")
async def ai_recommend(user: UserInfo):
    print(f"🔥 [Python] 스프링부트 요청 도착! 유저번호: {user.userNum}")
    
    # ai_service.py의 추천 함수를 호출 (1끼 기준 3으로 나눈 값을 전달)
    best_food = get_best_diet(
        target_kcal = user.targetCalorie / 3,
        target_carbs = user.carbs / 3,
        target_protein = user.protein / 3,
        target_fat = user.fat / 3,
        diet_type = user.type  # 🌟 유저가 누른 탭 이름을 추가로 전달!
    )   
    
    print(f"🤖 AI 추천 결과: {best_food['menu']}")

    # 스프링부트로 다시 예쁘게 포장해서 돌려보냄
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

# 2. 사진 분석 테스트 엔드포인트
@app.post("/detect")
async def detect_service(message: str = Form(...), file: UploadFile = File(...)):
    file_name = file.filename
    print(f"4. [Python] 받은 파일명: {file_name}")
    return {
        "status": "success",
        "received_message": message,
        "received_filename": file_name
    }

if __name__ == "__main__":
    import uvicorn
    # 터미널 명령어 대신 파이썬 파일 자체를 실행해도 서버가 켜집니다.
    uvicorn.run("main:app", port=8000, reload=True)
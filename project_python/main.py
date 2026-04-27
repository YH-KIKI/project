from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel

app = FastAPI()

@app.get("/test")
async def index():
    return {"message": "Hello FastAPI"}

# 2. Spring Boot에서 보낼 데이터 형식을 정의
class InputData(BaseModel):
    text: str

@app.post("/detect")
async def detect_service(message: str = Form(...), file: UploadFile = File(...)):
    
    # 전달받은 메시지와 파일 이름을 확인합니다.
    file_name = file.filename
    
    # 필요하다면 여기서 파일을 읽거나 AI 모델에 넘기는 로직을 작성합니다.
    # 예시: contents = await file.read()
    print("3. [Python] 스프링부트에서 넘어온 데이터 확인 👇")
    print(f" - 받은 메시지: {message}")
    print(f"4. [Python] 받은 파일명: {file_name}")
    
    # Spring Boot로 다시 돌려보낼 결과 (String.class로 받으므로 문자열 형태의 JSON 반환)
    return {
        "status": "success",
        "received_message": message,
        "received_filename": file_name
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", port=8000, reload=True)
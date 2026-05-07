from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import io
from PIL import Image
import uvicorn

app = FastAPI()

# React에서 접근할 수 있도록 허용 (CORS 설정)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 실제 서비스 시에는 localhost:3000 등 특정 주소만 허용하는 게 좋아요
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. 모델 로드
model = YOLO(r'C:\Users\C603\Documents\AWS Class\git\aws_class\python\kfood\model\뚱딴지모델.pt') 

names_ko = ['연근조림', '동치미', '잡채', '김치찌개', '김치', '갈비', '육회', '콩나물무침', '우동', '백김치', '잔치국수', '콩나물국', '설렁탕', '도라지무침', '비빔밥', '어묵탕', '부대찌개', '불고기', '총각김치', '오이김치', '컵밥', '북엇국', '양념장어구이', '볶음밥', '파김치', '고등어구이', '장조림', '제육볶음', '메밀소바', '된장국', '비빔밥(혼합밥)', '나박김치', '냉면', '깻잎장아찌', '족발', '삼겹살', '깍두기', '깍두기', '주먹밥', '김밥', '밥', '콩나물무침', '도라지무침', '고사리나물', '애호박볶음', '미역국', '김', '조개탕', '육개장', '시금치나물', '고등어조림', '멸치볶음', '열무김치']

@app.post("/ai/predict")
async def predict(file: UploadFile = File(...)):
    # 1. 받은 파일을 이미지로 변환
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes))
    
    # 2. YOLO 분석
    results = model.predict(source=img, conf=0.24)
    
    # 3. 결과 정리
    predictions = []
    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            predictions.append({
                "foodName": names_ko[cls_id],
                "confidence": round(conf * 100, 1) # 확률을 %로 변환
            })
            
    return {"results": predictions}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
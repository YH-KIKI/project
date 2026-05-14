import os
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import uvicorn

# 1. 환경 설정
os.environ['KMP_DUPLICATE_LIB_OK'] = 'True'
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- [모델 1: YOLO 뚱딴지모델 로드] ---
yolo_model = YOLO(r'C:\Users\C603\Documents\AWS Class\git\aws_class\python\kfood\model\뚱딴지모델.pt')
yolo_names = ['연근조림', '동치미', '잡채', '김치찌개', '김치', '갈비', '육회', '콩나물무침', '우동', '백김치', '잔치국수', '콩나물국', '설렁탕', '도라지무침', '비빔밥', '어묵탕', '부대찌개', '불고기', '총각김치', '오이김치', '컵밥', '북엇국', '양념장어구이', '볶음밥', '파김치', '고등어구이', '장조림', '제육볶음', '메밀소바', '된장국', '비빔밥(혼합밥)', '나박김치', '냉면', '깻잎장아찌', '족발', '삼겹살', '깍두기', '주먹밥', '김밥', '밥', '고사리나물', '애호박볶음', '미역국', '김', '조개탕', '육개장', '시금치나물', '고등어조림', '멸치볶음', '열무김치']

# --- [모델 2: PyTorch 냠냠모델 로드] ---
nyam_path = r'c:/Users/C603/Documents/AWS Class/git/aws_class/python/testfood/nyamnyam_model.pth'
checkpoint = torch.load(nyam_path)
nyam_classes = checkpoint['class_names'] # ['김밥', '떡볶이', '쌀밥', '짜장면']

nyam_model = models.resnet18()
nyam_model.fc = nn.Linear(nyam_model.fc.in_features, len(nyam_classes))
nyam_model.load_state_dict(checkpoint['model_state_dict'])
nyam_model.eval()

# 냠냠모델용 전처리
nyam_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

@app.post("/ai/predict")
async def predict(file: UploadFile = File(...)):
    img_bytes = await file.read()
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    
    all_predictions = []

    # --- YOLO 분석 ---
    yolo_results = yolo_model.predict(source=img, conf=0.24)
    for result in yolo_results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            all_predictions.append({
                "foodName": yolo_names[cls_id],
                "confidence": round(conf * 100, 1),
                "model": "YOLO_DungDanJi"
            })

    # --- PyTorch(냠냠) 분석 ---
    # (YOLO 결과가 없거나, 더 정밀한 분석을 위해 추가)
    nyam_tensor = nyam_transform(img).unsqueeze(0)
    with torch.no_grad():
        outputs = nyam_model(nyam_tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        conf, preds = torch.max(probs, 1)
        
        # 냠냠모델은 확신도가 높을 때만(예: 70% 이상) 결과에 추가
        if conf[0].item() > 0.7:
            all_predictions.append({
                "foodName": nyam_classes[preds[0]],
                "confidence": round(conf[0].item() * 100, 1),
                "model": "ResNet_NyamNyam"
            })

    # 중복 제거 또는 결과 정리 후 반환
    return {"results": all_predictions}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
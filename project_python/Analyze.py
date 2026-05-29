# Analyze.py
import os
import io
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from ultralytics import YOLO
import uvicorn
from google import genai

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --- [구글 제미나이 클라이언트 초기화] ---
# ⚠️ 중요: 뒤쪽 주석 글자 자리에 구글 AI 스튜디오에서 발급받은 진짜 API 키('AIzaSy...') 문자열을 꼭 넣어주세요냥!
api_key = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("GOOGLE_AI_API_KEY")
    or os.getenv("GOOGLE_API_KEY")
)

GOOGLE_AI_API_KEY = os.getenv('GOOGLE_AI_API_KEY')
client = genai.Client(api_key=GOOGLE_AI_API_KEY)
MODEL_NAME = "gemini-2.5-flash"


# --- [모델 1: YOLO모델 로드] ---
yolo_model_path = os.path.join(BASE_DIR, 'model', 'YOLO.pt')
yolo_model = YOLO(yolo_model_path)
yolo_names = ['연근조림', '동치미', '잡채', '김치찌개', '김치', '갈비', '육회', '콩나물무침', '우동', '백김치', '잔치국수', '콩나물국', '설렁탕', '도라지무침', '비빔밥', '어묵탕', '부대찌개', '불고기', '총각김치', '오이김치', '컵밥', '북엇국', '양념장어구이', '볶음밥', '파김치', '고등어구이', '장조림', '제육볶음', '메밀소바', '된장국', '비빔밥(혼합밥)', '나박김치', '냉면', '깻잎장아찌', '족발', '삼겹살', '깍두기', '주먹밥', '김밥', '밥', '고사리나물', '애호박볶음', '미역국', '김', '조개탕', '육개장', '시금치나물', '고등어조림', '멸치볶음', '열무김치']


# --- [모델 2: PyTorch 냠냠모델 로드] ---
nyam_path = os.path.join(BASE_DIR, 'model', 'nyamnyam_model.pth')
checkpoint = torch.load(nyam_path, map_location=torch.device('cpu'))
nyam_classes = checkpoint['class_names']

nyam_model = models.resnet18()
nyam_model.fc = nn.Linear(nyam_model.fc.in_features, len(nyam_classes))
nyam_model.load_state_dict(checkpoint['model_state_dict'])
nyam_model.eval()

nyam_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


# 📷 1. 음식 사진 인식 처리 함수
def get_food_predictions(img_bytes):
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    all_predictions = []

    # YOLO 분석
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

    # PyTorch(냠냠) 분석
    nyam_tensor = nyam_transform(img).unsqueeze(0)
    with torch.no_grad():
        outputs = nyam_model(nyam_tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        conf, preds = torch.max(probs, 1)
        if conf[0].item() > 0.7:
            all_predictions.append({
                "foodName": nyam_classes[preds[0]],
                "confidence": round(conf[0].item() * 100, 1),
                "model": "ResNet_NyamNyam"
            })

    return all_predictions


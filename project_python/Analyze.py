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
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from google import genai
from google.genai import types

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
# 파이썬 파일이 있는 현재 위치를 기준으로 모델을 찾도록 설계했습니다.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --- [모델 1: YOLO 뚱딴지모델 로드] ---
yolo_model_path = os.path.join(BASE_DIR, 'model', '뚱딴지모델.pt')
yolo_model = YOLO(yolo_model_path)
yolo_names = ['연근조림', '동치미', '잡채', '김치찌개', '김치', '갈비', '육회', '콩나물무침', '우동', '백김치', '잔치국수', '콩나물국', '설렁탕', '도라지무침', '비빔밥', '어묵탕', '부대찌개', '불고기', '총각김치', '오이김치', '컵밥', '북엇국', '양념장어구이', '볶음밥', '파김치', '고등어구이', '장조림', '제육볶음', '메밀소바', '된장국', '비빔밥(혼합밥)', '나박김치', '냉면', '깻잎장아찌', '족발', '삼겹살', '깍두기', '주먹밥', '김밥', '밥', '고사리나물', '애호박볶음', '미역국', '김', '조개탕', '육개장', '시금치나물', '고등어조림', '멸치볶음', '열무김치']

# --- [모델 2: PyTorch 냠냠모델 로드] ---
nyam_path = os.path.join(BASE_DIR, 'model', 'nyamnyam_model.pth')
checkpoint = torch.load(nyam_path, map_location=torch.device('cpu'))
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

@app.post("/api/ai/predict")
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
############################################### 평가 ##################################################################
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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
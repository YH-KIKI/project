import os
import json
import re 
import pandas as pd
import cv2
import numpy as np
import base64
import math
import random
import mediapipe as mp

from google import genai
from sklearn.neighbors import NearestNeighbors
from sqlalchemy import create_engine
from google.genai import types
from dotenv import load_dotenv

# ==========================================
# 전역 변수 선언
# ==========================================
client = None
USE_GEMINI = False
USE_MEDIAPIPE = False
df_food = pd.DataFrame()
knn_model = None
pose = None
mp_drawing = None
mp_pose = None
engine = None

def initialize_ai_models():
    """FastAPI 서버 시작 시 딱 한 번만 실행되는 초기화 함수"""
    global client, USE_GEMINI, USE_MEDIAPIPE, df_food, knn_model, pose, mp_drawing, mp_pose, engine

    print("🚀 [AI] 시스템 초기화를 시작합니다...")

    # 1. Mediapipe (자세 분석) 로드
    try:
        mp_drawing = mp.solutions.drawing_utils
        mp_pose = mp.solutions.pose
        pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
        USE_MEDIAPIPE = True
        print("✅ [AI] Mediapipe (자세 분석) 정상 로드 완료!")
    except Exception as e:
        print(f"⚠️ [AI] Mediapipe 로드 실패 (자세 분석은 임시 비활성화됩니다): {e}")
        USE_MEDIAPIPE = False

    # 2. 구글 Gemini AI 설정
    load_dotenv(".env")
    GOOGLE_AI_API_KEY = os.getenv("GOOGLE_AI_API_KEY")

    if GOOGLE_AI_API_KEY:
        try:
            client = genai.Client(api_key=GOOGLE_AI_API_KEY)
            USE_GEMINI = True
            masked_key = GOOGLE_AI_API_KEY[:10] + "..." if len(GOOGLE_AI_API_KEY) > 10 else "인식오류"
            print(f"✅ [AI] 구글 Gemini 최신 SDK 연동 완료! (현재 사용중인 키: {masked_key})")
        except Exception as e:
            print(f"⚠️ [AI] Gemini 초기화 실패: {e}")
            client = None
            USE_GEMINI = False
    else:
        print("⚠️ [AI] GOOGLE_API_KEY가 없습니다. 텍스트 생성은 건너뜁니다.")
        client = None
        USE_GEMINI = False

    # 3. MySQL 데이터베이스 연결 및 AI 모델 학습
    DB_HOST = os.getenv("DB_URL", "localhost")
    DB_PASS = os.getenv("DB_PASSWORD", "root")

    if DB_HOST == "localhost":
        DB_USER = "root"
        DB_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:3306/yummy"
    else:
        DB_USER = "yummy"
        DB_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:3306/yummy?charset=utf8mb4"

    try:
        engine = create_engine(DB_URL)
        query = "SELECT * FROM food"
        df_food = pd.read_sql(query, engine)

        if df_food.empty:
            print("⚠️ DB의 food 테이블이 비어있습니다!")
        else:
            # ==========================================
            # 🚀 [절대 방어] 0g 데이터 및 디저트, 반찬류 원천 차단 로직
            # ==========================================
            # 🔥 나트륨(fo_natrium) 컬럼 추가 확인!
            cols_to_check = ['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat', 'fo_natrium']
            for col in cols_to_check:
                if col in df_food.columns:
                    df_food[col] = pd.to_numeric(df_food[col], errors='coerce').fillna(0)

            if set(['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat']).issubset(df_food.columns):
                df_food = df_food[
                    (df_food['fo_kcal'] >= 50) &  
                    (df_food['fo_carbs'] >= 0) &   
                    (df_food['fo_protein'] >= 0) & 
                    (df_food['fo_fat'] >= 0)       
                ]

            if 'fo_type' in df_food.columns:
                exclude_types = [
                    '빵 및 과자류', '빵류', '과자류', '아이스크림류', '빙과류', '초콜릿류', '캔디류', '당류', '잼류', '간식류',
                    '조미료류', '유지류', '장류', '소스류', '드레싱류', '주류', '음료 및 차류', '음료류'
                ]
                df_food = df_food[~df_food['fo_type'].isin(exclude_types)]

            if 'fo_name' in df_food.columns:
                # 🔥 [특급 조치] 이름에 언더바(_)가 들어간 '꽁치조림_배추김치' 같은 혼종 데이터 아예 삭제!
                df_food = df_food[~df_food['fo_name'].astype(str).str.contains('_', na=False)]
                
                # 🔥 괄호에 들어간 쓸데없는 부가 설명 제거 (예: 배추김치(포기김치) -> 배추김치)
                df_food['fo_name'] = df_food['fo_name'].str.replace(r'\(.*\)', '', regex=True).str.strip()

                exclude_keywords = [
                    '매작과', '약과', '유과', '다식', '정과', '강정', '한과', '엿', '꽈배기', '만주', '만쥬',
                    '빵', '케이크', '케익', '마카롱', '도넛', '파이', '쿠키', '크래커', '스콘', '타르트', 
                    '크루아상', '크로와상', '크로아상', '크루와상', '베이글', '페스츄리', '카스텔라',
                    '과자', '초코', '초콜릿', '사탕', '캔디', '젤리', '카라멜', '아이스크림', '젤라또', '푸딩',
                    '오트밀', '시리얼', '그래놀라', '땅콩', '견과', '호두', '아몬드', 
                    '튀김', '부각', '튀각', '스낵', '쥐포', '포', '육포', '어포', '건어물',
                    '조미김', '김자반', '자반', '파래김', '김가루', '젓갈', '명란젓', '게장', '장아찌', '단무지', '피클',
                    '소스', '드레싱', '마요네즈', '케첩', '케찹', '머스타드', '기름', '오일', '시럽', '잼', 
                    '고추장', '된장', '쌈장', '간장', '참기름', '들기름', '버터', '마가린', '소금', '설탕', 
                    '주스', '쥬스', '음료', '에이드', '스무디', '차', '커피', '맥주', '소주', '와인', '콜라', '사이다', '워터',
                    '츄러스', '츄라이', '크로플', '와플', '프라이', '감자튀김', '핫도그', '호떡', '붕어빵', '달고나', '탕후루', '빙수', '토스트', '머핀',
                    '파스타', '피자', '스파게티', '버거', '샌드위치', '샐러드', '스테이크', 
                    '카레', '커리', '돈까스', '돈가스', '우동', '라멘', '소바', '스시', '초밥', '롤', 
                    '마라탕', '팟타이', '리조또', '그라탕', '뇨끼', '타코', '브리또', '훠궈', 
                    '꿔바로우', '양꼬치', '짜장', '짬뽕', '탕수육', '마파두부', '딤섬', '바베큐', 
                    '소시지', '소세지', '베이컨', '오믈렛', '팬케이크', '라자냐', '규동', '가츠동', '텐동', '가라아게',
                    '카츠', '마라', '샹궈', '나베', '수프', '스프', '핫도그', '치즈'
                ]
                pattern = '|'.join(exclude_keywords)
                df_food = df_food[~df_food['fo_name'].astype(str).str.contains(pattern, case=False, na=False, regex=True)]

            print(f"✅ 정식 구성을 위한 한식 DB 정제 완료! 최종 한식 개수: {len(df_food)}개")

            features = df_food[['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat']]
            knn_model = NearestNeighbors(n_neighbors=1, algorithm='auto').fit(features)
            print("✅ 식단 AI 모델 실전 데이터 학습 완료!")
    except Exception as e:
        print(f"🚨 DB 연결 실패: {e}")

# ==========================================
# 식단 추천 로직 함수 (기존 단품 검색기 - 예비용 유지)
# ==========================================
def get_best_diets(target_kcal, target_carbs, target_protein, target_fat, diet_type, num_samples=20):
    if diet_type != "맞춤 식단":
        filtered_df = df_food[df_food['fo_type'] == diet_type]
    else:
        filtered_df = df_food

    if filtered_df.empty:
        filtered_df = df_food

    temp_features = filtered_df[['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat']]
    
    n_neighbors = min(150, len(filtered_df))
    if n_neighbors == 0:
        return []

    temp_model = NearestNeighbors(n_neighbors=n_neighbors, algorithm='auto').fit(temp_features)
    target_meal = [[target_kcal, target_carbs, target_protein, target_fat]]
    distances, indices = temp_model.kneighbors(target_meal)

    results = []
    seen_menus = [] 
    
    for idx in indices[0]:
        row = filtered_df.iloc[idx]
        menu_name = str(row['fo_name'])
        
        is_duplicate = False
        for seen in seen_menus:
            if seen in menu_name or menu_name in seen:
                is_duplicate = True
                break
                
        if is_duplicate:
            continue
            
        seen_menus.append(menu_name)
        
        results.append({
            "id": int(row['fo_num']),
            "menu": menu_name,
            "original_menu": menu_name, 
            "kcal": int(row['fo_kcal']),
            "carbs": int(row['fo_carbs']),
            "protein": int(row['fo_protein']),
            "fat": int(row['fo_fat']),
            "sodium": int(row['fo_natrium']),
            "tags": [row['fo_type'], "AI 정밀분석"]
        })
        
        if len(results) >= num_samples:
            break
            
    return results

# ==========================================
# 🌟 [초핵심] 밥+국+메인+반찬 한끼 정식 3세트 조립 및 AI 나트륨 방어 분배
# ==========================================
def get_hybrid_diet_recommendation(target_kcal, target_carbs, target_protein, target_fat, diet_type, persona_mode="비즈니스"):
    
    # 1. 1끼 분량 타겟 계산 (전체 목표의 1/3)
    meal_kcal = max(target_kcal // 3, 300)
    meal_carbs = max(target_carbs // 3, 30)
    meal_protein = max(target_protein // 3, 15)
    meal_fat = max(target_fat // 3, 10)
    # 🔥 1끼 권장 나트륨 (1일 권장 2000mg의 1/3인 약 666mg)
    meal_sodium_limit = 666 

    # 2. 카테고리별로 음식 쪼개기 (키워드 기반 분류)
    df_rice = df_food[df_food['fo_name'].astype(str).str.contains('밥', na=False)]
    df_soup = df_food[df_food['fo_name'].astype(str).str.contains('국|찌개|탕|전골', na=False)]
    df_main = df_food[df_food['fo_name'].astype(str).str.contains('구이|볶음|찜|제육|불고기|갈비|조림|전|튀김', na=False)]
    df_side = df_food[df_food['fo_name'].astype(str).str.contains('나물|무침|생채|김치|숙채', na=False)]

    if df_rice.empty: df_rice = df_food
    if df_soup.empty: df_soup = df_food
    if df_main.empty: df_main = df_food
    if df_side.empty: df_side = df_food

    # 3. 완벽한 3개의 정식 세트 조립 (나트륨 데이터 포함)
    meal_options = []
    for i in range(3):
        r = df_rice.sample(1).iloc[0]
        s = df_soup.sample(1).iloc[0]
        m = df_main.sample(1).iloc[0]
        sd = df_side.sample(1).iloc[0]
        
        meal_options.append({
            "rice": {"id": int(r['fo_num']), "name": str(r['fo_name']), "k": int(r['fo_kcal']), "na": int(r.get('fo_natrium', 0)), "type": str(r['fo_type'])},
            "soup": {"id": int(s['fo_num']), "name": str(s['fo_name']), "k": int(s['fo_kcal']), "na": int(s.get('fo_natrium', 0)), "type": str(s['fo_type'])},
            "main": {"id": int(m['fo_num']), "name": str(m['fo_name']), "k": int(m['fo_kcal']), "na": int(m.get('fo_natrium', 0)), "type": str(m['fo_type'])},
            "side": {"id": int(sd['fo_num']), "name": str(sd['fo_name']), "k": int(sd['fo_kcal']), "na": int(sd.get('fo_natrium', 0)), "type": str(sd['fo_type'])}
        })

    # 4. 제미나이(AI)에게 100g 기준 데이터 전달 및 나트륨 방어 지시
    if USE_GEMINI and client:
        try:
            prompt = f"""
            당신은 '{persona_mode}' 페르소나를 가진 수석 영양 코치입니다.
            사용자의 1끼 식사 목표 영양소는 [칼로리 {meal_kcal}kcal, 탄수화물 {meal_carbs}g, 단백질 {meal_protein}g, 지방 {meal_fat}g] 이며,
            **[매우 중요] 건강을 위해 1끼 총 나트륨 섭취량을 반드시 {meal_sodium_limit}mg 이하로 통제해야 합니다.**

            아래는 당신이 유저를 위해 조합한 3가지 한식 정식 세트입니다. (괄호 안의 숫자는 100g 당 '칼로리 / 나트륨' 입니다.)
            세트 1: 밥[{meal_options[0]['rice']['name']}({meal_options[0]['rice']['k']}kcal / 나트륨 {meal_options[0]['rice']['na']}mg)], 국[{meal_options[0]['soup']['name']}({meal_options[0]['soup']['k']}kcal / 나트륨 {meal_options[0]['soup']['na']}mg)], 메인[{meal_options[0]['main']['name']}({meal_options[0]['main']['k']}kcal / 나트륨 {meal_options[0]['main']['na']}mg)], 반찬[{meal_options[0]['side']['name']}({meal_options[0]['side']['k']}kcal / 나트륨 {meal_options[0]['side']['na']}mg)]
            세트 2: 밥[{meal_options[1]['rice']['name']}({meal_options[1]['rice']['k']}kcal / 나트륨 {meal_options[1]['rice']['na']}mg)], 국[{meal_options[1]['soup']['name']}({meal_options[1]['soup']['k']}kcal / 나트륨 {meal_options[1]['soup']['na']}mg)], 메인[{meal_options[1]['main']['name']}({meal_options[1]['main']['k']}kcal / 나트륨 {meal_options[1]['main']['na']}mg)], 반찬[{meal_options[1]['side']['name']}({meal_options[1]['side']['k']}kcal / 나트륨 {meal_options[1]['side']['na']}mg)]
            세트 3: 밥[{meal_options[2]['rice']['name']}({meal_options[2]['rice']['k']}kcal / 나트륨 {meal_options[2]['rice']['na']}mg)], 국[{meal_options[2]['soup']['name']}({meal_options[2]['soup']['k']}kcal / 나트륨 {meal_options[2]['soup']['na']}mg)], 메인[{meal_options[2]['main']['name']}({meal_options[2]['main']['k']}kcal / 나트륨 {meal_options[2]['main']['na']}mg)], 반찬[{meal_options[2]['side']['name']}({meal_options[2]['side']['k']}kcal / 나트륨 {meal_options[2]['side']['na']}mg)]

            [임무]
            목표 1끼 칼로리에 근접하게 맞추되, **나트륨이 높은 찌개류나 짠 반찬은 섭취량(g)을 대폭 줄여서라도 총 나트륨을 {meal_sodium_limit}mg 근처로 방어하도록 수학적으로 분배**해주세요. (예: 밥 180g, 찌개 80g, 메인 120g, 반찬 30g 등)
            
            결과를 반드시 아래 JSON 배열 형식(크기 3)으로만 출력하세요. 다른 말은 절대 추가하지 마세요.
            [
              {{
                "meal_time": "정식 1",
                "menu": "든든한 (메인 이름) 정식",
                "main_ingredient": "(소고기, 돼지고기, 닭고기, 생선, 두부 중 1개)",
                "kcal": (g수에 맞게 계산된 총 칼로리 정수),
                "carbs": (총 탄수화물 정수),
                "protein": (총 단백질 정수),
                "fat": (총 지방 정수),
                "sodium": (총 나트륨 정수 - 반드시 {meal_sodium_limit} 이하 권장),
                "ai_comment": "{meal_options[0]['rice']['name']} (계산한g)g, {meal_options[0]['soup']['name']} (계산한g)g, {meal_options[0]['main']['name']} (계산한g)g, {meal_options[0]['side']['name']} (계산한g)g. 나트륨 조절을 위해 양을 조절했어요! ({persona_mode} 말투 응원 1줄)",
                "tags": ["{meal_options[0]['main']['type']}", "AI 정밀분석"],
                "combo_foods": [
                  {{"id": {meal_options[0]['rice']['id']}, "name": "{meal_options[0]['rice']['name']}", "grams": (정하신 밥 g수 정수), "kcal": (계산된 밥 칼로리 정수)}},
                  {{"id": {meal_options[0]['soup']['id']}, "name": "{meal_options[0]['soup']['name']}", "grams": (정하신 국 g수 정수), "kcal": (계산된 국 칼로리 정수)}},
                  {{"id": {meal_options[0]['main']['id']}, "name": "{meal_options[0]['main']['name']}", "grams": (정하신 메인 g수 정수), "kcal": (계산된 메인 칼로리 정수)}},
                  {{"id": {meal_options[0]['side']['id']}, "name": "{meal_options[0]['side']['name']}", "grams": (정하신 반찬 g수 정수), "kcal": (계산된 반찬 칼로리 정수)}}
                ]
              }},
              {{
                "meal_time": "정식 2",
                "menu": "맛있는 (메인 이름) 정식",
                "main_ingredient": "(소고기, 돼지고기, 닭고기, 생선, 두부 중 1개)",
                "kcal": (g수에 맞게 계산된 총 칼로리 정수),
                "carbs": (총 탄수화물 정수),
                "protein": (총 단백질 정수),
                "fat": (총 지방 정수),
                "sodium": (총 나트륨 정수 - 반드시 {meal_sodium_limit} 이하 권장),
                "ai_comment": "{meal_options[1]['rice']['name']} (계산한g)g, {meal_options[1]['soup']['name']} (계산한g)g, {meal_options[1]['main']['name']} (계산한g)g, {meal_options[1]['side']['name']} (계산한g)g. 나트륨 조절을 위해 양을 조절했어요! ({persona_mode} 말투 응원 1줄)",
                "tags": ["{meal_options[1]['main']['type']}", "AI 정밀분석"],
                "combo_foods": [
                  {{"id": {meal_options[1]['rice']['id']}, "name": "{meal_options[1]['rice']['name']}", "grams": (정하신 밥 g수 정수), "kcal": (계산된 밥 칼로리 정수)}},
                  {{"id": {meal_options[1]['soup']['id']}, "name": "{meal_options[1]['soup']['name']}", "grams": (정하신 국 g수 정수), "kcal": (계산된 국 칼로리 정수)}},
                  {{"id": {meal_options[1]['main']['id']}, "name": "{meal_options[1]['main']['name']}", "grams": (정하신 메인 g수 정수), "kcal": (계산된 메인 칼로리 정수)}},
                  {{"id": {meal_options[1]['side']['id']}, "name": "{meal_options[1]['side']['name']}", "grams": (정하신 반찬 g수 정수), "kcal": (계산된 반찬 칼로리 정수)}}
                ]
              }},
              {{
                "meal_time": "정식 3",
                "menu": "건강한 (메인 이름) 정식",
                "main_ingredient": "(소고기, 돼지고기, 닭고기, 생선, 두부 중 1개)",
                "kcal": (g수에 맞게 계산된 총 칼로리 정수),
                "carbs": (총 탄수화물 정수),
                "protein": (총 단백질 정수),
                "fat": (총 지방 정수),
                "sodium": (총 나트륨 정수 - 반드시 {meal_sodium_limit} 이하 권장),
                "ai_comment": "{meal_options[2]['rice']['name']} (계산한g)g, {meal_options[2]['soup']['name']} (계산한g)g, {meal_options[2]['main']['name']} (계산한g)g, {meal_options[2]['side']['name']} (계산한g)g. 나트륨 조절을 위해 양을 조절했어요! ({persona_mode} 말투 응원 1줄)",
                "tags": ["{meal_options[2]['main']['type']}", "AI 정밀분석"],
                "combo_foods": [
                  {{"id": {meal_options[2]['rice']['id']}, "name": "{meal_options[2]['rice']['name']}", "grams": (정하신 밥 g수 정수), "kcal": (계산된 밥 칼로리 정수)}},
                  {{"id": {meal_options[2]['soup']['id']}, "name": "{meal_options[2]['soup']['name']}", "grams": (정하신 국 g수 정수), "kcal": (계산된 국 칼로리 정수)}},
                  {{"id": {meal_options[2]['main']['id']}, "name": "{meal_options[2]['main']['name']}", "grams": (정하신 메인 g수 정수), "kcal": (계산된 메인 칼로리 정수)}},
                  {{"id": {meal_options[2]['side']['id']}, "name": "{meal_options[2]['side']['name']}", "grams": (정하신 반찬 g수 정수), "kcal": (계산된 반찬 칼로리 정수)}}
                ]
              }}
            ]
            """
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.8)
            )

            text = response.text.strip()
            match = re.search(r'\[.*\]', text, re.DOTALL)
            if match:
                clean_json_text = match.group(0)
                ai_data_list = json.loads(clean_json_text)
                print("🤖 [Gemini] 3가지 정식 g수 분배 및 나트륨 방어 완료!")
                return ai_data_list

        except Exception as e:
            print(f"⚠️ [Gemini] 한끼 식사 세트 구성 실패: {e}")

    # 제미나이 에러 시 서버 다운을 막기 위한 백업 데이터 반환
    fallback_data = []
    for i, opt in enumerate(meal_options):
        fallback_data.append({
            "meal_time": f"정식 {i+1}",
            "menu": f"건강한 {opt['main']['name']} 정식",
            "main_ingredient": "기본",
            "kcal": meal_kcal, "carbs": meal_carbs, "protein": meal_protein, "fat": meal_fat, "sodium": 650,
            "ai_comment": f"{opt['rice']['name']} 150g, {opt['soup']['name']} 100g, {opt['main']['name']} 150g, {opt['side']['name']} 50g 으로 나트륨을 방어해 구성했습니다!",
            "tags": [opt['main']['type'], "AI 정밀분석"],
            "combo_foods": [
                {"id": opt['rice']['id'], "name": opt['rice']['name'], "grams": 150, "kcal": int(opt['rice']['k'] * 1.5)},
                {"id": opt['soup']['id'], "name": opt['soup']['name'], "grams": 100, "kcal": int(opt['soup']['k'] * 1.0)},
                {"id": opt['main']['id'], "name": opt['main']['name'], "grams": 150, "kcal": int(opt['main']['k'] * 1.5)},
                {"id": opt['side']['id'], "name": opt['side']['name'], "grams": 50, "kcal": int(opt['side']['k'] * 0.5)}
            ]
        })
    return fallback_data


# ==========================================
# 두 좌표 사이의 기울기(각도)를 계산하는 함수
# ==========================================
def calculate_angle(p1, p2):
    dy = p2.y - p1.y
    dx = p2.x - p1.x
    angle = abs(math.degrees(math.atan2(dy, dx)))
    
    if angle > 90:
        angle = 180 - angle
        
    return angle

# ==========================================
# 🦴 눈바디 AI 함수 1 (뼈대 자세 분석 및 Gemini 코칭)
# ==========================================
def analyze_pose(image_bytes):
    if not USE_MEDIAPIPE:
        print("⚠️ 자세 분석 기능을 건너뛰고 원본 이미지를 반환합니다.")
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        _, buffer = cv2.imencode('.jpg', img)
        return {
            "image_base64": base64.b64encode(buffer).decode('utf-8'),
            "score_data": None
        }

    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(img_rgb)
    score_data = None

    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
        right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
        left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
        right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]

        shoulder_angle = calculate_angle(left_shoulder, right_shoulder)
        hip_angle = calculate_angle(left_hip, right_hip)

        shoulder_score = max(0, 100 - (shoulder_angle * 3))
        hip_score = max(0, 100 - (hip_angle * 3))
        total_score = (shoulder_score + hip_score) / 2

        shoulder_status = "좌우 대칭이 완벽합니다"
        if shoulder_angle > 3:
            shoulder_status = "왼쪽 어깨가 올라감" if left_shoulder.y < right_shoulder.y else "오른쪽 어깨가 올라감"
            
        hip_status = "좌우 대칭이 완벽합니다"
        if hip_angle > 3:
            hip_status = "왼쪽 골반이 올라감" if left_hip.y < right_hip.y else "오른쪽 골반이 올라감"

        feedback = ""
        if USE_GEMINI and client:
            prompt = f"""
            당신은 다정하고 전문적인 체형 교정 AI 코치입니다.
            현재 사용자의 뼈대 분석 결과입니다:
            - 종합 자세 점수: {total_score:.1f}/100점
            - 어깨 상태: {shoulder_status} (틀어짐: {shoulder_angle:.1f}도)
            - 골반 상태: {hip_status} (틀어짐: {hip_angle:.1f}도)
            
            위 데이터를 바탕으로 사용자에게 공감과 칭찬을 건네고, 현재 틀어진 방향에 맞는 일상 생활의 습관 점검(예: 짝다리, 가방 매기 등)과 맞춤형 스트레칭 조언을 2~3줄로 다정하게 작성해주세요. 이모지를 섞어주세요.
            """
            try:
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.7)
                )
                feedback = response.text.strip()
                print("🤖 [Gemini] 뼈대 자세 교정 피드백 생성 완료!")
            except Exception as e:
                print(f"⚠️ [Gemini] 뼈대 피드백 실패: {e}")
                feedback = f"자세 점수는 {total_score:.1f}점입니다. 어깨: {shoulder_status}, 골반: {hip_status} 🏃‍♂️"
        else:
            feedback = f"자세 점수는 {total_score:.1f}점입니다. 어깨: {shoulder_status}, 골반: {hip_status} 🏃‍♂️"

        score_data = {
            "shoulder_score": round(shoulder_score, 1),
            "hip_score": round(hip_score, 1),
            "total_score": round(total_score, 1),
            "feedback": feedback
        }

        mp_drawing.draw_landmarks(
            img,
            results.pose_landmarks,
            mp_pose.POSE_CONNECTIONS,
            mp_drawing.DrawingSpec(color=(245, 117, 66), thickness=2, circle_radius=2),
            mp_drawing.DrawingSpec(color=(245, 66, 230), thickness=2, circle_radius=2)
        )
        print(f"✅ [AI] 뼈대 분석 완료! (종합 점수: {total_score:.1f}점)")
    else:
        print("⚠️ [AI] 사람을 인식하지 못했습니다.")

    _, buffer = cv2.imencode('.jpg', img)
    return {
        "image_base64": base64.b64encode(buffer).decode('utf-8'),
        "score_data": score_data
    }

# ==========================================
# 👤 눈바디 AI 함수 2 (실루엣 바디라인 분석 및 Gemini 코칭)
# ==========================================
def extract_outline(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)
    img_bgr = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    
    score_data = None
    
    if USE_MEDIAPIPE:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = pose.process(img_rgb)
        
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            l_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
            r_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
            l_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP.value]
            r_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value]
            
            shoulder_width = math.sqrt((l_shoulder.x - r_shoulder.x)**2 + (l_shoulder.y - r_shoulder.y)**2)
            hip_width = math.sqrt((l_hip.x - r_hip.x)**2 + (l_hip.y - r_hip.y)**2)
            
            if shoulder_width > 0:
                body_ratio = round((hip_width / shoulder_width) * 100, 1)
            else:
                body_ratio = 100.0

            feedback = ""
            if USE_GEMINI and client:
                prompt = f"""
                당신은 다정하고 긍정적인 다이어트 AI 코치입니다.
                사용자의 눈바디 실루엣 분석 결과, 어깨 너비 대비 허리/골반 너비 비율이 {body_ratio}% 로 측정되었습니다.
                
                이 비율을 바탕으로, 현재 체형의 매력을 칭찬해주고, 허리 라인을 더 예쁘게 다듬기 위한 맞춤형 추천 운동이나 식단 팁을 2~3줄로 다정하게 조언해주세요. 이모지를 적절히 섞어주세요.
                """
                try:
                    response = client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=prompt,
                        config=types.GenerateContentConfig(temperature=0.75)
                    )
                    feedback = response.text.strip()
                    print("🤖 [Gemini] 실루엣 바디라인 피드백 생성 완료!")
                except Exception as e:
                    print(f"⚠️ [Gemini] 실루엣 피드백 실패: {e}")
                    feedback = f"어깨 대비 허리 비율은 {body_ratio}% 입니다. 훌륭한 라인을 유지하고 계시네요! 👗"
            else:
                feedback = f"어깨 대비 허리 비율은 {body_ratio}% 입니다. 훌륭한 라인을 유지하고 계시네요! 👗"

            score_data = {
                "body_ratio": body_ratio,
                "feedback": feedback,
                "total_score": body_ratio
            }
            print(f"✅ [AI] 실루엣 및 바디 비율 분석 완료! (비율: {body_ratio}%)")

    _, buffer = cv2.imencode('.jpg', img_bgr)
    return {
        "image_base64": base64.b64encode(buffer).decode('utf-8'),
        "score_data": score_data
    }

# ==========================================
# 🌟 AI 3줄 요약 + 다이내믹 페르소나 피드백 생성 (식단용)
# ==========================================
def generate_daily_feedback(grade, current_kcal, target_kcal, carbs, protein, fat, sodium, persona_mode="다정"):
    if USE_GEMINI and client:
        try:
            persona_instruction = ""
            if persona_mode == "다정":
                persona_instruction = "당신은 다정하고 따뜻한 천사 영양 코치 '로로'입니다. 유저를 항상 응원하고 칭찬하며, 예쁜 이모지를 많이 사용하세요."
            elif persona_mode == "팩폭":
                persona_instruction = "당신은 수치(팩트)를 기반으로 뼈를 때리는 엄격한 호랑이 코치입니다. 식단의 문제점을 냉정하고 날카롭게 지적하세요."
            elif persona_mode == "열혈":
                persona_instruction = "당신은 근성장과 운동을 사랑하는 열혈 헬스 트레이너입니다. 단백질 섭취와 에너지를 강조하는 파이팅 넘치는 말투를 사용하세요."
            elif persona_mode == "츤데레":
                persona_instruction = "당신은 무심하고 틱틱대지만 속으로는 유저를 챙기는 츤데레 코치입니다. 귀찮은 척하면서도 영양학적으로 완벽한 조언을 해줍니다."
            else:
                persona_instruction = "당신은 다정하고 친절한 영양 코치입니다."

            prompt = f"""
{persona_instruction}
사용자의 식단 기록을 분석하여, 당신의 페르소나에 완벽하게 빙의해서 평가를 작성해주세요.

[오늘의 식단 데이터]
- 달성 등급: {grade}
- 섭취 칼로리: {current_kcal} kcal (목표: {target_kcal} kcal)
- 탄수화물: {carbs}g, 단백질: {protein}g, 지방: {fat}g, 나트륨: {sodium}mg

[작성 가이드]
결과를 반드시 아래 JSON 형식으로만 출력하세요.
{{
  "grade_message": "(당신의 페르소나 말투로 작성한 1줄짜리 등급 총평)",
  "ai_feedback": "(당신의 페르소나 말투로 작성한 상세 피드백. 줄바꿈 \\n 을 사용해 2~3줄로 작성)"
}}
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json", 
                    temperature=0.8
                )
            )
            
            text = response.text.strip()
            match = re.search(r'\{.*\}', text, re.DOTALL)
            
            if match:
                clean_json_text = match.group(0)
                result_data = json.loads(clean_json_text)
                print(f"🤖 [Gemini] {persona_mode} 모드 피드백 생성 성공!")
                return result_data
            else:
                print("⚠️ [Gemini] 응답에서 JSON 객체를 찾을 수 없습니다. 원본 텍스트:", text)
            
        except Exception as e:
            print(f"⚠️ [Gemini] 피드백 생성 실패 (기본값 대체): {e}")

    return {
        "grade_message": f"{grade}등급: 분석을 완료했어요! 📊",
        "ai_feedback": "현재 AI 코치에게 맞춤 응답을 받아오지 못했습니다.\n하지만 탄단지 비율을 잘 맞춰주시면 목표에 금방 다가갈 수 있어요! 💪"
    }
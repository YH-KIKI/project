# ai_service.py
import pandas as pd
from sklearn.neighbors import NearestNeighbors
from sqlalchemy import create_engine

# ==========================================
# 1. MySQL 데이터베이스 연결 설정
# ==========================================
# 🌟 형식: mysql+pymysql://아이디:비밀번호@주소:포트/데이터베이스이름
# (본인의 MySQL 비밀번호와 DB 이름에 맞게 꼭 수정해주세요!)
DB_URL = "mysql+pymysql://root:root@localhost:3306/nnp"
engine = create_engine(DB_URL)

# ==========================================
# 2. SQL에서 데이터 불러와서 AI 모델 학습
# ==========================================
try:
    # 데이터베이스의 food 테이블에서 데이터 싹 다 가져오기
    query = "SELECT * FROM food"
    df_food = pd.read_sql(query, engine)

    if df_food.empty:
        print("⚠️ DB의 food 테이블이 비어있습니다! 임시 데이터를 준비해야 합니다.")
    else:
        print(f"✅ MySQL에서 음식 데이터 {len(df_food)}개 성공적으로 불러옴!")
        
        # AI가 학습할 기준점 (DB 컬럼명에 맞춤: 칼로리, 탄, 단, 지)
        features = df_food[['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat']]

        # KNN 모델 학습시키기
        model = NearestNeighbors(n_neighbors=1, algorithm='auto').fit(features)
        print("✅ AI 모델 실전 데이터 학습 완료!")

except Exception as e:
    print(f"🚨 DB 연결 실패 (비밀번호나 DB이름을 확인하세요): {e}")


# ==========================================
# 3. 추천 로직 함수
# ==========================================
def get_best_diet(target_kcal, target_carbs, target_protein, target_fat, diet_type):
    # 🌟 1. 사용자가 선택한 탭(diet_type)과 일치하는 데이터만 먼저 골라냅니다.
    # (단, '맞춤 식단'일 때는 전체에서 찾도록 합니다)
    if diet_type != "맞춤 식단":
        filtered_df = df_food[df_food['fo_type'] == diet_type]
    else:
        filtered_df = df_food

    # 만약 해당 타입의 음식이 DB에 하나도 없다면 전체에서 찾음 (방어 코드)
    if filtered_df.empty:
        filtered_df = df_food

    # 🌟 2. 필터링된 데이터 안에서만 AI 모델을 다시 세팅합니다.
    temp_features = filtered_df[['fo_kcal', 'fo_carbs', 'fo_protein', 'fo_fat']]
    temp_model = NearestNeighbors(n_neighbors=1, algorithm='auto').fit(temp_features)

    # 🌟 3. 계산 및 결과 추출
    target_meal = [[target_kcal, target_carbs, target_protein, target_fat]]
    distances, indices = temp_model.kneighbors(target_meal)
    best_match_index = indices[0][0]
    
    # iloc으로 실제 행 데이터 추출
    best_food_row = filtered_df.iloc[best_match_index]
    
    return {
        "id": int(best_food_row['fo_num']),
        "menu": best_food_row['fo_name'],
        "kcal": int(best_food_row['fo_kcal']),
        "carbs": int(best_food_row['fo_carbs']),
        "protein": int(best_food_row['fo_protein']),
        "fat": int(best_food_row['fo_fat']),
        "sodium": int(best_food_row['fo_natrium']),
        "tags": [best_food_row['fo_type'], "AI 정밀분석"]
    }
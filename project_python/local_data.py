import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

# 1. .env 파일 로드
load_dotenv('.env')
db_pass = os.getenv('LOCAL_DB_PASS')

if not db_pass:
    raise ValueError("🚨 .env 파일에서 'LOCAL_DB_PASS'를 찾을 수 없습니다.")

# 2. 엑셀 파일 읽어오기
file_name = '20251229_음식DB 19495건.xlsx' 
print("1. 엑셀 데이터를 읽어오는 중입니다... 잠시만 기다려주세요 ⏳")
df = pd.read_excel(file_name) 

# 3. 필요한 7개 열만 추출
print("2. 필요한 데이터만 추출 및 변환하는 중...")
columns_to_keep = [
    '식품명',
    '식품대분류명',
    '에너지(kcal)',
    '탄수화물(g)',
    '단백질(g)',
    '지방(g)',
    '나트륨(mg)'
]
df_filtered = df[columns_to_keep].copy()

# 4. 빈칸(NaN) 0으로 채우기
df_filtered = df_filtered.fillna(0)

# 5. DB 컬럼명과 1:1 매핑
df_renamed = df_filtered.rename(columns={
    '식품명': 'fo_name',
    '식품대분류명': 'fo_type',
    '에너지(kcal)': 'fo_kcal',
    '탄수화물(g)': 'fo_carbs',
    '단백질(g)': 'fo_protein',
    '지방(g)': 'fo_fat',
    '나트륨(mg)': 'fo_natrium'
})

# ⭐️ [추가된 부분] 5.5 모든 음식의 기준 용량(fo_base_gram)을 100으로 고정
df_renamed['fo_base_gram'] = 100

# 6. 로컬 DB(localhost) 연결 및 전송
local_user = 'root' 
local_db_name = 'yummy'

DB_URL = f"mysql+pymysql://{local_user}:{db_pass}@localhost:3306/{local_db_name}?charset=utf8mb4"
engine = create_engine(DB_URL)

print("3. 로컬 DB(localhost)에 연결하여 데이터를 전송하고 있습니다... 🚀")

try:
    df_renamed.to_sql(name='food', con=engine, if_exists='append', index=False)
    print("\n🎉 성공! 19,495개의 데이터가 fo_base_gram=100과 함께 DB에 완벽하게 저장되었습니다!")

except Exception as e:
    print(f"\n🚨 데이터 전송 실패! 아래 에러 내용을 확인해 주세요:\n{e}")
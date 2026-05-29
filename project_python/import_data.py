import os
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv

# 1. .env 파일 로드 (비밀번호 읽어오기)
load_dotenv('.env')
db_pass = os.getenv('MY_DB_PASS')

if not db_pass:
    raise ValueError("🚨 .env 파일에서 'MY_DB_PASS'를 찾을 수 없습니다. .env 파일을 다시 확인해 주세요!")

# 2. 엑셀 파일 이름 설정 (같은 폴더에 있어야 합니다)
file_name = '20251229_음식DB 19495건.xlsx' 
print("1. 엑셀 데이터를 읽어오는 중입니다... 잠시만 기다려주세요 ⏳")

# 엑셀 파일을 데이터프레임으로 읽어옵니다.
df = pd.read_excel(file_name) 

# 3. food 테이블 구조에 꼭 필요한 7개 열만 추출
print("2. 필요한 영양성분 데이터만 추출하는 중...")
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

# 4. 데이터 중 빈칸(NaN)이 있으면 0으로 안전하게 채움
df_filtered = df_filtered.fillna(0)

# 5. 다운받은 엑셀의 열 이름을 내 DB 컬럼명과 1:1로 매핑
df_renamed = df_filtered.rename(columns={
    '식품명': 'fo_name',
    '식품대분류명': 'fo_type',
    '에너지(kcal)': 'fo_kcal',
    '탄수화물(g)': 'fo_carbs',
    '단백질(g)': 'fo_protein',
    '지방(g)': 'fo_fat',
    '나트륨(mg)': 'fo_natrium'
})

# 6. AWS 서버 DB(RDS) 연결 설정 (.env에서 읽어온 비밀번호 조합)
DB_URL = f"mysql+pymysql://yummy:{db_pass}@yummy.crgiqay22xf2.ap-northeast-2.rds.amazonaws.com:3306/yummy?charset=utf8mb4"
engine = create_engine(DB_URL)

print("3. AWS 서버 DB(RDS)에 연결하여 데이터를 전송하고 있습니다... 🚀")
print("   (네트워크 상황에 따라 1~2분 정도 소요될 수 있습니다.)")

try:
    # fo_num은 Auto Increment이므로 제외하고 밀어 넣습니다.
    df_renamed.to_sql(name='food', con=engine, if_exists='append', index=False)
    print("\n🎉 성공! 19,495개의 음식 데이터가 AWS 서버의 food 테이블에 완벽하게 저장되었습니다!")

except Exception as e:
    print(f"\n🚨 데이터 전송 실패! 아래 에러 내용을 확인해 주세요:\n{e}")
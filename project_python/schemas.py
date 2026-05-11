from pydantic import BaseModel

# 스프링부트에서 넘어올 유저 정보의 그릇(DTO) 정의
class UserInfo(BaseModel):
    userNum: int
    height: float
    weight: float
    targetCalorie: int
    carbs: int
    protein: int
    fat: int
    sodium: int
    type: str = "맞춤 식단"
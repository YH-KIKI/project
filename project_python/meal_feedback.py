# meal_feedback.py

def generate_meal_feedback(
    meal_type,
    kcal,
    carbs,
    protein,
    fat,
    sodium
):

    # 칼로리 부족
    if kcal < 300:
        return f"{meal_type}은 조금 가볍게 드셨네요! 단백질 반찬을 더해보는 건 어떨까요? 🍳"

    # 칼로리 과다
    if kcal > 900:
        return f"{meal_type}은 든든하게 드셨어요! 다음 끼니는 조금 가볍게 조절해봐요 🌿"

    # 단백질 부족
    if protein < 10:
        return f"{meal_type}은 단백질이 조금 부족해요! 계란이나 두부를 곁들여보세요 🥚"

    # 나트륨 높음
    if sodium > 800:
        return f"{meal_type}은 나트륨이 높은 편이에요! 물을 충분히 마셔주세요 💧"

    # 지방 높음
    if fat > 30:
        return f"{meal_type}은 지방 함량이 조금 높아요! 채소를 함께 먹으면 좋아요 🥗"

    # 기본
    return f"{meal_type}은 영양 균형이 좋아요! 지금처럼 골고루 챙겨보세요 ✨"
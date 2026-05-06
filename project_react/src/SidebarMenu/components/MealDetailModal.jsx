import React, { useState } from "react";

const MealDetailModal = ({ mealType, mealData, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const foods = mealData.foods || [];
  const currentFood = foods[currentIndex];

  const moveFood = (amount) => {
    const nextIndex = (currentIndex + amount + foods.length) % foods.length;
    setCurrentIndex(nextIndex);
  };

  if (!mealData || foods.length === 0) return null;

  return (
    <div className="modal-backdrop">
      <div className="meal-detail-modal">
        <div className="modal-header">
          <div>
            <h2>{mealType} 식단 상세</h2>
            <p>대표 사진을 넘기며 음식별 정보를 확인해보세요</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        <div className="detail-image-slider">
          <button className="slider-btn left" onClick={() => moveFood(-1)}>‹</button>

          {currentFood.imageUrl ? (
            <img src={currentFood.imageUrl} alt={currentFood.name} />
          ) : (
            <div className="detail-no-img">
              <span>🍽️</span>
              <p>등록 사진 없음</p>
            </div>
          )}

          <button className="slider-btn right" onClick={() => moveFood(1)}>›</button>

          <div className="image-caption">
            {currentFood.name} · {currentIndex + 1}/{foods.length}
          </div>
        </div>

        <div className="detail-total-box">
          <div>
            <span>총 칼로리</span>
            <strong>{mealData.totalKcal} kcal</strong>
          </div>
          <div>
            <span>탄수화물</span>
            <strong>{mealData.totalCarbs}g</strong>
          </div>
          <div>
            <span>단백질</span>
            <strong>{mealData.totalProtein}g</strong>
          </div>
          <div>
            <span>지방</span>
            <strong>{mealData.totalFat}g</strong>
          </div>
        </div>

        <section className="detail-food-section">
          <h3>등록된 음식</h3>

          <div className="detail-food-list">
            {foods.map((food, index) => (
              <button
                className={`detail-food-item ${index === currentIndex ? "active" : ""}`}
                key={food.id}
                onClick={() => setCurrentIndex(index)}
              >
                <div className="detail-food-icon">
                  {food.imageUrl ? <img src={food.imageUrl} alt={food.name} /> : "🍽️"}
                </div>

                <div className="detail-food-info">
                  <strong>{food.name}</strong>
                  <p>{food.kcal} kcal · {food.count}개</p>
                  <span>
                    탄수화물 {food.carbs}g · 단백질 {food.protein}g · 지방 {food.fat}g · 나트륨 {food.sodium}mg
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="detail-ai-box">
          <div className="ai-icon">🤖</div>
          <p>
            단백질 섭취가 충분해요! 섬유질이 조금 부족하니 채소나 과일을
            추가해보는 건 어떨까요?
          </p>
        </div>

        <button className="detail-close-btn" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

export default MealDetailModal;
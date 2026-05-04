import React, { useState } from "react";
import "./MealRecordDetail.css";

const MealRecordDetail = () => {
  const [activeMeal, setActiveMeal] = useState("아침");

  const meals = ["아침", "점심", "저녁"];

  // ✅ 샘플 데이터 (나중에 API로 교체)
  const mealData = {
    kcal: 320,
    foods: ["그릭요거트", "바나나", "아몬드", "삶은 달걀"],
    imageUrl:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300",
    comment:
      "단백질 섭취가 충분해요! 섬유질이 조금 부족하니 채소나 과일을 추가해보는 건 어떨까요?",
  };

  return (
    <div className="meal-detail-container">
      <h2 className="meal-detail-title">식단 기록 상세</h2>

      {/* 날짜 */}
      <div className="date-box">
        <button className="date-arrow">‹</button>
        <span>2024.05.20 월</span>
        <button className="date-arrow">›</button>
      </div>

      {/* 요약 */}
      <div className="summary-box">
        <div className="summary-card">
          <p>총 섭취 칼로리</p>
          <h3>1,350 <small>칼로리</small></h3>
        </div>

        <div className="summary-card">
          <p>영양소 균형</p>
          <div className="grade-badge">B+</div>
        </div>
      </div>

      {/* 탭 */}
      <div className="meal-tabs">
        {meals.map((meal) => (
          <button
            key={meal}
            className={activeMeal === meal ? "active" : ""}
            onClick={() => setActiveMeal(meal)}
          >
            {meal}
          </button>
        ))}
      </div>

      {/* 메인 카드 */}
      <div className="meal-content-card">
        <div className="meal-main-info">

          {/* ✅ 이미지 영역 */}
          <div className="meal-photo-box">
            {mealData.imageUrl ? (
              <img src={mealData.imageUrl} alt="식단 이미지" />
            ) : (
              <div className="no-img">🍽️</div>
            )}
          </div>

          {/* 영양 분석 */}
          <div className="nutrition-area">
            <h4>AI 영양분석</h4>

            <div className="nutrient-item">
              <p>탄수화물 <span>[과다]</span></p>
              <div className="bar-bg">
                <div className="bar-fill carb"></div>
              </div>
            </div>

            <div className="nutrient-item">
              <p>단백질 <span>[충분]</span></p>
              <div className="bar-bg">
                <div className="bar-fill protein"></div>
              </div>
            </div>

            <div className="nutrient-item">
              <p>지방 <span>[적당]</span></p>
              <div className="bar-bg">
                <div className="bar-fill fat"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div className="meal-desc">
          <h3>{mealData.kcal} kcal</h3>
          <p>
            {mealData.foods.map((food, i) => (
              <span key={i}>
                {food}
                {i !== mealData.foods.length - 1 && ", "}
              </span>
            ))}
          </p>
        </div>

        {/* AI 코멘트 */}
        <div className="ai-comment-box">
          <div className="ai-icon">🤖</div>
          <p>{mealData.comment}</p>
        </div>

        {/* 버튼 */}
        <button className="record-submit-btn">
          이 식단으로 기록하기
        </button>
      </div>
    </div>
  );
};

export default MealRecordDetail;
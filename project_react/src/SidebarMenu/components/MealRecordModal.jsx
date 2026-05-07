import React, { useState } from "react";

const MealRecordModal = ({ mealType, selectedDate, initialData, onClose, onSave }) => {
  const [mode, setMode] = useState("manual");
  const [foodName, setFoodName] = useState("");

  const [foods, setFoods] = useState(
    initialData?.foods || [
      {
        id: 1,
        name: "그릭요거트",
        kcal: 120,
        count: 1,
        carbs: 12,
        protein: 10,
        fat: 3,
        sodium: 60,
        imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
      },
      {
        id: 2,
        name: "바나나",
        kcal: 80,
        count: 1,
        carbs: 20,
        protein: 1,
        fat: 0,
        sodium: 1,
        imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400",
      },
      {
        id: 3,
        name: "삶은 달걀",
        kcal: 70,
        count: 1,
        carbs: 0,
        protein: 9,
        fat: 5,
        sodium: 70,
        imageUrl: "",
      },
    ]
  );

  const totalKcal = foods.reduce((sum, food) => sum + food.kcal * food.count, 0);
  const totalCarbs = foods.reduce((sum, food) => sum + food.carbs * food.count, 0);
  const totalProtein = foods.reduce((sum, food) => sum + food.protein * food.count, 0);
  const totalFat = foods.reduce((sum, food) => sum + food.fat * food.count, 0);
  const totalSodium = foods.reduce((sum, food) => sum + food.sodium * food.count, 0);

  const addFood = () => {
    const value = foodName.trim();

    if (!value) {
      alert("음식명을 입력해주세요.");
      return;
    }

    const newFood = {
      id: Date.now(),
      name: value,
      kcal: 100,
      count: 1,
      carbs: 15,
      protein: 6,
      fat: 3,
      sodium: 120,
      imageUrl: "",
    };

    setFoods([...foods, newFood]);
    setFoodName("");
  };

  const removeFood = (id) => {
    setFoods(foods.filter((food) => food.id !== id));
  };

  const changeCount = (id, type) => {
    setFoods(
      foods.map((food) => {
        if (food.id !== id) return food;

        const nextCount =
          type === "plus" ? food.count + 1 : Math.max(1, food.count - 1);

        return { ...food, count: nextCount };
      })
    );
  };

  const handleSave = () => {
    if (foods.length === 0) {
      alert("음식을 1개 이상 추가해주세요.");
      return;
    }

    const firstImageFood = foods.find((food) => food.imageUrl);

    onSave({
      foods,
      totalKcal,
      totalCarbs,
      totalProtein,
      totalFat,
      totalSodium,
      imageUrl: firstImageFood?.imageUrl || "",
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="meal-modal">
        <div className="modal-header">
          <div>
            <h2>{mealType} 식단 등록</h2>
            <p>{selectedDate}</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        <div className="record-mode-tabs">
          <button
            className={mode === "manual" ? "active" : ""}
            onClick={() => setMode("manual")}
          >
            ✎ 직접 입력
          </button>
          <button
            className={mode === "photo" ? "active" : ""}
            onClick={() => setMode("photo")}
          >
            📷 사진으로 등록
          </button>
        </div>

        {mode === "manual" ? (
          <>
            <div className="food-input-row">
              <input
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addFood();
                }}
                placeholder="음식명을 검색하세요 (예: 계란, 바나나, 그릭요거트)"
              />
              <button onClick={addFood}>추가</button>
            </div>

            <div className="added-food-header">
              <h3>추가된 음식 ({foods.length})</h3>
              <button onClick={() => setFoods([])}>전체 삭제</button>
            </div>

            <div className="added-food-list">
              {foods.map((food) => (
                <div className="added-food-item" key={food.id}>
                  <div className="food-thumb">
                    {food.imageUrl ? (
                      <img src={food.imageUrl} alt={food.name} />
                    ) : (
                      <span>🍽️</span>
                    )}
                  </div>

                  <div className="food-info">
                    <strong>{food.name}</strong>
                    <span>{food.kcal} kcal</span>
                  </div>

                  <div className="food-count">
                    <button onClick={() => changeCount(food.id, "minus")}>-</button>
                    <span>{food.count} 개</span>
                    <button onClick={() => changeCount(food.id, "plus")}>+</button>
                  </div>

                  <button className="remove-food" onClick={() => removeFood(food.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="photo-upload-box">
            <div className="camera-icon">📷</div>
            <h3>음식 사진을 찍거나 업로드해 주세요</h3>
            <p>AI가 자동으로 인식해 식단으로 추가해드려요!</p>

            <div className="photo-buttons">
              <button>사진 촬영하기</button>
              <button>앨범에서 선택</button>
            </div>

            <small>ⓘ 조명이나 구도에 따라 인식 정확도가 달라질 수 있어요.</small>
          </div>
        )}

        <div className="meal-total-box">
          <div>
            <span>🔥 총 칼로리</span>
            <strong>{totalKcal} kcal</strong>
          </div>
          <div>
            <span>탄수화물</span>
            <strong>{totalCarbs}g</strong>
          </div>
          <div>
            <span>단백질</span>
            <strong>{totalProtein}g</strong>
          </div>
          <div>
            <span>지방</span>
            <strong>{totalFat}g</strong>
          </div>
        </div>

        <div className="modal-ai-tip">
          <span>🤖</span>
          <p>식단을 등록하면 AI가 영양소 균형과 맞춤 피드백을 제공해드려요!</p>
        </div>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onClose}>취소</button>
          <button className="save-btn" onClick={handleSave}>
            AI 분석하고 저장하기 ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealRecordModal;
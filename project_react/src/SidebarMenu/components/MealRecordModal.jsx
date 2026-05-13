import React, { useMemo, useState } from "react";
import "./MealRecordDetail.css";
import { FiTrash2 } from "react-icons/fi";
import axios from "axios";



const favoriteMeals = [
  {
    id: 101,
    name: "고단백 아침 식단",
    foods: ["삶은 달걀", "그릭요거트", "바나나"],
    kcal: 273,
  },
  {
    id: 102,
    name: "가벼운 저녁 식단",
    foods: ["닭가슴살", "오트밀"],
    kcal: 260,
  },
];

function MealRecordModal({
  mealType = "저녁",
  selectedDate = "2026.05.12 화",
  onClose,
  onSave,
}) {
  const [mode, setMode] = useState("manual");
  const [tab, setTab] = useState("search");
  const [keyword, setKeyword] = useState("");
  const [foods, setFoods] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchResults, setSearchResults] = useState([]);



  const searchFood = async () => {
  if (keyword.trim() === "") {
    alert("음식명을 입력하세요!");
    return;
  }

  try {
    const res = await axios.get(
      `http://localhost:8080/api/food/search?keyword=${encodeURIComponent(keyword)}`
    );

    setSearchResults(res.data);
  } catch (err) {
    console.error(err);
    alert("음식 검색 실패!");
  }
};

  const total = useMemo(() => {
    return foods.reduce(
      (acc, food) => {
        acc.kcal += food.kcal * food.count;
        acc.carbs += food.carbs * food.count;
        acc.protein += food.protein * food.count;
        acc.fat += food.fat * food.count;
        return acc;
      },
      { kcal: 0, carbs: 0, protein: 0, fat: 0 }
    );
  }, [foods]);

  const addFood = (food) => {
    setFoods((prev) => {
      const exists = prev.find((item) => item.id === food.id);

      if (exists) {
        return prev.map((item) =>
          item.id === food.id
            ? { ...item, count: item.count + 1 }
            : item
        );
      }

      return [...prev, { ...food, count: 1 }];
    });
  };

  const removeFood = (id) => {
    setFoods((prev) => prev.filter((food) => food.id !== id));
  };

  const changeCount = (id, type) => {
    setFoods((prev) =>
      prev.map((food) => {
        if (food.id !== id) return food;

        const nextCount =
          type === "plus" ? food.count + 1 : Math.max(1, food.count - 1);

        return { ...food, count: nextCount };
      })
    );
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id)
        ? prev.filter((foodId) => foodId !== id)
        : [...prev, id]
    );
  };

  const loadFavoriteMeal = (meal) => {
    const mealFoods = searchResults
      .filter((food) => meal.foods.includes(food.name))
      .map((food) => ({ ...food, count: 1 }));

    setFoods((prev) => {
      const merged = [...prev];

      mealFoods.forEach((food) => {
        const exists = merged.find((item) => item.id === food.id);

        if (exists) {
          exists.count += 1;
        } else {
          merged.push(food);
        }
      });

      return [...merged];
    });
  };

  const handleSave = () => {
    if (foods.length === 0) {
      alert("음식을 1개 이상 추가해주세요!");
      return;
    }

    const payload = {
      mealType,
      selectedDate,
      foods,
      total,
    };

    console.log("저장 데이터:", payload);

    if (onSave) onSave(payload);
  };

  return (
    <div className="modal-backdrop">
      <div className="meal-modal mr-modal">
        <div className="modal-header">
          <div>
            <h2>{mealType} 식단 등록 🍴</h2>
            <p>{selectedDate}</p>
          </div>

          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="record-mode-tabs">
          <button
            type="button"
            className={mode === "manual" ? "active" : ""}
            onClick={() => setMode("manual")}
          >
            ✎ 직접 입력
          </button>

          <button
            type="button"
            className={mode === "photo" ? "active" : ""}
            onClick={() => setMode("photo")}
          >
            📷 사진으로 등록
          </button>
        </div>

        {mode === "manual" ? (
          <>
            <form
              className="food-input-row mr-search-row"
              onSubmit={(e) => {
                e.preventDefault();
                searchFood();
              }}
            >
             <input
                type="text"
                placeholder="음식명을 검색하세요 (예: 계란, 바나나, 그릭요거트)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <button type="submit">검색</button>
            </form>
            <div className="mr-content-tabs">
              <button
                type="button"
                className={tab === "search" ? "active" : ""}
                onClick={() => setTab("search")}
              >
                🔍 검색 결과
              </button>
              <button
                type="button"
                className={tab === "foodFav" ? "active" : ""}
                onClick={() => setTab("foodFav")}
              >
                ⭐ 즐겨찾기 음식
              </button>
              <button
                type="button"
                className={tab === "mealFav" ? "active" : ""}
                onClick={() => setTab("mealFav")}
              >
                📋 즐겨찾기 식단
              </button>
            </div>

            <section className="mr-result-box">
              {tab === "search" &&
                searchResults.map((food) => (
                  <FoodRow
                    key={food.foNum}
                    food={{
                      id: food.foNum,
                      name: food.foName,
                      kcal: food.foKcal,
                      carbs: food.foCarbs,
                      protein: food.foProtein,
                      fat: food.foFat,
                      image: food.foImage,
                    }}
                    isFavorite={favorites.includes(food.foNum)}
                    onAdd={() =>
                      addFood({
                        id: food.foNum,
                        name: food.foName,
                        kcal: food.foKcal,
                        carbs: food.foCarbs,
                        protein: food.foProtein,
                        fat: food.foFat,
                        image:
                          food.foImage ||
                          "https://via.placeholder.com/80x80.png?text=Food",
                      })
                    }
                    onFavorite={() => toggleFavorite(food.foNum)}
                  />
                ))}

              {tab === "foodFav" &&
                searchResults
                  .filter((food) => favorites.includes(food.foNum))
                  .map((food) => (
                    <FoodRow
                      key={food.foNum}
                      food={{
                        id: food.foNum,
                        name: food.foName,
                        kcal: food.foKcal,
                        carbs: food.foCarbs,
                        protein: food.foProtein,
                        fat: food.foFat,
                        image:
                          food.foImage ||
                          "https://via.placeholder.com/80x80.png?text=Food",
                      }}
                      isFavorite={true}
                      onAdd={() =>
                        addFood({
                          id: food.foNum,
                          name: food.foName,
                          kcal: food.foKcal,
                          carbs: food.foCarbs,
                          protein: food.foProtein,
                          fat: food.foFat,
                          image:
                            food.foImage ||
                            "https://via.placeholder.com/80x80.png?text=Food",
                        })
                      }
                      onFavorite={() => toggleFavorite(food.foNum)}
                    />
                  ))}
              {tab === "mealFav" &&
                favoriteMeals.map((meal) => (
                  <div className="mr-favorite-meal" key={meal.id}>
                    <div>
                      <strong>{meal.name}</strong>
                      <p>{meal.foods.join(", ")}</p>
                      <span>{meal.kcal} kcal</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadFavoriteMeal(meal)}
                    >
                      불러오기
                    </button>
                  </div>
                ))}
            </section>
          </>
        ) : (
          <div className="photo-drop-zone">
            <div className="upload-icon">📷</div>
            <h3>사진으로 식단 등록</h3>
            <p>
              음식 사진을 업로드하면
              <br />
              AI가 음식을 분석해드려요!
            </p>

            <label className="upload-label">
              사진 업로드
              <input type="file" accept="image/*" hidden />
            </label>

            <small>JPG, PNG 파일을 등록할 수 있어요.</small>
          </div>
        )}

        <section className="mr-added-section">
          <div className="added-food-header">
            <h3>추가된 음식 ({foods.length})</h3>
            <button type="button" onClick={() => setFoods([])}>
              전체 삭제
            </button>
          </div>

          {foods.length === 0 ? (
            <div className="added-food-empty">
              아직 추가된 음식이 없어요.
              <br />
              직접 입력하거나 사진으로 음식을 추가해보세요!
            </div>
          ) : (
            <div className="mr-added-list">
              {foods.map((food) => (
                <div className="mr-added-item" key={food.id}>
                  <img src={food.image} alt={food.name} />

                  <div className="mr-added-info">
                    <strong>{food.name}</strong>
                    <span>{food.kcal} kcal</span>
                  </div>

                  <div className="food-count">
                    <button
                      type="button"
                      onClick={() => changeCount(food.id, "minus")}
                    >
                      −
                    </button>
                    <span>{food.count}</span>
                    <button
                      type="button"
                      onClick={() => changeCount(food.id, "plus")}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`mr-star-btn ${
                      favorites.includes(food.id) ? "active" : ""
                    }`}
                    onClick={() => toggleFavorite(food.id)}
                  >
                    ★
                  </button>

                  <button
                    type="button"
                    className="mr-trash-btn"
                    onClick={() => removeFood(food.id)}
                  >
                    < FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mr-total-box">
          <div className="mr-robot">🤖</div>

          <div className="mr-total-main">
            <span>🔥 총 칼로리</span>
            <strong>{total.kcal}</strong>
            <em>kcal</em>
          </div>

          <div>
            <span>탄수화물</span>
            <strong>{total.carbs}g</strong>
          </div>

          <div>
            <span>단백질</span>
            <strong>{total.protein}g</strong>
          </div>

          <div>
            <span>지방</span>
            <strong>{total.fat}g</strong>
          </div>
        </section>

        <div className="modal-ai-tip mr-ai-tip">
          <span>🤖</span>
          <p>
            식단을 등록하면 AI가 영양소 균형과
            <br />
            맞춤 피드백을 제공해드려요!
          </p>
        </div>

        <button type="button" className="mr-meal-fav-btn">
          ♡ 현재 식단 즐겨찾기 저장
        </button>

        <div className="modal-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            취소
          </button>

          <button type="button" className="detail-save-btn" onClick={handleSave}>
            AI 분석하고 저장하기 ✨
          </button>
        </div>
      </div>
    </div>
  );
}

function FoodRow({ food, isFavorite, onAdd, onFavorite }) {
  return (
    <div className="mr-food-row">
      {food.image ? (
        <img src={food.image} alt={food.name} />
      ) : (
        <div className="food-no-image">🍽️</div>
      )}
      <div className="mr-food-info">
        <strong>{food.name}</strong>
        <span>{food.kcal} kcal</span>
      </div>

      <button
        type="button"
        className={`mr-star-btn ${isFavorite ? "active" : ""}`}
        onClick={onFavorite}
      >
        ★
      </button>

      <button type="button" className="mr-add-btn" onClick={onAdd}>
        + 추가
      </button>
    </div>
  );
}

export default MealRecordModal;
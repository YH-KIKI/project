import axios from "axios";
import React, { useMemo, useState } from "react";
import "./MealRecordDetail.css";
import { FiTrash2, FiHeart } from "react-icons/fi";

function MealRecordModal({
  mealType = "저녁",
  selectedDate = "2026.05.12 화",
  initialData = null,
  onClose,
  onSave,
}) {
  const [mode, setMode] = useState("manual");
  const [tab, setTab] = useState("search");
  const [keyword, setKeyword] = useState("");

  const [favorites, setFavorites] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [favoriteFoods, setFavoriteFoods] = useState([]);
  const [favoriteMeals, setFavoriteMeals] = useState([]);

  const userNum = 1;

  const foodImage = (image) =>
    image || "https://via.placeholder.com/80x80.png?text=Food";

  const makeUid = () =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const makeFoodItem = (food) => ({
    uid: makeUid(),
    id: food.id || food.foNum,
    name: food.name || food.foName,
    kcal: food.kcal || food.mdKcal || food.foKcal || 0,
    carbs: food.carbs || food.foCarbs || 0,
    protein: food.protein || food.foProtein || 0,
    fat: food.fat || food.foFat || 0,
    image: foodImage(food.image || food.foImage),
    count: food.count || food.portion || food.mdPortion || food.mfPortion || 1,
  });

  const normalizeInitialFoods = () => {
    if (!initialData?.foods) return [];

    const merged = [];

    initialData.foods.forEach((food) => {
      const item = makeFoodItem(food);
      const exists = merged.find((m) => m.id === item.id);

      if (exists) {
        exists.count += item.count;
        exists.kcal += item.kcal;
      } else {
        merged.push(item);
      }
    });

    return merged;
  };

  const [foods, setFoods] = useState(normalizeInitialFoods);

  const toFoodItem = (food) => ({
    uid: makeUid(),
    id: food.foNum,
    name: food.foName,
    kcal: food.foKcal,
    carbs: food.foCarbs,
    protein: food.foProtein,
    fat: food.foFat,
    image: foodImage(food.foImage),
    count: 1,
  });

  const total = useMemo(() => {
    const result = foods.reduce(
      (acc, food) => {
        acc.kcal += Number(food.kcal || 0) * Number(food.count || 1);
        acc.carbs += Number(food.carbs || 0) * Number(food.count || 1);
        acc.protein += Number(food.protein || 0) * Number(food.count || 1);
        acc.fat += Number(food.fat || 0) * Number(food.count || 1);
        return acc;
      },
      { kcal: 0, carbs: 0, protein: 0, fat: 0 }
    );

    return {
      kcal: Math.round(result.kcal),
      carbs: Number(result.carbs.toFixed(1)),
      protein: Number(result.protein.toFixed(1)),
      fat: Number(result.fat.toFixed(1)),
    };
  }, [foods]);

  const clearAllFoods = () => {
    setFoods([]);
  };

  const searchFood = async () => {
    if (keyword.trim() === "") {
      alert("음식명을 입력하세요!");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:8080/api/food/search?keyword=${encodeURIComponent(
          keyword
        )}`
      );

      setSearchResults(res.data);
      setTab("search");
    } catch (err) {
      console.error("음식 검색 실패:", err);
      alert("음식 검색 실패!");
    }
  };

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

      return [...prev, { ...food, uid: food.uid || makeUid(), count: food.count || 1 }];
    });
  };

  const removeFood = (uid) => {
    setFoods((prev) => prev.filter((food) => food.uid !== uid));
  };

  const changeCount = (uid, type) => {
    setFoods((prev) =>
      prev.map((food) => {
        if (food.uid !== uid) return food;

        const nextCount =
          type === "plus" ? food.count + 1 : Math.max(1, food.count - 1);

        return { ...food, count: nextCount };
      })
    );
  };

  const addSingleFoodFavorite = async (foNum) => {
    try {
      await axios.post("http://localhost:8080/api/favorite/single-food", {
        userNum,
        foNum,
        sfPortion: 100,
      });

      setFavorites((prev) => (prev.includes(foNum) ? prev : [...prev, foNum]));
      alert("음식 즐겨찾기에 추가했어요!");
    } catch (err) {
      console.error("음식 즐겨찾기 추가 실패:", err);
      alert("이미 추가된 음식이거나 저장 실패!");
    }
  };

  const loadSingleFoodFavorites = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/favorite/single-food?userNum=${userNum}`
      );

      setFavoriteFoods(res.data);
      setFavorites(res.data.map((food) => food.foNum));
    } catch (err) {
      console.error("즐겨찾기 음식 조회 실패:", err);
      alert("즐겨찾기 음식 조회 실패!");
    }
  };

  const deleteSingleFoodFavorite = async (sfNum, foNum) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/favorite/single-food?userNum=${userNum}&sfNum=${sfNum}`
      );

      setFavoriteFoods((prev) => prev.filter((food) => food.sfNum !== sfNum));
      setFavorites((prev) => prev.filter((id) => id !== foNum));

      alert("음식 즐겨찾기에서 삭제했어요!");
    } catch (err) {
      console.error("음식 즐겨찾기 삭제 실패:", err);
      alert("음식 즐겨찾기 삭제 실패!");
    }
  };

  const loadMealFavorites = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/favorite/meal?userNum=${userNum}`
      );

      setFavoriteMeals(res.data);
    } catch (err) {
      console.error("즐겨찾기 식단 조회 실패:", err);
      alert("즐겨찾기 식단 조회 실패!");
    }
  };

  const deleteMealFavorite = async (mfNum) => {
    try {
      await axios.delete(
        `http://localhost:8080/api/favorite/meal?userNum=${userNum}&mfNum=${mfNum}`
      );

      setFavoriteMeals((prev) => prev.filter((meal) => meal.mfNum !== mfNum));

      alert("즐겨찾기 식단에서 삭제했어요!");
    } catch (err) {
      console.error("즐겨찾기 식단 삭제 실패:", err);
      alert("즐겨찾기 삭제 실패!");
    }
  };

  const loadFavoriteMeal = (meal) => {
    if (!meal.foods || meal.foods.length === 0) {
      alert("불러올 음식 정보가 없어요!");
      return;
    }

    const mealFoods = meal.foods.map((food) =>
      makeFoodItem({
        id: food.foNum,
        name: food.foName,
        kcal: food.foKcal || food.mdKcal || 0,
        carbs: food.foCarbs || 0,
        protein: food.foProtein || 0,
        fat: food.foFat || 0,
        image: food.foImage,
        count: food.count || food.mdPortion || food.mfPortion || 1,
      })
    );

    setFoods((prev) => {
      const merged = [...prev];

      mealFoods.forEach((food) => {
        const exists = merged.find((item) => item.id === food.id);

        if (exists) {
          exists.count += food.count;
        } else {
          merged.push(food);
        }
      });

      return merged;
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
                onClick={() => {
                  setTab("foodFav");
                  loadSingleFoodFavorites();
                }}
              >
                ⭐ 즐겨찾기 음식
              </button>

              <button
                type="button"
                className={tab === "mealFav" ? "active" : ""}
                onClick={() => {
                  setTab("mealFav");
                  loadMealFavorites();
                }}
              >
                📋 즐겨찾기 식단
              </button>
            </div>

            <section className="mr-result-box">
              {tab === "search" &&
                searchResults.map((food) => (
                  <FoodRow
                    key={food.foNum}
                    food={toFoodItem(food)}
                    isFavorite={favorites.includes(food.foNum)}
                    onAdd={() => addFood(toFoodItem(food))}
                    onFavorite={() => addSingleFoodFavorite(food.foNum)}
                    buttonText="+ 추가"
                  />
                ))}

              {tab === "foodFav" &&
                favoriteFoods.map((food) => (
                  <FoodRow
                    key={food.sfNum}
                    food={toFoodItem(food)}
                    isFavorite={true}
                    onAdd={() => addFood(toFoodItem(food))}
                    onFavorite={() =>
                      deleteSingleFoodFavorite(food.sfNum, food.foNum)
                    }
                    buttonText="+ 추가"
                  />
                ))}

              {tab === "mealFav" &&
                favoriteMeals.map((meal) => (
                  <div className="mr-food-row mr-meal-row" key={meal.mfNum}>
                    <div className="mr-meal-icon">🍱</div>

                    <div className="mr-food-info">
                      <strong>{meal.mfName || "즐겨찾기 식단"}</strong>

                      <span>
                        {meal.foods && meal.foods.length > 0
                          ? meal.foods.map((food) => food.foName).join(" · ")
                          : "음식 정보 없음"}
                      </span>

                      <b className="mr-meal-kcal">
                        {meal.totalKcal || meal.mfKcal || 0} kcal
                      </b>
                    </div>

                    <button
                      type="button"
                      className="mr-heart-btn active"
                      onClick={() => deleteMealFavorite(meal.mfNum)}
                    >
                      <FiHeart />
                    </button>

                    <button
                      type="button"
                      className="mr-add-btn"
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

            <button type="button" onClick={clearAllFoods}>
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
                <div className="mr-added-item" key={food.uid}>
                  <img src={food.image} alt={food.name} />

                  <div className="mr-added-info">
                    <strong>{food.name}</strong>
                    <span>{food.kcal} kcal</span>
                  </div>

                  <div className="food-count">
                    <button
                      type="button"
                      onClick={() => changeCount(food.uid, "minus")}
                    >
                      −
                    </button>

                    <span>{food.count}</span>

                    <button
                      type="button"
                      onClick={() => changeCount(food.uid, "plus")}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`mr-star-btn ${
                      favorites.includes(food.id) ? "active" : ""
                    }`}
                    onClick={() => addSingleFoodFavorite(food.id)}
                  >
                    ★
                  </button>

                  <button
                    type="button"
                    className="mr-trash-btn"
                    onClick={() => removeFood(food.uid)}
                  >
                    <FiTrash2 />
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

function FoodRow({ food, isFavorite, onAdd, onFavorite, buttonText }) {
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
        {buttonText || "+ 추가"}
      </button>
    </div>
  );
}

export default MealRecordModal;
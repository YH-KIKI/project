import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MealFavoriteDetailModal from "./MealFavoriteDetailModal";
import MealTypeSelectModal from "./MealTypeSelectModal";
import "./FavoritePage.css";

const FavoritePage = () => {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user")
  );
  const userNum = user?.user_num;

  const SERVER_URL =
    process.env.REACT_APP_API_URL ||
    window.location.origin;

  const getImageUrl = (path) => {
    if (!path) return null;

    return `${SERVER_URL}${path}`;
  };


  const [activeTab, setActiveTab] = useState("food");
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealFilter, setMealFilter] = useState("전체");

  const [foodFavorites, setFoodFavorites] = useState([]);
  const [mealFavorites, setMealFavorites] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const [isMealTypeModalOpen, setIsMealTypeModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedLoadMeal, setSelectedLoadMeal] = useState(null);

  const [newFood, setNewFood] = useState({
    name: "",
    kcal: "",
    carbs: "",
    protein: "",
    fat: "",
    image: "",
  });

  const [newMeal, setNewMeal] = useState({
    title: "",
    foods: "",
    kcal: "",
    carbs: "",
    protein: "",
    fat: "",
    type: "아침",
    image: "",
  });

  useEffect(() => {
    fetchFoodFavorites();
    fetchMealFavorites();
  }, []);

  const fetchFoodFavorites = async () => {
    try {

      const res = await axios.get(
        `/api/favorite/single-food?userNum=${userNum}`
      );

      const converted = res.data.map((food) => ({
        id: food.sfNum,
        foNum: food.foNum,
        name: food.foName,
        kcal: food.foKcal,
        carbs: food.foCarbs,
        protein: food.foProtein,
        fat: food.foFat,
        natrium: food.foNatrium,
        portion: food.sfPortion,
      }));

      setFoodFavorites(converted);
    } catch (err) {
      console.error("음식 즐겨찾기 조회 실패:", err);
    }
  };

  const fetchMealFavorites = async () => {
    try {

      const res = await axios.get(
        `/api/favorite/meal?userNum=${userNum}`
      );

      const converted = res.data.map((meal) => ({
        id: meal.mfNum,
        mkNum: meal.mkNum,
        type: meal.mkMealType,
        title: meal.mfName,
        foods: meal.foodListStr,
        kcal: meal.totalKcal,
        image: getImageUrl(meal.mkImage),
        recent: "-",
      }));

      setMealFavorites(converted);
    } catch (err) {
      console.error("식단 즐겨찾기 조회 실패:", err);
    }
  };

  const openMealFavoriteDetail = async (meal) => {
    try {

      const res = await axios.get(
        `/api/favorite/meal/detail?userNum=${userNum}&mfNum=${meal.id}`
      );

      setSelectedMeal(res.data);
    } catch (err) {
      console.error("식단 상세 조회 실패:", err);
      alert("식단 상세 조회 실패!");
    }
  };

  const addFoodFavorite = async (foNum) => {
    try {
      await axios.post("/api/favorite/single-food", {
        userNum,
        foNum,
        sfPortion: 100,
      });

      alert("음식 즐겨찾기 저장 완료!");
      fetchFoodFavorites();
    } catch (err) {
      console.error("음식 즐겨찾기 저장 실패:", err);
      alert("음식 즐겨찾기 저장 실패!");
    }
  };

  const addMealFavorite = () => {
    if (!newMeal.title.trim()) {
      alert("식단 이름을 입력해주세요.");
      return;
    }

    setMealFavorites([
      ...mealFavorites,
      {
        id: Date.now(),
        title: newMeal.title,
        foods: newMeal.foods,
        kcal: newMeal.kcal || 0,
        carbs: newMeal.carbs || 0,
        protein: newMeal.protein || 0,
        fat: newMeal.fat || 0,
        type: newMeal.type,
        image: newMeal.image,
        recent: "2024.05.20",
      },
    ]);

    setNewMeal({
      title: "",
      foods: "",
      kcal: "",
      carbs: "",
      protein: "",
      fat: "",
      type: "아침",
      image: "",
    });

    setIsMealModalOpen(false);
  };

  const deleteFoodFavorite = async (sfNum) => {
    try {
      await axios.delete(
        `/api/favorite/single-food?userNum=${userNum}&sfNum=${sfNum}`
      );

      setFoodFavorites((prev) => prev.filter((food) => food.id !== sfNum));
    } catch (err) {
      console.error("음식 즐겨찾기 삭제 실패:", err);
      alert("삭제 실패!");
    }
  };

  const filteredMealFavorites =
    mealFilter === "전체"
      ? mealFavorites
      : mealFavorites.filter((meal) => meal.type === mealFilter);

  const openMealTypeModal = (food) => {
    setSelectedFood(food);
    setSelectedLoadMeal(null);
    setIsMealTypeModalOpen(true);
  };

  const openMealLoadModal = (meal) => {
    setSelectedLoadMeal(meal);
    setSelectedFood(null);
    setIsMealTypeModalOpen(true);
  };

  const handleMealTypeSelect = async (mealType) => {
    if (selectedFood) {
      navigate("/record", {
        state: {
          fromFavorite: true,
          selectedFood,
          mealType,
        },
      });

      setIsMealTypeModalOpen(false);
      setSelectedFood(null);
      setSelectedLoadMeal(null);
      return;
    }

    if (selectedLoadMeal) {
      try {

        const res = await axios.get(
          `/api/favorite/meal/detail?userNum=${userNum}&mfNum=${selectedLoadMeal.id}`
        );

        navigate("/record", {
          state: {
            fromFavoriteMeal: true,
            selectedMeal: res.data,
            mealType,
          },
        });
      } catch (err) {
        console.error("식단 불러오기 실패:", err);
        alert("식단 불러오기 실패!");
      }

      setIsMealTypeModalOpen(false);
      setSelectedFood(null);
      setSelectedLoadMeal(null);
    }
  };

  return (
    <div className="favorite-container">
      <div className="favorite-header">
        <h2>즐겨찾기 & 식단 불러오기</h2>
        <p>자주 먹는 음식과 저장한 식단을 빠르게 활용해보세요!</p>
      </div>

      <div className="favorite-tabs">
        <button
          className={activeTab === "food" ? "active" : ""}
          onClick={() => setActiveTab("food")}
        >
          ⭐ 음식 즐겨찾기
        </button>

        <button
          className={activeTab === "meal" ? "active" : ""}
          onClick={() => setActiveTab("meal")}
        >
          📋 저장한 식단
        </button>
      </div>

      {activeTab === "food" && (
        <>
          <div className="search-row">
            <input placeholder="즐겨찾기 음식 검색" />
            <button>검색</button>
          </div>

          <div className="food-grid">
            {foodFavorites.map((food) => (
              <div className="food-card" key={food.id}>
                <div className="food-title-area">
                  <h3>{food.name}</h3>
                </div>

                <div className="nutrition-grid">
                  <div className="nutrition-chip carb">
                    🍞 탄수화물 {food.carbs}g
                  </div>

                  <div className="nutrition-chip protein">
                    🥩 단백질 {food.protein}g
                  </div>

                  <div className="nutrition-chip fat">
                    🥑 지방 {food.fat}g
                  </div>

                  <div className="nutrition-chip sodium">
                    🧂 나트륨 {food.natrium}mg
                  </div>
                </div>

                <div className="food-bottom-row">

                  <div className="food-kcal">
                    <div>🔥 칼로리</div>
                     {food.kcal} kcal
                  </div>

                  <div className="food-card-actions">
                    <button
                      className="pink-btn"
                      onClick={() => openMealTypeModal(food)}
                    >
                      + 식단추가
                    </button>

                    <button
                      className="meal-delete-btn"
                      onClick={() => deleteFoodFavorite(food.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                </div>

              </div>

            ))}
          </div>

          <button
            className="add-large-btn"
            onClick={() => setIsFoodModalOpen(true)}
          >
            + 새 음식 즐겨찾기 추가
          </button>
        </>
      )}

      {activeTab === "meal" && (
        <>
          <div className="meal-filter-tabs">
            {["전체", "아침", "점심", "저녁"].map((type) => (
              <button
                key={type}
                className={mealFilter === type ? "active" : ""}
                onClick={() => setMealFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="meal-list">
            {filteredMealFavorites.map((meal) => (
              <div
                className="fav-meal-card"
                key={meal.id}
                onClick={() => openMealFavoriteDetail(meal)}
              >
                <div className="fav-meal-thumb-wrap">
                  {meal.image ? (
                    <img src={meal.image} alt={meal.title} />
                  ) : (
                    <div className="fav-meal-thumb-empty">🍱</div>
                  )}
                </div>

                <div className="fav-meal-info">
                  <div className="fav-meal-title-row">
                    <span className={`meal-type-badge ${meal.type}`}>
                      {meal.type}
                    </span>
                    <h3>{meal.title}</h3>
                  </div>

                  <p>{meal.foods}</p>
                  <strong>🔥 {meal.kcal} kcal</strong>
                </div>

                <div className="fav-meal-actions">
                  <button
                    className="meal-load-square-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMealLoadModal(meal);
                    }}
                  >
                    <span>+</span>
                  </button>

                  <button
                    className="meal-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("식단 삭제 연결 예정!");
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            className="add-large-btn"
            onClick={() => setIsMealModalOpen(true)}
          >
            + 새 식단 저장하기
          </button>
        </>
      )}

      {isFoodModalOpen && (
        <div className="fav-modal-backdrop">
          <div className="favorite-modal">
            <div className="modal-top">
              <h3>새 음식 즐겨찾기</h3>
              <button onClick={() => setIsFoodModalOpen(false)}>×</button>
            </div>

            <div className="modal-form">
              <input
                placeholder="음식 이름"
                value={newFood.name}
                onChange={(e) =>
                  setNewFood({ ...newFood, name: e.target.value })
                }
              />

              <input
                placeholder="이미지 URL"
                value={newFood.image}
                onChange={(e) =>
                  setNewFood({ ...newFood, image: e.target.value })
                }
              />

              <div className="double-input">
                <input
                  placeholder="칼로리"
                  value={newFood.kcal}
                  onChange={(e) =>
                    setNewFood({ ...newFood, kcal: e.target.value })
                  }
                />

                <input
                  placeholder="탄수화물"
                  value={newFood.carbs}
                  onChange={(e) =>
                    setNewFood({ ...newFood, carbs: e.target.value })
                  }
                />
              </div>

              <div className="double-input">
                <input
                  placeholder="단백질"
                  value={newFood.protein}
                  onChange={(e) =>
                    setNewFood({ ...newFood, protein: e.target.value })
                  }
                />

                <input
                  placeholder="지방"
                  value={newFood.fat}
                  onChange={(e) =>
                    setNewFood({ ...newFood, fat: e.target.value })
                  }
                />
              </div>

              <button className="save-btn" onClick={addFoodFavorite}>
                즐겨찾기 저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {isMealModalOpen && (
        <div className="fav-modal-backdrop">
          <div className="favorite-modal">
            <div className="modal-top">
              <h3>새 식단 저장하기</h3>
              <button onClick={() => setIsMealModalOpen(false)}>×</button>
            </div>

            <div className="modal-form">
              <input
                placeholder="식단 이름"
                value={newMeal.title}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, title: e.target.value })
                }
              />

              <textarea
                placeholder="포함 음식 예: 그릭요거트, 바나나, 삶은 달걀"
                value={newMeal.foods}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, foods: e.target.value })
                }
              />

              <input
                placeholder="이미지 URL"
                value={newMeal.image}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, image: e.target.value })
                }
              />

              <div className="double-input">
                <select
                  value={newMeal.type}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, type: e.target.value })
                  }
                >
                  <option>아침</option>
                  <option>점심</option>
                  <option>저녁</option>
                </select>

                <input
                  placeholder="총 칼로리"
                  value={newMeal.kcal}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, kcal: e.target.value })
                  }
                />
              </div>

              <div className="double-input">
                <input
                  placeholder="탄수화물"
                  value={newMeal.carbs}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, carbs: e.target.value })
                  }
                />

                <input
                  placeholder="단백질"
                  value={newMeal.protein}
                  onChange={(e) =>
                    setNewMeal({ ...newMeal, protein: e.target.value })
                  }
                />
              </div>

              <input
                placeholder="지방"
                value={newMeal.fat}
                onChange={(e) =>
                  setNewMeal({ ...newMeal, fat: e.target.value })
                }
              />

              <button className="save-btn" onClick={addMealFavorite}>
                식단 저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedMeal && (
        <MealFavoriteDetailModal
          meal={selectedMeal}
          onUpdated={(updatedMeal) => {
            setSelectedMeal(updatedMeal);

            setMealFavorites((prev) =>
              prev.map((meal) =>
                meal.id === updatedMeal.mfNum
                  ? {
                      ...meal,
                      title: updatedMeal.mfName,
                    }
                  : meal
              )
            );
          }}
          onClose={() => setSelectedMeal(null)}
          onLoad={() => {
            alert("불러오기 연결 예정!");
          }}
          onDelete={() => {
            setMealFavorites((prev) =>
              prev.filter((meal) => meal.id !== selectedMeal.mfNum)
            );

            setSelectedMeal(null);
          }}
        />
      )}

      {isMealTypeModalOpen && (selectedFood || selectedLoadMeal) && (
        <MealTypeSelectModal
          title={
            selectedFood
              ? `${selectedFood.name}을(를) 어디에 추가할까요?`
              : `${selectedLoadMeal.title} 식단을 어디에 불러올까요?`
          }
          onSelect={handleMealTypeSelect}
          onClose={() => {
            setIsMealTypeModalOpen(false);
            setSelectedFood(null);
            setSelectedLoadMeal(null);
          }}
        />
      )}
    </div>
  );
};

export default FavoritePage;
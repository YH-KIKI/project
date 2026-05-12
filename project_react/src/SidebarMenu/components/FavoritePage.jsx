import React, { useState } from "react";
import { FiTrash2, FiHeart } from "react-icons/fi";
import "./FavoritePage.css";

const FavoritePage = () => {
  const [activeTab, setActiveTab] = useState("food");
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealFilter, setMealFilter] = useState("전체");

  const [foodFavorites, setFoodFavorites] = useState([
    {
      id: 1,
      name: "닭가슴살 샐러드",
      kcal: 320,
      carbs: 15,
      protein: 32,
      fat: 8,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    },
    {
      id: 2,
      name: "그릭요거트 볼",
      kcal: 280,
      carbs: 32,
      protein: 20,
      fat: 6,
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
    },
  ]);

  const [mealFavorites, setMealFavorites] = useState([
    {
      id: 1,
      type: "아침",
      title: "그릭요거트 아침 세트",
      foods: "그릭요거트, 바나나, 삶은 달걀",
      kcal: 270,
      carbs: 32,
      protein: 20,
      fat: 8,
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
      recent: "2024.05.20",
    },
    {
      id: 2,
      type: "점심",
      title: "닭가슴살 점심 세트",
      foods: "닭가슴살, 현미밥, 샐러드",
      kcal: 560,
      carbs: 45,
      protein: 35,
      fat: 10,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
      recent: "2024.05.18",
    },
  ]);

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

  const addFoodFavorite = () => {
    if (!newFood.name.trim()) {
      alert("음식 이름을 입력해주세요.");
      return;
    }

    setFoodFavorites([
      ...foodFavorites,
      {
        id: Date.now(),
        name: newFood.name,
        kcal: newFood.kcal || 0,
        carbs: newFood.carbs || 0,
        protein: newFood.protein || 0,
        fat: newFood.fat || 0,
        image: newFood.image,
      },
    ]);

    setNewFood({
      name: "",
      kcal: "",
      carbs: "",
      protein: "",
      fat: "",
      image: "",
    });

    setIsFoodModalOpen(false);
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

  const filteredMealFavorites =
  mealFilter === "전체"
    ? mealFavorites
    : mealFavorites.filter((meal) => meal.type === mealFilter);

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
          ❤️ 음식 즐겨찾기
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
                <div className="food-img-wrap">
                  {food.image ? (
                    <img src={food.image} alt={food.name} />
                  ) : (
                    <div className="no-favorite-img">등록 사진 없음</div>
                  )}
                  <button className="heart-btn active"><FiHeart /></button>
                </div>

                <div className="food-content">
                  <h3>{food.name}</h3>
                  <p>탄 {food.carbs}g · 단 {food.protein}g · 지 {food.fat}g</p>
                  <strong>{food.kcal} kcal</strong>

                  <div className="food-actions">
                    <button className="pink-btn">식단 추가</button>
                    <button className="meal-delete-btn"><FiTrash2 /></button>
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
              <div className="fav-meal-card" key={meal.id}>
                <div className={`meal-type-badge ${meal.type}`}>
                  {meal.type}
                </div>

                <div className="fav-meal-img">
                  {meal.image ? (
                    <img src={meal.image} alt={meal.title} />
                  ) : (
                    <div className="no-favorite-img">등록 사진 없음</div>
                  )}
                </div>

                <div className="fav-meal-info">
                  <h3>{meal.title}</h3>
                  <p>{meal.foods}</p>
                  <div className="meal-macro">
                    탄 {meal.carbs}g · 단 {meal.protein}g · 지 {meal.fat}g
                  </div>
                  <strong>{meal.kcal} kcal</strong>
                  <small>최근 사용: {meal.recent}</small>
                </div>

                <div className="meal-buttons">
                  <button className="pink-btn">오늘 {meal.type} 불러오기</button>
                  <button className="white-btn">다른 날짜 식단으로 저장</button>
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
                onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              />

              <input
                placeholder="이미지 URL"
                value={newFood.image}
                onChange={(e) => setNewFood({ ...newFood, image: e.target.value })}
              />

              <div className="double-input">
                <input
                  placeholder="칼로리"
                  value={newFood.kcal}
                  onChange={(e) => setNewFood({ ...newFood, kcal: e.target.value })}
                />

                <input
                  placeholder="탄수화물"
                  value={newFood.carbs}
                  onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                />
              </div>

              <div className="double-input">
                <input
                  placeholder="단백질"
                  value={newFood.protein}
                  onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                />

                <input
                  placeholder="지방"
                  value={newFood.fat}
                  onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
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
                onChange={(e) => setNewMeal({ ...newMeal, title: e.target.value })}
              />

              <textarea
                placeholder="포함 음식 예: 그릭요거트, 바나나, 삶은 달걀"
                value={newMeal.foods}
                onChange={(e) => setNewMeal({ ...newMeal, foods: e.target.value })}
              />

              <input
                placeholder="이미지 URL"
                value={newMeal.image}
                onChange={(e) => setNewMeal({ ...newMeal, image: e.target.value })}
              />

              <div className="double-input">
                <select
                  value={newMeal.type}
                  onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })}
                >
                  <option>아침</option>
                  <option>점심</option>
                  <option>저녁</option>
                </select>

                <input
                  placeholder="총 칼로리"
                  value={newMeal.kcal}
                  onChange={(e) => setNewMeal({ ...newMeal, kcal: e.target.value })}
                />
              </div>

              <div className="double-input">
                <input
                  placeholder="탄수화물"
                  value={newMeal.carbs}
                  onChange={(e) => setNewMeal({ ...newMeal, carbs: e.target.value })}
                />

                <input
                  placeholder="단백질"
                  value={newMeal.protein}
                  onChange={(e) => setNewMeal({ ...newMeal, protein: e.target.value })}
                />
              </div>

              <input
                placeholder="지방"
                value={newMeal.fat}
                onChange={(e) => setNewMeal({ ...newMeal, fat: e.target.value })}
              />

              <button className="save-btn" onClick={addMealFavorite}>
                식단 저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritePage;
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MealFavoriteDetailModal from "./MealFavoriteDetailModal";
import MealTypeSelectModal from "./MealTypeSelectModal";
import "./FavoritePage.css";

const FavoritePage = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userNum = user?.user_num;

  const SERVER_URL =
    process.env.REACT_APP_API_URL ||
    window.location.origin;

  const getImageUrl = (path) => {
    if (!path) return null;

    if (path.startsWith("http")) return path;

    return `${SERVER_URL}${path}`;
  };

  const [activeTab, setActiveTab] = useState("meal");
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [mealFilter, setMealFilter] = useState("전체");

  const [foodFavorites, setFoodFavorites] = useState([]);
  const [mealFavorites, setMealFavorites] = useState([]);
  const [recipeFavorites, setRecipeFavorites] = useState([]);

  //검색
  const [foodSearchKeyword, setFoodSearchKeyword] = useState("");
  const [mealSearchKeyword, setMealSearchKeyword] = useState("");
  const [recipeSearchKeyword, setRecipeSearchKeyword] = useState("");

  const [selectedMeal, setSelectedMeal] = useState(null);

  const [isMealTypeModalOpen, setIsMealTypeModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedLoadMeal, setSelectedLoadMeal] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipeModalData, setRecipeModalData] = useState(null);

  // + 버튼 → 아점저 선택 후, 상세 모달에서 저장할 때 필요한 값
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMealSaveMode, setIsMealSaveMode] = useState(false);

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
    fetchRecipeFavorites();
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
        memo: meal.mfMemo || meal.mf_memo || "",
        kcal: meal.totalKcal,
        image: getImageUrl(meal.mkImage),
        recent: "-",
      }));

      setMealFavorites(converted);
    } catch (err) {
      console.error("식단 즐겨찾기 조회 실패:", err);
    }
  };

  const fetchRecipeFavorites = async () => {
    try {
      const res = await axios.get(
        `/api/favorite/recipe?userNum=${userNum}`
      );

      const converted = res.data.map((recipe) => ({
        id: recipe.rfNum || recipe.id || recipe.rcpNum,
        rfNum: recipe.rfNum,
        rcpNum: recipe.rcpNum,
        name: recipe.rcpName,
        image: getImageUrl(recipe.rcpImage),
        way: recipe.rcpWay,
        type: recipe.rcpType,
        kcal: recipe.rcpKcal,
        carbs: recipe.rcpCarbs,
        protein: recipe.rcpProtein,
        fat: recipe.rcpFat,
        natrium: recipe.rcpNatrium,
        parts: recipe.rcpParts,
        aiReason: recipe.aiReason,
        hashtags: recipe.hashtags || [],
      }));

      setRecipeFavorites(converted);
    } catch (err) {
      console.error("레시피 즐겨찾기 조회 실패:", err);
      setRecipeFavorites([]);
    }
  };

  const openRecipeModal = async (recipe) => {
    try {
      const res = await axios.get(
        `/api/fridge/recipe/steps?rcpNum=${recipe.rcpNum}`
      );
      setRecipeModalData({
        ...recipe,
        steps: res.data,
      });
    } catch (err) {
      console.error(err);
      alert("레시피 정보를 불러오지 못했어요 😢");
    }
  };

  // 카드 클릭 시: 그냥 상세보기 모드
  const openMealFavoriteDetail = async (meal) => {
    try {
      const res = await axios.get(
        `/api/favorite/meal/detail?userNum=${userNum}&mfNum=${meal.id}`
      );

      setSelectedMeal(res.data);
      setSelectedMealType(null);
      setSelectedDate(null);
      setIsMealSaveMode(false);
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

      setFoodFavorites((prev) =>
        prev.filter((food) => food.id !== sfNum)
      );
    } catch (err) {
      console.error("음식 즐겨찾기 삭제 실패:", err);
      alert("삭제 실패!");
    }
  };

  const deleteMealFavorite = async (meal) => {
    try {
      await axios.delete(
        `/api/favorite/meal?userNum=${userNum}&mfNum=${meal.id}`
      );

      setMealFavorites((prev) =>
        prev.filter((item) => item.id !== meal.id)
      );

      alert("식단 즐겨찾기를 삭제했어요!");
    } catch (err) {
      console.error("식단 즐겨찾기 삭제 실패:", err);
      alert("식단 삭제 실패!");
    }
  };

  const deleteRecipeFavorite = async (recipe) => {
    try {
      await axios.delete(
        `/api/favorite/recipe?userNum=${userNum}&rfNum=${recipe.rfNum || recipe.id}`
      );

      setRecipeFavorites((prev) =>
        prev.filter((item) => item.id !== recipe.id)
      );

      alert("레시피 즐겨찾기를 삭제했어요!");
    } catch (err) {
      console.error("레시피 즐겨찾기 삭제 실패:", err);

      setRecipeFavorites((prev) =>
        prev.filter((item) => item.id !== recipe.id)
      );

      alert("레시피 즐겨찾기에서 삭제했어요!");
    }
  };

  const filteredFoodFavorites = foodFavorites.filter((food) =>
    food.name
      ?.toLowerCase()
      .includes(foodSearchKeyword.trim().toLowerCase())
  );

  const filteredMealFavorites = mealFavorites
    .filter((meal) =>
      mealFilter === "전체" ? true : meal.type === mealFilter
    )
    .filter((meal) =>
      meal.title
        ?.toLowerCase()
        .includes(mealSearchKeyword.trim().toLowerCase())
    );

  const filteredRecipeFavorites = recipeFavorites.filter((recipe) =>
    recipe.name
      ?.toLowerCase()
      .includes(recipeSearchKeyword.trim().toLowerCase())
  );

  const openMealTypeModal = (food) => {
    setSelectedFood(food);
    setSelectedLoadMeal(null);
    setSelectedRecipe(null);
    setIsMealTypeModalOpen(true);
  };

  // 저장한 식단 + 버튼 클릭
  const openMealLoadModal = (meal) => {
    setSelectedLoadMeal(meal);
    setSelectedFood(null);
    setSelectedRecipe(null);
    setIsMealTypeModalOpen(true);
  };

  const openRecipeLoadModal = (recipe) => {
    setSelectedRecipe(recipe);
    setSelectedFood(null);
    setSelectedLoadMeal(null);
    setIsMealTypeModalOpen(true);
  };

  const closeMealTypeModal = () => {
    setIsMealTypeModalOpen(false);
    setSelectedFood(null);
    setSelectedLoadMeal(null);
    setSelectedRecipe(null);
  };

  const handleMealTypeSelect = async (selectedValue) => {
    const mealType =
      typeof selectedValue === "string"
        ? selectedValue
        : selectedValue?.mealType;

    const date =
      typeof selectedValue === "object"
        ? selectedValue?.date
        : null;

    if (!mealType) {
      alert("식사 타입을 선택해주세요!");
      return;
    }

    // 1) 음식 즐겨찾기 → 기록 페이지에서 모달 열기
    if (selectedFood) {
      navigate("/record", {
        state: {
          fromFavorite: true,
          favoriteType: "food",
          selectedFood,
          mealType,
          date,
        },
      });

      closeMealTypeModal();
      return;
    }

    // 2) 저장한 식단 → 상세 조회 후 기록 페이지에서 모달 열기
    if (selectedLoadMeal) {
      try {
        const res = await axios.get(
          `/api/favorite/meal/detail?userNum=${userNum}&mfNum=${selectedLoadMeal.id}`
        );

        navigate("/record", {
          state: {
            fromFavorite: true,
            favoriteType: "meal",
            selectedMeal: {
              ...res.data,
              mfNum: selectedLoadMeal.id,
              mfName: selectedLoadMeal.title,
            },
            mealType,
            date,
          },
        });

        closeMealTypeModal();
      } catch (err) {
        console.error("식단 상세 불러오기 실패:", err);
        alert("식단 상세 불러오기 실패!");
      }

      return;
    }

    // 3) 레시피 즐겨찾기 → 기록 페이지에서 모달 열기
    if (selectedRecipe) {
      navigate("/record", {
        state: {
          fromFavorite: true,
          favoriteType: "recipe",

          selectedRecipe: {
            ...selectedRecipe,
            isFavorite: true,
          },
          mealType,
          date,
        },
      });

      closeMealTypeModal();
      return;
    }
  };
  // 상세 모달에서 "이 식단 저장하기" 눌렀을 때 실행
  const saveFavoriteMealToRecord = async () => {
    if (!selectedMeal) {
      alert("저장할 식단 정보가 없어요!");
      return;
    }

    if (!selectedMealType) {
      alert("식사 타입을 먼저 선택해주세요!");
      return;
    }

    const foods = selectedMeal.foods || [];

    if (foods.length === 0) {
      alert("저장할 음식 정보가 없어요!");
      return;
    }
    try {
      const convertedFoods = foods.map((food) => {
        const portion = Number(
          food.mdPortion ||
          food.mfPortion ||
          food.portion ||
          food.count ||
          1
        );

        const kcal = Number(
          food.mdKcal ||
          food.foKcal ||
          food.kcal ||
          0
        );

        return {
          foNum: food.foNum,
          mdPortion: portion,
          mdKcal: kcal,
        };
      });

      const mealData = {
        userNum,
        mkMealType: selectedMealType,
        mkUserMemo: selectedMeal.mfMemo || selectedMeal.mf_memo || "",
        mkDietDate: selectedDate,
        foods: convertedFoods,
      };

      const formData = new FormData();

      formData.append(
        "mealData",
        new Blob([JSON.stringify(mealData)], {
          type: "application/json",
        })
      );

      console.log("즐겨찾기 식단 저장 mealData:", mealData);

      await axios.post("/api/meal/record", formData);

      alert("식단 저장 완료!");

      setSelectedMeal(null);
      setSelectedMealType(null);
      setSelectedDate(null);
      setIsMealSaveMode(false);
    } catch (err) {
      console.error("즐겨찾기 식단 저장 실패:", err);
      alert("식단 저장 실패!");
    }
  };

  const saveRecipeToMealRecord = async (recipe, mealType, date) => {
    try {
      await axios.post("/api/meal/recipe-record", {
        userNum,
        mkMealType: mealType,
        mkDietDate: date,
        mkUserMemo: recipe.aiReason || recipe.way || "",

        rcpNum: recipe.rcpNum,
        rcpName: recipe.name,
        rcpImage: recipe.null,

        rcpKcal: recipe.kcal || 0,
        rcpCarbs: recipe.carbs || 0,
        rcpProtein: recipe.protein || 0,
        rcpFat: recipe.fat || 0,
        rcpNatrium: recipe.natrium || 0,
      });

      alert("레시피를 식단에 추가했어요!");
    } catch (err) {
      console.error("레시피 식단 추가 실패:", err);
      alert("레시피 식단 추가 실패!");
    }
  };
  return (
    <div className="favorite-container">
      <div className="favorite-header">
        <h2>즐겨찾기 & 식단 불러오기</h2>
        <p>자주 먹는 음식과 저장한 식단, 레시피를 빠르게 활용해보세요!</p>
      </div>

      <div className="favorite-tabs">
        <button
          className={activeTab === "meal" ? "active" : ""}
          onClick={() => setActiveTab("meal")}
        >
          📋 저장한 식단
        </button>
        
        <button
          className={activeTab === "food" ? "active" : ""}
          onClick={() => setActiveTab("food")}
        >
          ⭐ 음식 즐겨찾기
        </button>

        <button
          className={activeTab === "recipe" ? "active" : ""}
          onClick={() => setActiveTab("recipe")}
        >
          🍳 레시피 즐겨찾기
        </button>
      </div>

      {activeTab === "food" && (
        <>
          <div className="search-row">
            <input
              placeholder="즐겨찾기 음식 검색"
              value={foodSearchKeyword}
              onChange={(e) => setFoodSearchKeyword(e.target.value)}
            />
            <button>검색</button>
          </div>

          <div className="food-grid">
            {filteredFoodFavorites.map((food) => (
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
                      onClick={(e) => {
                        e.stopPropagation();
                        openMealTypeModal(food);
                      }}
                    >
                      + 식단추가
                    </button>
                    <button
                      className="meal-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFoodFavorite(food.id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
     {activeTab === "meal" && (
      <>
        <div className="search-row">
          <input
            placeholder="저장한 식단 이름 검색"
            value={mealSearchKeyword}
            onChange={(e) => setMealSearchKeyword(e.target.value)}
          />
          <button type="button">검색</button>
        </div>

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
                  {meal.memo && (
                    <div className="fav-meal-memo">
                      💬 {meal.memo}
                    </div>
                  )}
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
                    deleteMealFavorite(meal);
                  }}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    )}
      {activeTab === "recipe" && (
        <>
          <div className="search-row">
            <input
              placeholder="즐겨찾기 레시피 검색"
              value={recipeSearchKeyword}
              onChange={(e) => setRecipeSearchKeyword(e.target.value)}
            />
            <button>검색</button>
          </div>

          {filteredRecipeFavorites.length === 0 ? (
            <div className="recipe-empty-box">
              <div>🍳</div>
              <h3>아직 저장한 레시피가 없어요!</h3>
              <p>
                냉장고 추천에서 마음에 드는 레시피를
                <br />
                하트로 저장해보세요.
              </p>
            </div>
          ) : (
            <div className="recipe-favorite-grid">
              {filteredRecipeFavorites.map((recipe) => (
                <div
                  className="recipe-fav-card"
                  key={recipe.id}
                  onClick={() => openRecipeModal(recipe)}
                >
                  <div className="recipe-fav-title-area">
                    <h3>{recipe.name}</h3>
                  </div>

                  <div className="recipe-fav-image-wrap">
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.name} />
                    ) : (
                      <div className="recipe-fav-empty-img">🍳</div>
                    )}
                  </div>

                  <div className="nutrition-grid recipe-nutrition-grid">
                    <div className="nutrition-chip carb">
                      🍞 탄수화물 {recipe.carbs || 0}g
                    </div>

                    <div className="nutrition-chip protein">
                      🥩 단백질 {recipe.protein || 0}g
                    </div>

                    <div className="nutrition-chip fat">
                      🥑 지방 {recipe.fat || 0}g
                    </div>

                    <div className="nutrition-chip sodium">
                      🧂 나트륨 {recipe.natrium || 0}mg
                    </div>
                  </div>

                  {recipe.hashtags?.length > 0 && (
                    <div className="recipe-fav-tags">
                      {recipe.hashtags.slice(0, 4).map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="food-bottom-row recipe-bottom-row">
                    <div className="food-kcal">
                      <div>🔥 칼로리</div>
                      {recipe.kcal || 0} kcal
                    </div>

                    <div className="food-card-actions">
                      <button
                        className="pink-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRecipeLoadModal(recipe);
                        }}
                      >
                        + 식단추가
                      </button>

                      <button
                        className="meal-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRecipeFavorite(recipe);
                        }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          isSaveMode={isMealSaveMode}
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
          onClose={() => {
            setSelectedMeal(null);
            setSelectedMealType(null);
            setSelectedDate(null);
            setIsMealSaveMode(false);
          }}
          onLoad={saveFavoriteMealToRecord}
          onDelete={() => {
            setMealFavorites((prev) =>
              prev.filter((meal) => meal.id !== selectedMeal.mfNum)
            );

            setSelectedMeal(null);
            setSelectedMealType(null);
            setSelectedDate(null);
            setIsMealSaveMode(false);
          }}
        />
      )}

      {isMealTypeModalOpen &&
        (selectedFood || selectedLoadMeal || selectedRecipe) && (
          <MealTypeSelectModal
              title={
                selectedFood
                  ? `${selectedFood.name}을(를) 어디에 추가할까요?`
                  : selectedLoadMeal
                    ? `${selectedLoadMeal.title} 식단을 어디에 추가할까요?`
                    : `${selectedRecipe.name} 레시피를 어디에 추가할까요?`
              }
              onSelect={handleMealTypeSelect}
              onClose={closeMealTypeModal}
              showAlert={!selectedLoadMeal}
            />
        )}
        {recipeModalData && (
        <div
          className="recipe-modal-overlay"
          onClick={() => setRecipeModalData(null)}
        >
          <div
            className="recipe-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="recipe-modal-close"
              onClick={() => setRecipeModalData(null)}
            >
              ✕
            </button>
            <img
              className="recipe-modal-image"
              src={recipeModalData.image}
              alt={recipeModalData.name}
            />
            <div className="recipe-modal-header">
              <div className="recipe-modal-title-wrap">
                <div className="recipe-icon">🍮</div>

                <h2>{recipeModalData.name}</h2>
              </div>
            </div>

            <p className="recipe-modal-desc">
              {recipeModalData.aiReason || recipeModalData.way}
            </p>

            <div className="recipe-modal-tags">
              {recipeModalData.hashtags?.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>

            <div className="recipe-modal-nutrients">
              <div>
                <span>🔥</span>
                <b>칼로리</b>
                <strong>{recipeModalData.kcal} kcal</strong>
              </div>

              <div>
                <span>🍞</span>
                <b>탄수화물</b>
                <strong>{recipeModalData.carbs}g</strong>
              </div>

              <div>
                <span>🥩</span>
                <b>단백질</b>
                <strong>{recipeModalData.protein}g</strong>
              </div>

              <div>
                <span>🥑</span>
                <b>지방</b>
                <strong>{recipeModalData.fat}g</strong>
              </div>

              <div>
                <span>🧂</span>
                <b>나트륨</b>
                <strong>{recipeModalData.natrium}mg</strong>
              </div>
            </div>

            <div className="recipe-modal-section">
              <h4>🧺 사용 재료</h4>

              <ul>
                {recipeModalData.parts
                  ?.split(",")
                  .map((item) => (
                    <li key={item}>{item}</li>
                  ))}
              </ul>
            </div>

            <div className="recipe-modal-section">
              <h4>👩‍🍳 조리 방법</h4>

              <div className="recipe-step-list">
                {recipeModalData.steps
                  ?.filter((step) => step?.stepText)
                  .map((step) => (
                    <p key={step.stepNum}>
                      {step.stepText}
                    </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritePage;
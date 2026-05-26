import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MealRecordModal from "./MealRecordModal";
import MealTypeSelectModal from "./MealTypeSelectModal";
import "./FridgeRecommendation.css";

const MacroItem = ({ name, icon, goal, intake, percent, type }) => {
  return (
    <div className="macro-item">
      <b>
        {name} <span>{icon}</span>
      </b>
      <p>목표: {goal}</p>
      <p>섭취: {intake}</p>

      <div className="macro-progress">
        <span className={type} style={{ width: `${percent}%` }}></span>
      </div>

      <em>{percent}%</em>
    </div>
  );
};

const FridgeRecommendation = () => {

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

  const [summary, setSummary] = useState(null);
  

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });

  const navigate = useNavigate();


  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [isRecommended, setIsRecommended] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [favoriteRecipeNums, setFavoriteRecipeNums] = useState([]);
  const [mealAddRecipe, setMealAddRecipe] = useState(null);
  const [isMealTypeModalOpen, setIsMealTypeModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isMealRecordModalOpen, setIsMealRecordModalOpen] = useState(false);


    

  const ingredientSuggestions = `
  계란
  양파
  대파
  마늘
  감자
  고구마
  당근
  양배추
  상추
  토마토
  오이
  버섯
  새송이버섯
  팽이버섯
  양송이버섯
  두부
  김치
  밥
  닭가슴살
  돼지고기
  소고기
  새우
  오징어
  치즈
  우유
  브로콜리
  애호박
  참치
  햄
  베이컨
  소시지
  고추
  콩나물
  시금치
  깻잎
  사과
  바나나
  딸기
  레몬
  파스타면
  라면
  미나리
  파프리카
  청경채
  연근
  가지
  아보카도
  연어
  전복
  부추
  호박
  무
  배추
  고춧가루
  `.trim().split("\n");

  const quickIngredients = [
    "계란",
    "우유",
    "식빵",
    "토마토",
    "양파",
    "치즈",
    "닭가슴살",
  ];

  const filteredSuggestions = ingredientSuggestions.filter(
    (item) =>
      ingredient.trim() !== "" &&
      item.includes(ingredient.trim()) &&
      !ingredients.includes(item)
  );

  const handleIngredientKeyDown = (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();

    setActiveSuggestionIndex((prev) =>
      prev < filteredSuggestions.length - 1 ? prev + 1 : 0
    );
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();

    setActiveSuggestionIndex((prev) =>
      prev > 0 ? prev - 1 : filteredSuggestions.length - 1
    );
  }

  if (e.key === "Enter") {
    e.preventDefault();

    if (
      activeSuggestionIndex >= 0 &&
      filteredSuggestions[activeSuggestionIndex]
    ) {
      addIngredient(filteredSuggestions[activeSuggestionIndex]);
    } else {
      addIngredient();
    }

    setActiveSuggestionIndex(-1);
  }
};

  const addIngredient = (selectedValue) => {
    const value = (selectedValue || ingredient).trim();

    if (value === "") {
      alert("재료명을 입력해주세요.");
      return;
    }

    if (ingredients.includes(value)) {
      alert("이미 추가된 재료예요.");
      setIngredient("");
      return;
    }

    setIngredients([...ingredients, value]);
    setIngredient("");
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 1400);
  };

  const removeIngredient = (item) => {
    setIngredients(ingredients.filter((ing) => ing !== item));
  };

  const clearIngredients = () => {
    setIngredients([]);
  };

  const handleRecommend = async () => {

    if (ingredients.length === 0) {

      alert("재료를 1개 이상 추가해주세요.");

      return;
    }

    try {

      const res = await axios.post(
        "/api/fridge/recommend",
        {
          ingredients
        }
      );

      console.log(
        "냉장고 추천 결과:",
        res.data
      );

      console.log(
        "recipes:",
        res.data.recipes
      );

      setRecipes(
        res.data.recipes || []
      );

      setIsRecommended(true);

    } catch (err) {

      console.error(
        "냉장고 추천 실패:",
        err
      );

      alert(
        "추천 요청에 실패했어요 😢"
      );
    }
  };

  const kcalPercent = summary?.targetKcal
  ? Math.min(
      (summary.currentKcal / summary.targetKcal) * 100,
      100
    )
  : 0;

  const openRecipeModal = async (recipe) => {
    try {

      const res = await axios.get(
        `/api/fridge/recipe/steps?rcpNum=${recipe.rcpNum}`
      );

      setSelectedRecipe({
        ...recipe,
        steps: res.data
      });

    } catch (err) {

      console.error(err);

      alert("레시피 정보를 불러오지 못했어요 😢");
    }
  };

  const fetchRecipeFavorites = async () => {
    try {
      const res = await axios.get(
        `/api/favorite/recipe?userNum=${userNum}`
      );

      const nums = res.data.map((recipe) => recipe.rcpNum);

      setFavoriteRecipeNums(nums);
    } catch (err) {
      console.error("레시피 즐겨찾기 조회 실패:", err);
    }
  };

  const toggleRecipeFavorite = async (recipe) => {
    const isFavorite = favoriteRecipeNums.includes(recipe.rcpNum);

    try {
      if (isFavorite) {
        await axios.delete(
          `/api/favorite/recipe?userNum=${userNum}&rcpNum=${recipe.rcpNum}`
        );

        setFavoriteRecipeNums((prev) =>
          prev.filter((num) => num !== recipe.rcpNum)
        );

        alert("레시피 즐겨찾기를 해제했어요!");
        return;
      }

      await axios.post("/api/favorite/recipe", {
        userNum,
        rcpNum: recipe.rcpNum,
      });

      setFavoriteRecipeNums((prev) => [
        ...prev,
        recipe.rcpNum,
      ]);

      alert("레시피 즐겨찾기에 저장했어요!");
    } catch (err) {
      console.error("레시피 즐겨찾기 처리 실패:", err);
      alert("레시피 즐겨찾기 처리 실패!");
    }
  };

  const closeMealTypeModal = () => {
    setIsMealTypeModalOpen(false);
    setMealAddRecipe(null);
  };
  const handleMealTypeSelect = ({ mealType, date }) => {
    setSelectedMealType(mealType);
    setSelectedDate(date);

    setIsMealTypeModalOpen(false);
    setIsMealRecordModalOpen(true);
  };

  useEffect(() => {
    const fetchSummary = async () => {

      try {
        const user =
          JSON.parse(localStorage.getItem("user"));

        const userNum = user?.user_num;

        const res = await axios.get(
          `/api/fridge/summary?userNum=${userNum}`
        );

        setSummary(res.data);

      } catch (err) {

        console.error(err);

      }
    };

    fetchSummary();

  }, []);

  useEffect(() => {
    if (userNum) {
      fetchRecipeFavorites();
    }
  }, [userNum]);

  return (
    <div className="fridge-container">
      <div className="fridge-top">
        <div>
          <h2 className="fridge-title">냉장고 추천</h2>
          <div className="sub-text">
            보유한 재료를 입력하고 추천받아보세요!
          </div>
        </div>
        <span className="today">{today}</span>
      </div>

      <section className="goal-summary-card">
        <h3>나의 목표 섭취량</h3>

        <div className="goal-layout">
          <div className="goal-side">
            <MacroItem
              name="탄수화물"
              icon="🍞"
              goal={`${summary?.targetCarbs || 0}g`}
              intake={`${summary?.currentCarbs || 0}g`}
              percent={summary?.carbsPercent || 0}
              type="carb"
            />
            <MacroItem
              name="지방"
              icon="🥑"
              goal={`${summary?.targetFat || 0}g`}
              intake={`${summary?.currentFat || 0}g`}
              percent={summary?.fatPercent || 0}
              type="fat"
            />
          </div>

          <div 
            className="calorie-circle"
              style={{
              background: `conic-gradient(
                #ff7f9d 0% ${kcalPercent}%,
                #f3e9ea ${kcalPercent}% 100%
              )`
            }}
            >
            <div className="circle-inner">
              <strong>{summary?.currentKcal || 0}</strong>
              <span>kcal</span>
              <p>
                목표 {summary?.targetKcal || 0} kcal
              </p>
            </div>
          </div>

          <div className="goal-side">
            <MacroItem
              name="단백질"
              icon="🥩"
              goal={`${summary?.targetProtein || 0}g`}
              intake={`${summary?.currentProtein || 0}g`}
              percent={summary?.proteinPercent || 0}
              type="protein"
            />
            <MacroItem
              name="나트륨"
              icon="🧂"
              goal={`${summary?.targetNatrium || 0}mg`}
              intake={`${summary?.currentNatrium || 0}mg`}
              percent={summary?.natriumPercent || 0}
              type="sodium"
            />
          </div>
        </div>
      </section>

      <section className="ingredient-section">
        <h3>내 냉장고 음식 추가</h3>
        <p>냠냠이가 냉장고를 열어봤어요! 지금 있는 재료를 알려주세요 🍳</p>

        <div className="step-box">
          <div className="step-row input-step-row">
            <div className="step-label">
              <span>1</span>
              <b>재료 입력</b>
            </div>

            <div className="ingredient-input-area">
              <div className="input-wrap">
                <input
                  type="text"
                  placeholder="재료명을 입력하세요 (예: 계란, 우유, 양파)"
                  value={ingredient}
                  onChange={(e) => {
                    setIngredient(e.target.value);
                    setActiveSuggestionIndex(-1);
                  }}
                  onKeyDown={handleIngredientKeyDown}
                />
                {ingredient && filteredSuggestions.length > 0 && (
                  <div className="suggestion-box">
                  {filteredSuggestions.map((item, index) => (
                    <button
                      key={item}
                      type="button"
                      className={activeSuggestionIndex === index ? "active" : ""}
                      onMouseDown={() => addIngredient(item)}
                    >
                      🧺 {item}
                    </button>
                  ))}
                  </div>
                )}
              </div>

              <button className="add-btn" onClick={() => addIngredient()}>
                추가
              </button>
            </div>

            {showSuccess && (
              <div className="success-msg">✅ 재료가 추가되었어요!</div>
            )}
          </div>

          <div className="step-row ingredient-list-row">
            <div className="step-label">
              <span>2</span>
              <b>추가된 재료</b>
            </div>

            <div className="ingredient-list-header">
              <span>{ingredients.length}/20</span>
              {ingredients.length > 0 && (
                <button type="button" onClick={clearIngredients}>
                  전체 삭제
                </button>
              )}
            </div>

            <div className="ingredient-tags">
              {ingredients.length === 0 ? (
                <p className="empty-ingredient-text">
                  아직 추가된 재료가 없어요.
                </p>
              ) : (
                ingredients.map((item) => (
                  <button key={item} onClick={() => removeIngredient(item)}>
                    {item} ×
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="step-row">
            <div className="step-label">
              <span>3</span>
              <b>추천 요청</b>
            </div>

            <div className="recommend-action">
              <button onClick={handleRecommend}>
                ✨ 이 재료로 AI 추천받기
              </button>
              <p>ⓘ 재료가 1개 이상 있어야 추천이 가능해요!</p>
            </div>
          </div>
        </div>
      </section>

      {!isRecommended ? (
        <section className="empty-recipe-section">
          <h3>AI 레시피 추천</h3>

          <div className="empty-box">
            <div className="fridge-icon">🧊</div>
            <h4>아직 추천 결과가 없어요!</h4>
            <p>
              냉장고 재료를 추가한 뒤
              <br />
              추천받기 버튼을 눌러주세요 😊
            </p>
          </div>
        </section>
      ) : (
       <section className="recipe-section">
        <div className="recipe-header">
          <div>
            <h3>✨ AI 레시피 추천 결과</h3>
            <p>
              보유 재료를 활용해 만들 수 있는 추천 메뉴예요!
            </p>
          </div>
        </div>

        <div className="recipe-list">
          {recipes.map((recipe) => (

            <div
              className="recipe-card-v2"
              key={recipe.rcpNum}
            >

              {/* 상단 */}
              <div className="recipe-card-top">

                <div className="recipe-title-wrap">

                  <div className="recipe-icon">
                    🍮
                  </div>

                  <h4>
                    {recipe.rcpName}
                  </h4>
                  <button
                    className={
                      favoriteRecipeNums.includes(recipe.rcpNum)
                        ? "recipe-favorite-btn active"
                        : "recipe-favorite-btn"
                    }
                    onClick={() => toggleRecipeFavorite(recipe)}
                  >
                    <FiHeart />
                  </button>

                </div>

                <button 
                  className="recipe-detail-btn"
                  onClick={() => openRecipeModal(recipe)}
                >
                  레시피 보기 →
                </button>

              </div>

              {/* 중단 */}
              <div className="recipe-middle">

                <img
                  src={getImageUrl(recipe.rcpImage)}
                  alt={recipe.rcpName}
                />

                <div className="recipe-middle-right">

                  <p className="recipe-desc">
                    {recipe.aiReason || recipe.rcpWay}
                  </p>

                  <div className="recipe-tags">

                {recipe.hashtags?.map((tag) => (

                  <span key={tag}>
                    #{tag}
                  </span>

                ))}
                  </div>

                </div>

              </div>

              {/* 하단 영양소 */}
              <div className="recipe-nutrient-bar">

                <div className="nutrient-item">

                  <span className="nutrient-icon">
                    🔥
                  </span>

                  <strong>
                    {recipe.rcpKcal} kcal
                  </strong>

                  <p>예상 칼로리</p>

                </div>

                <div className="nutrient-item">
                  <span>🍞</span>
                  <b>탄수화물</b>
                  <strong>{recipe.rcpCarbs}g</strong>
                </div>

                <div className="nutrient-item">
                  <span>🥩</span>
                  <b>단백질</b>
                  <strong>{recipe.rcpProtein}g</strong>
                </div>

                <div className="nutrient-item">
                  <span>🥑</span>
                  <b>지방</b>
                  <strong>{recipe.rcpFat}g</strong>
                </div>

                <div className="nutrient-item">
                  <span>🧂</span>
                  <b>나트륨</b>
                  <strong>{recipe.rcpNatrium}mg</strong>
                </div>

              </div>

            </div>

          ))}

        </div>
      </section>
      )}
      {/* 모달 */}
      {selectedRecipe && (
      <div
        className="recipe-modal-overlay"
        onClick={() => setSelectedRecipe(null)}
      >

        <div
          className="recipe-modal"
          onClick={(e) => e.stopPropagation()}
        >

          {/* 닫기 */}
          <button
            className="recipe-modal-close"
            onClick={() => setSelectedRecipe(null)}
          >
            ✕
          </button>

          {/* 이미지 */}
          <img
            className="recipe-modal-image"
            src={getImageUrl(selectedRecipe.rcpImage)}
            alt={selectedRecipe.rcpName}
          />

          {/* 제목 */}
          <div className="recipe-modal-header">

            <div className="recipe-modal-title-wrap">

              <div className="recipe-icon">
                🍮
              </div>

              <h2>
                {selectedRecipe.rcpName}
              </h2>
              <button
                className={
                  favoriteRecipeNums.includes(selectedRecipe.rcpNum)
                    ? "recipe-modal-favorite-btn active"
                    : "recipe-modal-favorite-btn"
                }
                onClick={() => toggleRecipeFavorite(selectedRecipe)}
              >
                <FiHeart />
              </button>
            </div>
          </div>

          {/* 설명 */}
          <p className="recipe-modal-desc">
            {selectedRecipe.aiReason || selectedRecipe.rcpWay}
          </p>

          {/* 태그 */}
          <div className="recipe-modal-tags">

            {selectedRecipe.hashtags?.map((tag) => (

              <span key={tag}>
                #{tag}
              </span>

            ))}

          </div>
          {/* 영양소 */}
          <div className="recipe-modal-nutrients">

            <div>
              <span>🔥</span>
              <b>칼로리</b>
              <strong>{selectedRecipe.rcpKcal} kcal</strong>
            </div>

            <div>
              <span>🍞</span>
              <b>탄수화물</b>
              <strong>{selectedRecipe.rcpCarbs}g</strong>
            </div>

            <div>
              <span>🥩</span>
              <b>단백질</b>
              <strong>{selectedRecipe.rcpProtein}g</strong>
            </div>

            <div>
              <span>🥑</span>
              <b>지방</b>
              <strong>{selectedRecipe.rcpFat}g</strong>
            </div>

            <div>
              <span>🧂</span>
              <b>나트륨</b>
              <strong>{selectedRecipe.rcpNatrium}mg</strong>
            </div>

          </div>

          {/* 재료 */}
          <div className="recipe-modal-section">

            <h4>🧺 사용 재료</h4>

            <ul>
              {selectedRecipe.rcpParts
                ?.split(",")
                .map((item) => (
                  <li key={item}>
                    {item}
                  </li>
                ))}
            </ul>

          </div>

          {/* 조리방법 */}
          <div className="recipe-modal-section">

            <h4>👩‍🍳 조리 방법</h4>

              <div className="recipe-step-list">

                {selectedRecipe.steps
                  ?.filter((step) => step?.stepText)
                  .map((step) => (

                    <p key={step.stepNum}>
                      {step.stepText}
                    </p>
                ))}
              </div>

          </div>

          {/* 하단 버튼 */}
          <div className="recipe-modal-actions">

            <button
              className="favorite-btn"
              onClick={() => toggleRecipeFavorite(selectedRecipe)}
            >
              ❤️ 즐겨찾기
            </button>
            <button
              className="add-meal-btn"
              onClick={() => {
                setMealAddRecipe(selectedRecipe);
                setIsMealTypeModalOpen(true);
              }}
            >
              🍽 식단으로 추가
            </button>
          </div>

        </div>

      </div>

    )}
    {isMealRecordModalOpen && mealAddRecipe && (
      <MealRecordModal
        mealType={selectedMealType}
        selectedDate={selectedDate}
        selectedRecipe={{
          rcpNum: mealAddRecipe.rcpNum,
          name: mealAddRecipe.rcpName,
          kcal: mealAddRecipe.rcpKcal || 0,
          carbs: mealAddRecipe.rcpCarbs || 0,
          protein: mealAddRecipe.rcpProtein || 0,
          fat: mealAddRecipe.rcpFat || 0,
          natrium: mealAddRecipe.rcpNatrium || 0,
          image: mealAddRecipe.rcpImage,
          aiReason: mealAddRecipe.aiReason || mealAddRecipe.rcpWay || "",
        }}
        onClose={() => {
          setIsMealRecordModalOpen(false);
          setMealAddRecipe(null);
          setSelectedMealType(null);
          setSelectedDate(null);
        }}
      />
    )}
    </div>

  );
};

export default FridgeRecommendation;
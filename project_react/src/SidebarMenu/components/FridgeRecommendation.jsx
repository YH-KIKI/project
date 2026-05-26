import axios from "axios";
import React, { useEffect, useState } from "react";
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

  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState([
    "계란",
    "우유",
    "식빵",
    "토마토",
    "치즈",
    "버터",
  ]);
  const [isRecommended, setIsRecommended] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const ingredientSuggestions = [
    "계란",
    "우유",
    "식빵",
    "토마토",
    "치즈",
    "버터",
    "양파",
    "감자",
    "당근",
    "오이",
    "닭가슴살",
    "두부",
    "김치",
    "햄",
    "참치",
    "고구마",
  ];

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
    (item) => ingredient.trim() !== "" && item.includes(ingredient.trim())
  );

  const recipes = [
    {
      id: 1,
      title: "계란 샌드위치",
      badge: "추천!",
      imageUrl:
        "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=300",
      items: "계란, 식빵, 치즈, 버터",
      desc: "고소하고 든든한 한 끼! 간단하게 만들 수 있는 영양 가득 샌드위치예요.",
      kcal: 320,
      carbs: 35,
      protein: 19,
      fat: 16,
      sodium: 620,
    },
    {
      id: 2,
      title: "우유 빵 푸딩",
      imageUrl:
        "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=300",
      items: "우유, 식빵, 계란, 설탕",
      desc: "부드럽고 달콤한 푸딩! 간식이나 디저트로 좋아요.",
      kcal: 280,
      carbs: 42,
      protein: 12,
      fat: 11,
      sodium: 350,
    },
    {
      id: 3,
      title: "토마토 치즈 토스트",
      imageUrl:
        "https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=300",
      items: "식빵, 토마토, 치즈",
      desc: "상큼한 토마토와 고소한 치즈의 조화! 간편한 브런치 메뉴예요.",
      kcal: 290,
      carbs: 30,
      protein: 15,
      fat: 11,
      sodium: 520,
    },
  ];

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

  const handleRecommend = () => {
    if (ingredients.length === 0) {
      alert("재료를 1개 이상 추가해주세요.");
      return;
    }

    setIsRecommended(true);
  };

  const kcalPercent = summary?.targetKcal
  ? Math.min(
      (summary.currentKcal / summary.targetKcal) * 100,
      100
    )
  : 0;

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
                  onChange={(e) => setIngredient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addIngredient();
                  }}
                />

                {ingredient && filteredSuggestions.length > 0 && (
                  <div className="suggestion-box">
                    {filteredSuggestions.map((item) => (
                      <button
                        key={item}
                        type="button"
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

            <div className="quick-add-box">
              <p>자주 사용하는 재료</p>
              <div>
                {quickIngredients.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => addIngredient(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
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
            <h3>AI 레시피 추천 결과</h3>
            <span>추천 결과 예시</span>
          </div>

          <div className="recipe-list">
            {recipes.map((recipe) => (
              <div className="recipe-card" key={recipe.id}>
                <img
                  src={getImageUrl(recipe.imageUrl)}
                  alt={recipe.title}
                />
                <div className="recipe-info">
                  <h4>
                    {recipe.title}
                    {recipe.badge && <span>{recipe.badge}</span>}
                  </h4>
                  <p className="recipe-items">보유 재료: {recipe.items}</p>
                  <p className="recipe-desc">{recipe.desc}</p>
                </div>

                <div className="recipe-nutrients">
                  <div className="nutrient-grid">
                    <p>탄: {recipe.carbs}g</p>
                    <p>단: {recipe.protein}g</p>
                    <p>지: {recipe.fat}g</p>
                    <p>나트륨: {recipe.sodium}mg</p>
                  </div>

                  <div className="recipe-kcal">
                    <span>예상 칼로리</span>
                    <strong>{recipe.kcal} kcal</strong>
                  </div>

                  <button>레시피 보기</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default FridgeRecommendation;
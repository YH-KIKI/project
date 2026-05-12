import React, { useState } from "react";
import axios from "axios";

const MealRecordModal = ({ mealType, selectedDate, initialData, onClose, onSave }) => {
  const [mode, setMode] = useState("manual");
  const [foodName, setFoodName] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const [foods, setFoods] = useState(initialData?.foods || []);

  const totalKcal = foods.reduce((sum, food) => sum + food.kcal * food.count, 0);
  const totalCarbs = foods.reduce((sum, food) => sum + food.carbs * food.count, 0);
  const totalProtein = foods.reduce((sum, food) => sum + food.protein * food.count, 0);
  const totalFat = foods.reduce((sum, food) => sum + food.fat * food.count, 0);
  const totalSodium = foods.reduce((sum, food) => sum + food.sodium * food.count, 0);

  const searchFood = async () => {
  const keyword = foodName.trim();

  if (!keyword) {
    alert("검색할 음식명을 입력해주세요.");
    return;
  }

  try {
    const res = await axios.get("http://localhost:8080/api/food/search", {
      params: { keyword },
    });

    setSearchResults(res.data);
  } catch (error) {
    console.error(error);
    alert("음식 검색 중 오류가 발생했습니다.");
  }
};

  const addSelectedFood = (food) => {
    const newFood = {
      id: food.foNum,
      foNum: food.foNum,
      name: food.foName,
      kcal: food.foKcal,
      count: 1,
      carbs: food.foCarbs,
      protein: food.foProtein,
      fat: food.foFat,
      sodium: food.foNatrium,
      baseGram: food.foBaseGram,
      imageUrl: "",
    };

    setFoods([...foods, newFood]);
    setFoodName("");
    setSearchResults([]);
  };

  const handleDropImage = (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];

  if (!file) return;

  console.log(file);

  // FormData 생성
  const formData = new FormData();
  formData.append("image", file);

  // FastAPI / Spring 전송

  //이미지 미리보기 
  const imageUrl = URL.createObjectURL(file);
  setPreviewImage(imageUrl);
};

  const addPhotoRecognizedFoods = () => {
    const recognizedFoods = [
      {
        id: Date.now(),
        name: "사진 인식 음식",
        kcal: 180,
        count: 1,
        carbs: 22,
        protein: 8,
        fat: 5,
        sodium: 210,
        imageUrl: "",
      },
    ];

    setFoods([...foods, ...recognizedFoods]);
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

  const handleSave = async () => {
  if (foods.length === 0) {
    alert("음식을 1개 이상 추가해주세요.");
    return;
  }

  const foodDetails = {};

  foods.forEach((food) => {
    foodDetails[food.name] = food.count * food.baseGram;
  });

  try {
    await axios.post("http://localhost:8080/api/meal/record", {
      userNum: 1,
      mkMealType: mealType,
      foodDetails: foodDetails,
    });

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

    alert("식단이 저장되었습니다!");
  } catch (error) {
    console.error(error);
    console.log(error.response?.data);
    alert("식단 저장 중 오류가 발생했습니다.");
  }
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
                  if (e.key === "Enter") searchFood();
                }}
                placeholder="음식명을 검색하세요 (예: 계란, 바나나, 그릭요거트)"
              />
              <button onClick={searchFood}>검색</button>
            </div>

            {searchResults.length > 0 && (
              <div className="food-search-results">
                {searchResults.map((food) => (
                  <button
                    key={food.foNum}
                    type="button"
                    className="food-search-item"
                    onClick={() => addSelectedFood(food)}
                  >
                    <strong>{food.foName}</strong>
                    <span>
                      {food.foKcal} kcal / 기준 {food.foBaseGram}g
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div
            className="photo-drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropImage}
          >
          {!previewImage ? (
            <>
              <div className="upload-icon">🖼️</div>

              <h3>음식 사진을 끌어놓아 주세요</h3>

              <p>
                이미지를 드래그하거나 클릭해서 업로드하면
                <br />
                AI가 음식을 인식해 식단에 추가해드려요!
              </p>

              <label className="upload-label">
                이미지 파일 선택

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={addPhotoRecognizedFoods}
                />
              </label>

              <small>
                JPG, PNG 파일 업로드 가능 · 여러 음식도 함께 인식할 수 있어요
              </small>
            </>
          ) : (
            <img
              src={previewImage}
              alt="preview"
              className="preview-image"
            />
          )}

          </div>
        )}

        <div className="added-food-header">
          <h3>추가된 음식 ({foods.length})</h3>
          <button onClick={() => setFoods([])}>전체 삭제</button>
        </div>

        <div className="added-food-list">
          {foods.length === 0 ? (
            <div className="added-food-empty">
              아직 추가된 음식이 없어요.
              <br />
              직접 입력하거나 사진으로 음식을 추가해보세요!
            </div>
          ) : (
            foods.map((food) => (
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
            ))
          )}
        </div>

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
          <button className="cancel-btn" onClick={onClose}>
            취소
          </button>
          <button className="detail-save-btn" onClick={handleSave}>
            AI 분석하고 저장하기 ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealRecordModal;
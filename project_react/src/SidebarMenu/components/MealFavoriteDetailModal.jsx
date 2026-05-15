import axios from "axios";
import React, { useState } from "react";
import { FiX, FiTrash2, FiEdit3 } from "react-icons/fi";
import "./MealFavoriteDetailModal.css";

function MealFavoriteDetailModal({
  meal,
  onUpdated,
  onClose,
  onLoad,
  onDelete,
}) {
  const [memo, setMemo] = useState(meal.mfMemo || meal.mf_memo || "");
  const [isEditingMemo, setIsEditingMemo] = useState(false);
  const [name, setName] = useState(meal.mfName || "즐겨찾기 식단");
  const [isEditingName, setIsEditingName] = useState(false);

  if (!meal) return null;

  const foods = meal.foods || [];

  const saveName = async () => {
  if (!name.trim()) {
    alert("식단 이름을 입력해주세요!");
    return;
  }

  try {
    await axios.put("http://localhost:8080/api/favorite/meal/name", {
      mfNum: meal.mfNum,
      mfName: name,
    });

  const updatedMeal = {
    ...meal,
    mfName: name,
  };

  onUpdated?.(updatedMeal);

  alert("식단 이름 수정 완료!");
  setIsEditingName(false);
  } catch (err) {
    console.error(err);
    alert("식단 이름 수정 실패!");
  }
};

  const getFoodCount = (food) =>
    Number(food.mfPortion || food.mdPortion || food.count || 1);

  const getFoodKcal = (food) =>
    Math.round(Number(food.mdKcal || food.foKcal * getFoodCount(food) || 0));

  const totalCarbs = foods.reduce(
    (sum, food) => sum + Number(food.foCarbs || 0) * getFoodCount(food),
    0
  );

  const totalProtein = foods.reduce(
    (sum, food) => sum + Number(food.foProtein || 0) * getFoodCount(food),
    0
  );

  const totalFat = foods.reduce(
    (sum, food) => sum + Number(food.foFat || 0) * getFoodCount(food),
    0
  );

  const totalKcal =
    meal.totalKcal ||
    meal.mfKcal ||
    foods.reduce((sum, food) => sum + Number(food.foKcal || food.mdKcal || 0), 0);

  const createdAt =
    meal.mfCreatedAt ||
    meal.mf_created_at ||
    meal.createdAt ||
    meal.mkCreatedAt ||
    meal.mk_created_at;

  const formattedDate = createdAt ? String(createdAt).split("T")[0] : "정보 없음";

  const saveMemo = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/favorite/meal/memo`,
        {
          mfNum: meal.mfNum,
          mfMemo: memo,
        }
      );

      const updatedMeal = {
        ...meal,
        mfMemo: memo,
      };

      onUpdated?.(updatedMeal);

      alert("메모 저장 완료!");
      setIsEditingMemo(false);
    } catch (err) {
      console.error(err);
      alert("메모 저장 실패!");
    }
  };
  return (
    <div className="meal-fav-detail-backdrop" onClick={onClose}>
      <div
        className="meal-fav-detail-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="meal-fav-detail-header">
          <div>
            {isEditingName ? (
              <div className="meal-fav-name-edit">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  placeholder="식단 이름"
                />

                <button type="button" onClick={saveName}>
                  저장
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setName(meal.mfName || "즐겨찾기 식단");
                    setIsEditingName(false);
                  }}
                >
                  취소
                </button>
              </div>
            ) : (
              <div className="meal-fav-title-line">
                <h2>{name}</h2>

                <button
                  type="button"
                  className="meal-fav-title-edit-btn"
                  onClick={() => setIsEditingName(true)}
                >
                  <FiEdit3 />
                </button>
              </div>
            )}
            <p className="meal-fav-meta">
              <span>등록일 {formattedDate}</span>
              <span className="meta-divider">|</span>
              <span>총 {totalKcal} kcal</span>
            </p>
          </div>

          <button type="button" className="meal-fav-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <section className="meal-fav-detail-section">
          <h3>식단 구성</h3>

          {foods.length === 0 ? (
            <div className="meal-fav-empty">저장된 음식 정보가 없어요.</div>
          ) : (
            <div className="meal-fav-food-list">
              {foods.map((food, index) => (
                <div className="meal-fav-food-item" key={`${food.foNum}-${index}`}>
                  {food.foImage ? (
                    <img src={food.foImage} alt={food.foName} />
                  ) : (
                    <div className="meal-fav-food-default">🍽️</div>
                  )}

                  <div className="meal-fav-food-info">
                    <strong>{food.foName || food.name}</strong>
                   <span>{getFoodCount(food)}개</span>
                  </div>
                  <em>{getFoodKcal(food)} kcal</em>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="meal-fav-nutrient-box">
          <div>
            <span>탄수화물</span>
            <strong>{totalCarbs.toFixed(1)}g</strong>
          </div>
          <div>
            <span>단백질</span>
            <strong>{totalProtein.toFixed(1)}g</strong>
          </div>
          <div>
            <span>지방</span>
            <strong>{totalFat.toFixed(1)}g</strong>
          </div>
        </section>

        <section className="meal-fav-memo-box">
          <div className="meal-fav-memo-header">
            <h3>메모</h3>

            {!isEditingMemo && (
              <button
                type="button"
                className="meal-fav-memo-edit-btn"
                onClick={() => setIsEditingMemo(true)}
              >
                ✏️
              </button>
            )}
          </div>

          {isEditingMemo ? (
            <>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={255}
                placeholder="식단 메모를 입력해보세요!"
              />

              <div className="meal-fav-memo-actions">
                <button onClick={() => setIsEditingMemo(false)}>
                  취소
                </button>

                <button onClick={saveMemo}>
                  저장
                </button>
              </div>
            </>
          ) : (
            <p>
              {memo || "아직 메모가 없어요."}
            </p>
          )}
        </section>

        <div className="meal-fav-detail-actions">
          <button type="button" className="meal-fav-delete-btn" onClick={onDelete}>
            <FiTrash2 />
            삭제
          </button>

          <button type="button" className="meal-fav-load-btn" onClick={onLoad}>
            이 식단 불러오기
          </button>
        </div>
      </div>
    </div>
  );
}

export default MealFavoriteDetailModal;
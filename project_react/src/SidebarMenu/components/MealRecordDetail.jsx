import axios from "axios";
import React, { useState, useEffect } from "react";
import { FiHeart } from "react-icons/fi";
import "./MealRecordDetail.css";
import MealRecordModal from "./MealRecordModal";
import MealDetailModal from "./MealDetailModal";

const NutrientBar = ({ icon, name, status, type }) => {
  return (
    <div className="nutrient-row">
      <div className={`nutrient-icon ${type}`}>{icon}</div>

      <div className="nutrient-info">
        <p>
          {name} <span className={type}>{status}</span>
        </p>
        <div className="bar-bg">
          <div className={`bar-fill ${type}`}></div>
        </div>
      </div>
    </div>
  );
};

const MealRecordDetail = () => {
  const userNum = 1;

  const [activeMeal, setActiveMeal] = useState("아침");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // mkNum 기준으로 관리
  // 예: { 12: { mfNum: 3, mkNum: 12 } }
  const [favoriteRecords, setFavoriteRecords] = useState({});

  const [mealRecords, setMealRecords] = useState({});
  const [recordedDates, setRecordedDates] = useState([]);
  const [aiFeedback, setAiFeedback] = useState("");

  const meals = ["아침", "점심", "저녁"];

  const formatDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatDateText = (date) => {
    const week = ["일", "월", "화", "수", "목", "금", "토"];
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}.${m}.${d} ${week[date.getDay()]}`;
  };

  const dateKey = formatDateKey(selectedDate);
  const recordKey = `${dateKey}_${activeMeal}`;
  const mealData = mealRecords[recordKey] || null;

  const favoriteInfo = mealData?.mkNum ? favoriteRecords[mealData.mkNum] : null;
  const isFavorite = !!favoriteInfo;

  const loadRecordedDates = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/meal/recorded-dates?userNum=${userNum}`
      );

      console.log("기록 날짜:", res.data);
      setRecordedDates(res.data);
    } catch (err) {
      console.error("기록 날짜 조회 실패:", err);
    }
  };

  const loadFavoriteMeals = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/favorite/meal?userNum=${userNum}`
      );

      console.log("즐겨찾기 식단 조회:", res.data);

      const favoriteMap = {};

      res.data.forEach((meal) => {
        if (meal.mkNum) {
          favoriteMap[meal.mkNum] = {
            mfNum: meal.mfNum,
            mkNum: meal.mkNum,
          };
        }
      });

      setFavoriteRecords(favoriteMap);
    } catch (err) {
      console.error("즐겨찾기 식단 조회 실패:", err);
    }
  };

  const loadMealsByDate = async (targetDateKey) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/meal/today?userNum=${userNum}&date=${targetDateKey}`
      );

      console.log("식단 조회 성공:", res.data);

      const converted = {};

      res.data.forEach((item) => {
        const key = `${targetDateKey}_${item.mkMealType}`;

        if (!converted[key]) {
          converted[key] = {
            mkNum: item.mkNum,
            mkMealType: item.mkMealType,
            totalKcal: 0,
            foods: [],
            imageUrl: null,
          };
        }

        converted[key].foods.push({
          id: item.foNum,
          foNum: item.foNum,
          name: item.foName,

          // 기준 칼로리
          kcal: Number(item.foKcal || 0),

          // 수량
          portion: Number(item.mdPortion || 1),
          count: Number(item.mdPortion || 1),

          carbs: Number(item.foCarbs || 0),
          protein: Number(item.foProtein || 0),
          fat: Number(item.foFat || 0),
          sodium: Number(item.foNatrium || 0),

          // 저장된 총칼로리는 따로 보관
          mdKcal: Number(item.mdKcal || 0),

          image: item.foImage || null,
        });
        converted[key].totalKcal += item.mdKcal;
      });

      setMealRecords(converted);
    } catch (err) {
      console.error("식단 조회 실패:", err);
    }
  };

  useEffect(() => {
    loadRecordedDates();
    loadFavoriteMeals();
  }, []);

  useEffect(() => {
    loadMealsByDate(dateKey);
  }, [dateKey]);

  useEffect(() => {
    if (mealData) {
      loadAiFeedback(mealData);
    }
  }, [mealData]);

  const dailyTotalKcal = Object.entries(mealRecords)
    .filter(([key]) => key.startsWith(dateKey))
    .reduce((sum, [, record]) => sum + record.totalKcal, 0);

  const moveDate = (amount) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + amount);
    setSelectedDate(next);
  };

  const getCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay.getDay();

    const days = [];

    for (let i = 0; i < startDay; i++) days.push(null);
    for (let day = 1; day <= lastDate; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleSaveMeal = async (data) => {
    try {
      const requestData = {
        userNum,
        mkNum: mealData?.mkNum || null,
        mkMealType: data.mealType,

        foods: data.foods.map((food) => ({
          foNum: food.id,
          mdPortion: food.count,
          mdKcal: Math.round(food.kcal * food.count),
        })),
      };

      console.log("DB 저장 요청:", requestData);

      const res = await axios.post(
        "http://localhost:8080/api/meal/record",
        requestData
      );

      console.log("식단 저장 응답:", res.data);

      // 저장 직후 mkNum 문제 방지용:
      // 응답 믿지 말고 DB에서 해당 날짜 식단 다시 조회
      await loadMealsByDate(dateKey);
      await loadRecordedDates();

      setIsRecordModalOpen(false);
      alert("식단 기록 저장 완료!");
    } catch (err) {
      console.error("식단 저장 실패:", err);
      alert("식단 저장 실패!");
    }
  };

  const getFoodSummary = () => {
    if (!mealData?.foods) return "";

    const names = mealData.foods
      .slice(0, 3)
      .map((food) => food.name)
      .join(" · ");

    const extraCount = mealData.foods.length - 3;

    return extraCount > 0 ? `${names} 외 ${extraCount}개` : names;
  };

  const toggleFavorite = async () => {
    if (!mealData?.mkNum) {
      alert("저장된 식단만 즐겨찾기 가능해요!");
      return;
    }

    try {
      if (isFavorite) {
        const mfNum = favoriteRecords[mealData.mkNum]?.mfNum;

        if (!mfNum) {
          alert("즐겨찾기 번호를 찾을 수 없어서 다시 조회할게요!");
          await loadFavoriteMeals();
          return;
        }

        await axios.delete(
          `http://localhost:8080/api/favorite/meal?userNum=${userNum}&mfNum=${mfNum}`
        );

        setFavoriteRecords((prev) => {
          const next = { ...prev };
          delete next[mealData.mkNum];
          return next;
        });

        alert("식단 즐겨찾기를 해제했어요!");
        return;
      }

      const res = await axios.post("http://localhost:8080/api/favorite/meal", {
        userNum,
        mkNum: mealData.mkNum,
        mfName: `${activeMeal} - ${getFoodSummary()}`,
      });

      console.log("식단 즐겨찾기 저장 응답:", res.data);

      // 저장 후 mfNum까지 얻기 위해 다시 조회
      await loadFavoriteMeals();

      alert("식단 즐겨찾기에 저장했어요!");
    } catch (err) {
      console.error("식단 즐겨찾기 처리 실패:", err);
      alert("즐겨찾기 처리 실패!");
    }
  };

  const loadAiFeedback = async (mealData) => {
  if (!mealData?.foods?.length) return;

  try {
    const totalCarbs = mealData.foods.reduce(
      (sum, food) => sum + (food.carbs || 0) * (food.count || 1),
      0
    );

    const totalProtein = mealData.foods.reduce(
      (sum, food) => sum + (food.protein || 0) * (food.count || 1),
      0
    );

    const totalFat = mealData.foods.reduce(
      (sum, food) => sum + (food.fat || 0) * (food.count || 1),
      0
    );

    const totalSodium = mealData.foods.reduce(
      (sum, food) => sum + (food.sodium || 0) * (food.count || 1),
      0
    );

    const res = await axios.post(
      "http://localhost:8000/api/v1/ai/meal-feedback",
      {
        mealType: activeMeal,
        kcal: mealData.totalKcal,
        carbs: totalCarbs,
        protein: totalProtein,
        fat: totalFat,
        sodium: totalSodium,
      }
    );

    console.log("AI 피드백:", res.data);

    setAiFeedback(res.data.feedback);

  } catch (err) {
    console.error("AI 피드백 실패:", err);
  }
};

  return (
    <div className="meal-analysis-card">
      <div className="meal-detail-container">
        <h2 className="meal-detail-title">식단 기록 상세</h2>

        <div className="date-wrapper">
          <div className="date-box">
            <button className="date-arrow" onClick={() => moveDate(-1)}>
              ‹
            </button>

            <button
              className="date-text-btn"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            >
              {formatDateText(selectedDate)}
            </button>

            <button className="date-arrow" onClick={() => moveDate(1)}>
              ›
            </button>
          </div>

          {isCalendarOpen && (
            <div className="calendar-popover">
              <div className="calendar-header">
                <button
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() - 1,
                        1
                      )
                    )
                  }
                >
                  ‹
                </button>

                <strong>
                  {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월
                </strong>

                <button
                  onClick={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() + 1,
                        1
                      )
                    )
                  }
                >
                  ›
                </button>
              </div>

              <div className="calendar-week">
                {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className="calendar-grid">
                {getCalendarDays().map((date, index) => {
                  if (!date) {
                    return <div key={index} className="calendar-empty"></div>;
                  }

                  const key = formatDateKey(date);
                  const isSelected = key === dateKey;
                  const hasRecord = recordedDates.includes(key);

                  return (
                    <button
                      key={key}
                      className={`calendar-day ${
                        isSelected ? "selected" : ""
                      } ${hasRecord ? "recorded" : ""}`}
                      onClick={() => {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="summary-box">
          <div className="summary-card">
            <p>총 섭취 칼로리</p>
            <h3>
              {dailyTotalKcal.toLocaleString()} <small>칼로리</small>
            </h3>
          </div>

          <div className="summary-card">
            <p>영양소 균형</p>
            <div className="grade-badge">{dailyTotalKcal > 0 ? "B+" : "-"}</div>
          </div>
        </div>

        <div className="meal-tabs">
          {meals.map((meal) => (
            <button
              key={meal}
              className={activeMeal === meal ? "active" : ""}
              onClick={() => setActiveMeal(meal)}
            >
              {meal}
            </button>
          ))}
        </div>

        {!mealData ? (
          <div
            className="empty-meal-card"
            onClick={() => setIsRecordModalOpen(true)}
          >
            <div className="empty-plus">+</div>
            <h3>식단을 등록하세요</h3>
            <p>
              오늘 먹은 음식을 기록하고
              <br />
              AI 분석을 받아보세요!
            </p>
          </div>
        ) : (
          <div className="meal-content-card">
            <button
              className={`meal-favorite-btn ${isFavorite ? "active" : ""}`}
              onClick={toggleFavorite}
            >
              <FiHeart />
            </button>

            <div className="meal-main-info">
              <div
                className="meal-photo-box clickable"
                onClick={() => setIsDetailModalOpen(true)}
              >
                {mealData.imageUrl ? (
                  <img src={mealData.imageUrl} alt="식단 이미지" />
                ) : (
                  <div className="no-img">등록 사진 없음</div>
                )}

                <div className="photo-click-label">상세보기</div>
              </div>

              <div className="nutrition-area">
                <h4>AI 영양분석</h4>

                <NutrientBar icon="🌾" name="탄수화물" status="적정" type="carb" />
                <NutrientBar icon="🥩" name="단백질" status="충분" type="protein" />
                <NutrientBar icon="🥑" name="지방" status="적정" type="fat" />
                <NutrientBar icon="🧂" name="나트륨" status="주의" type="sodium" />
              </div>
            </div>

            <div className="meal-summary-row">
              <div className="meal-kcal-box">
                <div className="summary-icon">🔥</div>
                <div>
                  <span>총 섭취 칼로리</span>
                  <strong>{mealData.totalKcal} kcal</strong>
                </div>
              </div>

              <div className="meal-food-box">
                <div className="summary-icon">🍴</div>
                <div>
                  <span>
                    등록 음식 <b>{mealData.foods.length}개</b>
                  </span>
                  <p>{getFoodSummary()}</p>
                </div>
              </div>
            </div>

            <div className="ai-comment-box">
              <div className="ai-icon">🤖</div>
              <p>
                {aiFeedback || "AI가 식단을 분석하고 있어요 🤖"}
              </p>
            </div>

            <button
              className="record-submit-btn"
              onClick={() => setIsRecordModalOpen(true)}
            >
              식단 수정하기
            </button>
          </div>
        )}

        {isRecordModalOpen && (
          <MealRecordModal
            key={`${recordKey}-${isRecordModalOpen}`}
            mealType={activeMeal}
            selectedDate={formatDateText(selectedDate)}
            initialData={mealData}
            onClose={() => setIsRecordModalOpen(false)}
            onSave={handleSaveMeal}
          />
        )}

        {isDetailModalOpen && mealData && (
          <MealDetailModal
            mealType={activeMeal}
            mealData={mealData}
            onClose={() => setIsDetailModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default MealRecordDetail;
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FiHeart, FiTrash2 } from "react-icons/fi";
import { useLocation } from "react-router-dom";
import MealRecordModal from "./MealRecordModal";
import "./MealRecordDetail.css";

const NutrientBar = ({
  icon,
  name,
  status,
  type,
  ratio = 0,
  valueText,
  currentAmount,
  targetAmount,
}) => {
  const safeRatio = Math.min(Math.max(Number(ratio) || 0, 0), 100);

  const colorMap = {
    carb: "#f8c15d",
    protein: "#9fcaf4",
    fat: "#ee8fa2",
    sodium: "#ffbd4a",
  };

  const barColor = colorMap[type] || "#ffbd4a";

  return (
    <div className="nutrient-row">
      <div className={`nutrient-icon ${type}`}>{icon}</div>

      <div className="nutrient-info">
        <p>
          {name} <span className={type}>{status}</span>
        </p>
        {type !== "sodium" && (
          <div className="nutrient-bar-line">
            <div
              className="macro-bar-bg"
              style={{
                background: `linear-gradient(to right, ${barColor} 0%, ${barColor} ${safeRatio}%, #ececf2 ${safeRatio}%, #ececf2 100%)`,
              }}
            />

            <div className="macro-percent-area">
              <b>{safeRatio}%</b>
              <small>
                {currentAmount} / {targetAmount}
              </small>
            </div>
          </div>
        )}

        {type === "sodium" && (
          <div className="nutrient-bar-line">
            <div
              className="macro-bar-bg"
              style={{
                background: `linear-gradient(to right, ${barColor} 0%, ${barColor} ${safeRatio}%, #ececf2 ${safeRatio}%, #ececf2 100%)`,
              }}
            />

            <b className="sodium-value">
              {currentAmount} / {targetAmount}
            </b>
          </div>
        )}
      </div>
    </div>
  );
};


const MealRecordDetail = () => {
  const location = useLocation();

  const user = JSON.parse(
    localStorage.getItem("user")
  );
  const userNum = user?.user_num;

  const [activeMeal, setActiveMeal] = useState("아침");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // mkNum 기준으로 관리
  // 예: { 12: { mfNum: 3, mkNum: 12 } }
  const [favoriteRecords, setFavoriteRecords] = useState({});

  const [mealRecords, setMealRecords] = useState({});
  const [recordedDates, setRecordedDates] = useState([]);
  const [aiFeedback, setAiFeedback] = useState("");
  const [modalInitialData, setModalInitialData] = useState(null);

  const [userTargets, setUserTargets] = useState(null);
  const favoriteAddDoneRef = useRef(false);
  const favoriteImportDoneRef = useRef(false);
  const meals = ["아침", "점심", "저녁"];

  const getImageUrl = (path) => {
  if (!path) return null;

  const SERVER_URL =
    process.env.REACT_APP_API_URL ||
    window.location.origin;

  return `${SERVER_URL}${path}`;
};

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

  const parseDateFromState = (dateStr) => {
    if (!dateStr) return new Date();

    // "2026-05-26" 형태 방어
    return new Date(`${dateStr}T00:00:00`);
  };

  const dateKey = formatDateKey(selectedDate);
  const recordKey = `${dateKey}_${activeMeal}`;
  const mealData = mealRecords[recordKey] || null;
  const favoriteInfo = mealData?.mkNum ? favoriteRecords[mealData.mkNum] : null;
  const isFavorite =
    !!favoriteInfo ||
    mealData?.importedFavoriteMeal === true;
   

  const loadRecordedDates = async () => {
    try {
      const res = await axios.get(
        `/api/meal/recorded-dates?userNum=${userNum}`
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
        `/api/favorite/meal?userNum=${userNum}`
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
        `/api/meal/today?userNum=${userNum}&date=${targetDateKey}`
      );

      console.log("식단 조회 성공:", res.data);

      const converted = {};

      res.data.forEach((item) => {
        console.log("백엔드 item:", item);
        console.log("item.mkImage:", item.mkImage);
        const key = `${targetDateKey}_${item.mkMealType}`;

        if (!converted[key]) {
          converted[key] = {
            mkNum: item.mkNum,
            mkMealType: item.mkMealType,
            totalKcal: 0,
            foods: [],
            imageUrl: item.mkImage
              ? getImageUrl(item.mkImage)
              : null,
          };
        }

        console.log("converted imageUrl:", converted[key].imageUrl);

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
      setMealRecords((prev) => ({
        ...prev,
        ...converted,
      }));

      return converted;
    } catch (err) {
      return {};
      console.error("식단 조회 실패:", err);
    }
  };

  // user_privecy 조회
  const loadUserPrivacy = async () => {
    try {
      const res = await axios.get(
        `/api/user/privacy?userNum=${userNum}`
      );
      setUserTargets(res.data);
    } catch (err) {
      console.error("사용자 목표 영양소 조회 실패:", err);
    }
  };
  //계산
  const getStatusByMealTarget = (current, dailyTarget) => {
    if (!dailyTarget || dailyTarget <= 0) return "-";

    const mealTarget = dailyTarget / 3;
    const percent = (current / mealTarget) * 100;

    if (percent < 50) return "부족";

    if (percent < 80) return "주의";

    if (percent <= 120) return "적정";

    if (percent <= 150) return "과다";

    return "과다";
  };

  const getSodiumStatus = (todaySodium) => {
  const percent = (todaySodium / 2000) * 100;

  if (percent <= 60) return "적정";
  if (percent <= 90) return "주의";
  if (percent <= 100) return "높음";

  return "과다";
};

  const getMealNutrition = (record) => {
  const foods = record?.foods || [];

  const carbs = foods.reduce((sum, food) => sum + Number(food.carbs || 0) * Number(food.count || 1), 0);
  const protein = foods.reduce((sum, food) => sum + Number(food.protein || 0) * Number(food.count || 1), 0);
  const fat = foods.reduce((sum, food) => sum + Number(food.fat || 0) * Number(food.count || 1), 0);
  const sodium = foods.reduce((sum, food) => sum + Number(food.sodium || 0) * Number(food.count || 1), 0);

  return { carbs, protein, fat, sodium };
};

const getTodaySodium = () => {
  return Object.entries(mealRecords)
    .filter(([key]) => key.startsWith(dateKey))
    .reduce((sum, [, record]) => {
      return sum + getMealNutrition(record).sodium;
    }, 0);
};

const getNutritionAnalysis = () => {
  const mealNutrition = getMealNutrition(mealData);
  const todaySodium = getTodaySodium();

  const carbKcal = mealNutrition.carbs * 4;
  const proteinKcal = mealNutrition.protein * 4;
  const fatKcal = mealNutrition.fat * 9;
  const totalMacroKcal = carbKcal + proteinKcal + fatKcal;

  const carbRatio = totalMacroKcal ? Math.round((carbKcal / totalMacroKcal) * 100) : 0;
  const proteinRatio = totalMacroKcal ? Math.round((proteinKcal / totalMacroKcal) * 100) : 0;
  const fatRatio = totalMacroKcal ? 100 - carbRatio - proteinRatio : 0;

  // 디버깅용 삭제예정
  console.log(
    "목표값 확인",
    userTargets?.userDailyCarbs,
    userTargets?.userDailyProtein,
    userTargets?.userDailyFat
    );
  
  return {
    carb: {
      ratio: carbRatio,
      status: getStatusByMealTarget(
        mealNutrition.carbs,
        userTargets?.userDailyCarbs
      ),
      currentAmount: `${Math.round(mealNutrition.carbs)}g`,
      targetAmount: `${Math.round((userTargets?.userDailyCarbs || 0) / 3)}g`,
    },

    protein: {
      ratio: proteinRatio,
      status: getStatusByMealTarget(
        mealNutrition.protein,
        userTargets?.userDailyProtein
      ),
      currentAmount: `${Math.round(mealNutrition.protein)}g`,
      targetAmount: `${Math.round((userTargets?.userDailyProtein || 0) / 3)}g`,
    },

    fat: {
      ratio: fatRatio,
      status: getStatusByMealTarget(
        mealNutrition.fat,
        userTargets?.userDailyFat
      ),
      currentAmount: `${Math.round(mealNutrition.fat)}g`,
      targetAmount: `${Math.round((userTargets?.userDailyFat || 0) / 3)}g`,
    },

    sodium: {
      ratio: Math.round(
        (mealNutrition.sodium / (2000 / 3)) * 100
      ),
      mealMg: Math.round(mealNutrition.sodium),
      todayMg: Math.round(todaySodium),
      percent: Math.round((todaySodium / 2000) * 100),
      status: getSodiumStatus(todaySodium),
      currentAmount: `${Math.round(mealNutrition.sodium)}mg`,
      targetAmount: `${Math.round(2000 / 3)}mg`,
    },
  };
};

const getMealGrade = () => {
  if (!mealData || !userTargets) return "-";

  const mealNutrition = getMealNutrition(mealData);

  const mealTargetKcal = Number(userTargets.userDailyKcal || 0) / 3;
  const mealTargetCarbs = Number(userTargets.userDailyCarbs || 0) / 3;
  const mealTargetProtein = Number(userTargets.userDailyProtein || 0) / 3;
  const mealTargetFat = Number(userTargets.userDailyFat || 0) / 3;

  if (!mealTargetKcal || mealData.totalKcal <= 0) return "-";

  const kcalError =
    Math.abs(mealTargetKcal - mealData.totalKcal) / mealTargetKcal * 100;

  const carbsError =
    Math.abs(mealTargetCarbs - mealNutrition.carbs) / Math.max(mealTargetCarbs, 1) * 100;

  const proteinError =
    Math.abs(mealTargetProtein - mealNutrition.protein) / Math.max(mealTargetProtein, 1) * 100;

  const fatError =
    Math.abs(mealTargetFat - mealNutrition.fat) / Math.max(mealTargetFat, 1) * 100;

  const totalErrorRate =
    kcalError * 0.4 +
    carbsError * 0.2 +
    proteinError * 0.2 +
    fatError * 0.2;

  if (totalErrorRate <= 15) return "A";
  if (totalErrorRate <= 25) return "B";
  if (totalErrorRate <= 35) return "C";
  if (totalErrorRate <= 45) return "D";
  return "F";
};

const mealGrade = mealData ? getMealGrade() : "-";

const analysis = mealData ? getNutritionAnalysis() : null;

  useEffect(() => {
  loadRecordedDates();
  loadFavoriteMeals();
  loadUserPrivacy();
}, []);

  useEffect(() => {
    loadMealsByDate(dateKey);
  }, [dateKey]);

  useEffect(() => {
    if (mealData) {
      loadAiFeedback(mealData);
    }
  }, [mealData]);

  useEffect(() => {
  const state = location.state;

  if (!state?.fromFavorite) return;
  if (favoriteImportDoneRef.current) return;

  favoriteImportDoneRef.current = true;

  const {
    favoriteType,
    selectedFood,
    selectedMeal,
    selectedRecipe,
    mealType,
    date,
  } = state;

  if (!mealType) return;

  const targetDate = parseDateFromState(date);
  const targetDateKey = formatDateKey(targetDate);
  const key = `${targetDateKey}_${mealType}`;

  setSelectedDate(targetDate);
  setActiveMeal(mealType);

  const importFavoriteToModal = async () => {
    const latestRecords = await loadMealsByDate(targetDateKey);

    const baseRecord =
      latestRecords[key] || {
        mkMealType: mealType,
        totalKcal: 0,
        foods: [],
        imageUrl: null,
      };

    let importedFoods = [];
    let importedImageUrl = baseRecord.imageUrl || null;
    let importedFavoriteMeal = false;

    // 음식 즐겨찾기
    if (favoriteType === "food" && selectedFood) {
      importedFoods = [
        {
          id: selectedFood.foNum,
          foNum: selectedFood.foNum,
          name: selectedFood.name,
          kcal: Number(selectedFood.kcal || 0),
          portion: 1,
          count: 1,
          carbs: Number(selectedFood.carbs || 0),
          protein: Number(selectedFood.protein || 0),
          fat: Number(selectedFood.fat || 0),
          sodium: Number(selectedFood.natrium || 0),

          // 모달 별 표시용
          isFavorite: true,
          favoriteType: "food",
          sfNum: selectedFood.id,
        },
      ];
    }

    // 저장한 식단 즐겨찾기
    if (favoriteType === "meal" && selectedMeal) {
      const mealFoods = selectedMeal.foods || [];

      importedFoods = mealFoods.map((food) => {
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
          id: food.foNum,
          foNum: food.foNum,
          name: food.foName || food.name,
          kcal,
          portion,
          count: portion,
          carbs: Number(food.foCarbs || food.carbs || 0),
          protein: Number(food.foProtein || food.protein || 0),
          fat: Number(food.foFat || food.fat || 0),
          sodium: Number(food.foNatrium || food.natrium || 0),
          image: food.foImage || null,
        };
      });

      importedImageUrl =
        selectedMeal.mkImage
          ? getImageUrl(selectedMeal.mkImage)
          : baseRecord.imageUrl || null;

      importedFavoriteMeal = true;
    }

    // 레시피 즐겨찾기
    if (favoriteType === "recipe" && selectedRecipe) {
      importedFoods = [
        {
          id: `recipe-${selectedRecipe.rcpNum}`,
          rcpNum: selectedRecipe.rcpNum,
          name: selectedRecipe.name,
          kcal: Number(selectedRecipe.kcal || 0),
          portion: 1,
          count: 1,
          carbs: Number(selectedRecipe.carbs || 0),
          protein: Number(selectedRecipe.protein || 0),
          fat: Number(selectedRecipe.fat || 0),
          sodium: Number(selectedRecipe.natrium || 0),
          image: selectedRecipe.image || null,

          isRecipe: true,

          isFavorite:
            selectedRecipe.isFavorite === true,

          favoriteType: "recipe",
          rfNum: selectedRecipe.rfNum || selectedRecipe.id,
        },
      ];
    }

    const newRecord = {
      ...baseRecord,
      mkMealType: mealType,
      totalKcal:
        Number(baseRecord.totalKcal || 0) +
        importedFoods.reduce(
          (sum, food) =>
            sum + Number(food.kcal || 0) * Number(food.count || 1),
          0
        ),
      foods: [
        ...(baseRecord.foods || []),
        ...importedFoods,
      ],
      imageUrl: importedImageUrl,

      // 저장한 식단에서 온 경우 하트 표시용
      importedFavoriteMeal,
      importedMfNum: selectedMeal?.mfNum || null,
      importedFavoriteType: favoriteType,
    };

    setMealRecords((prev) => ({
      ...prev,
      [key]: newRecord,
    }));

    setModalInitialData(newRecord);

    setTimeout(() => {
      setIsRecordModalOpen(true);
    }, 0);
  };

  importFavoriteToModal();
}, [location.state]);
  

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
      // 레시피 즐겨찾기에서 가져온 경우는 food 테이블 음식이 아니라서
      // 일반 /api/meal/record 말고 recipe-record로 저장
      const recipeFood = data.foods.find((food) => food.isRecipe);

      if (recipeFood) {
        await axios.post("/api/meal/recipe-record", {
          userNum,
          mkMealType: data.mealType,
          mkDietDate: dateKey,
          mkUserMemo: recipeFood.aiReason || "",

          rcpNum: recipeFood.rcpNum,
          rcpName: recipeFood.name,
          rcpImage: recipeFood.image || null,

          rcpKcal: recipeFood.kcal || 0,
          rcpCarbs: recipeFood.carbs || 0,
          rcpProtein: recipeFood.protein || 0,
          rcpFat: recipeFood.fat || 0,
          rcpNatrium: recipeFood.sodium || 0,
        });

        await loadMealsByDate(dateKey);
        await loadRecordedDates();

        setIsRecordModalOpen(false);
        setModalInitialData(null);
        alert("레시피 식단 저장 완료!");
        return;
      }


      const foods = data.foods.map((food) => ({
        foNum: food.id,
        mdPortion: food.count,
        mdKcal: Math.round(food.kcal * food.count),
      }));

      const mealJson = {
        userNum,
        mkNum: mealData?.mkNum || null,
        mkMealType: data.mealType,
        mkDietDate: dateKey,
        foods
      };

      const formData = new FormData();

      formData.append(
        "mealData",
        new Blob(
          [JSON.stringify(mealJson)],
          { type: "application/json" }
        )
      );

      if (data.mealImageFile) {
        formData.append(
          "mealImageFile",
          data.mealImageFile
        );
      }

      console.log("저장 data:", data);
      console.log("mealImageFile:", data.mealImageFile);

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const res = await axios.post(
        "/api/meal/record",
        formData
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
          `/api/favorite/meal?userNum=${userNum}&mfNum=${mfNum}`
        );

        setFavoriteRecords((prev) => {
          const next = { ...prev };
          delete next[mealData.mkNum];
          return next;
        });

        alert("식단 즐겨찾기를 해제했어요!");
        return;
      }

      const res = await axios.post("/api/favorite/meal", {
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

  const handleDeleteMeal = async () => {
  if (!mealData?.mkNum) {
    alert("삭제할 식단이 없어요!");
    return;
  }

  const ok = window.confirm(`${activeMeal} 식단을 삭제할까요?`);
    if (!ok) return;

    try {
      await axios.delete(`/api/meal/record?mkNum=${mealData.mkNum}`);

      setMealRecords((prev) => {
        const next = { ...prev };
        delete next[recordKey];
        return next;
      });

      await loadRecordedDates();
      await loadMealsByDate(dateKey);

      alert("식단이 삭제됐어요!");
    } catch (err) {
      console.error("식단 삭제 실패:", err);
      alert("식단 삭제 실패!");
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
        "/api/ai/meal-feedback",
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
            <p>{activeMeal} 섭취 칼로리</p>
            <h3>
              {dailyTotalKcal.toLocaleString()} <small>칼로리</small>
            </h3>
          </div>

          <div className="summary-card">
           <p>{activeMeal} 영양 균형 등급</p>
            <div className="grade-badge">
              {mealGrade}
            </div>
          </div>
        </div>

        <div className="meal-tabs">
          {meals.map((meal) => {
            const hasMeal = !!mealRecords[`${dateKey}_${meal}`];

            return (
              <button
                key={meal}
                className={activeMeal === meal ? "active" : ""}
                onClick={() => setActiveMeal(meal)}
              >
                <span>{meal}</span>

                {hasMeal && (
                  <div className={`meal-tab-dot ${meal}`} />
                )}
              </button>
            );
          })}
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
          <div
            className="meal-content-card clickable-meal-card"
            onClick={() => setIsRecordModalOpen(true)}
          >
            <button
              className={`meal-favorite-btn ${isFavorite ? "active" : ""}`}
              onClick={toggleFavorite}
            >
              <FiHeart />
            </button>

            <div className="meal-food-preview-card">
              <div className="meal-photo-box">
                {mealData.imageUrl ? (
                  <img src={mealData.imageUrl} alt="식단 이미지" />
                ) : (
                  <div className="no-img">등록 사진 없음</div>
                )}
              </div>

              <div className="meal-food-preview-info">
                <div className="food-preview-title">
                  <span>🍴</span>
                  <strong>등록 음식 {mealData.foods.length}개</strong>
                </div>

                <div className="food-chip-row">
                  {mealData.foods.slice(0,2).map((food)=>(
                    <span
                      className="food-chip"
                      key={food.foNum}
                    >
                      {food.name}
                    </span>
                  ))}

                  {mealData.foods.length > 2 && (
                    <span className="food-chip more">
                      +{mealData.foods.length - 2}개
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="nutrition-area">
              <h4>AI 영양분석 ✨</h4>
                <div className="nutrition-guide-row">
                  <span>영양소</span>
                  <span>섭취비율</span>
                  <span>
                    비율(%)
                  </span>
                </div>

              {analysis && (
                <>
                  <NutrientBar
                    icon="🌽"
                    name="탄수화물"
                    status={analysis.carb.status}
                    type="carb"
                    ratio={analysis.carb.ratio}
                    currentAmount={analysis.carb.currentAmount}
                    targetAmount={analysis.carb.targetAmount}
                  />

                  <NutrientBar
                    icon="🥩"
                    name="단백질"
                    status={analysis.protein.status}
                    type="protein"
                    ratio={analysis.protein.ratio}
                    currentAmount={analysis.protein.currentAmount}
                    targetAmount={analysis.protein.targetAmount}
                  />

                  <NutrientBar
                    icon="🥑"
                    name="지방"
                    status={analysis.fat.status}
                    type="fat"
                    ratio={analysis.fat.ratio}
                    currentAmount={analysis.fat.currentAmount}
                    targetAmount={analysis.fat.targetAmount}
                  />

                  <NutrientBar
                    icon="🧂"
                    name="나트륨"
                    status={analysis.sodium.status}
                    type="sodium"
                    ratio={analysis.sodium.ratio}
                    currentAmount={analysis.sodium.currentAmount}
                    targetAmount={analysis.sodium.targetAmount}
                  />
                  <div className="sodium-total-box">
                    <span>
                      오늘 누적 {analysis.sodium.todayMg}/2000mg
                    </span>

                    <div className="sodium-total-bar">
                      <div
                        style={{
                          width:
                            `${Math.min(
                              analysis.sodium.percent,
                              100
                            )}%`
                        }}
                      />
                    </div>

                    <b>{analysis.sodium.percent}%
                      
                    </b>
                  </div>
                </>
              )}
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

           <div className="meal-action-row">
              <button
                className="record-submit-btn"
                onClick={() => setIsRecordModalOpen(true)}
              >
                식단 수정하기
              </button>

              <button
                type="button"
                className="meal-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMeal();
                }}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        )}

        {isRecordModalOpen && (
          <MealRecordModal
            key={`${recordKey}-${
              mealData?.foods?.length || 0
            }-${
              mealData?.imageUrl || "none"
            }-${
              isRecordModalOpen
            }`}
            mealType={activeMeal}
            selectedDate={formatDateText(selectedDate)}
            initialData={modalInitialData || mealData}
            onClose={() => {
              setIsRecordModalOpen(false);
              setModalInitialData(null);
            }}
            onSave={handleSaveMeal}
          />
        )}
      </div>
    </div>
  );
};

export default MealRecordDetail;
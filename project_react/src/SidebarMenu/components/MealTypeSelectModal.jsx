import { useState } from "react";
import "./MealTypeSelectModal.css";

const MealTypeSelectModal = ({
  title,
  onSelect,
  onClose,
  showAlert = true,
}) => {
  const today = new Date().toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMealType, setSelectedMealType] = useState("점심");

  const handleSubmit = () => {
    onSelect({
      mealType: selectedMealType,
      date: selectedDate,
    });

    if (showAlert) {
      alert("식단에 추가되었어요!");
    }
  };

  return (
    <div className="meal-type-modal-bg">
      <div className="meal-type-modal">
        <button className="meal-type-close" onClick={onClose}>
          ×
        </button>

        <h3>{title || "식단에 추가"}</h3>

        <div className="meal-type-section">
          <label>추가할 날짜 선택</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="meal-type-section">
          <label>식사 유형 선택</label>

          <div className="meal-type-options">
            {[
              { label: "아침", icon: "🌞" },
              { label: "점심", icon: "☀️" },
              { label: "저녁", icon: "🌙" },
            ].map((meal) => (
              <button
                key={meal.label}
                type="button"
                className={selectedMealType === meal.label ? "active" : ""}
                onClick={() => setSelectedMealType(meal.label)}
              >
                <span>{meal.icon}</span>
                {meal.label}
              </button>
            ))}
          </div>
        </div>

        <button className="meal-type-submit" onClick={handleSubmit}>
          추가하기
        </button>

        <button className="meal-type-cancel" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
};

export default MealTypeSelectModal;
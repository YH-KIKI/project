import "./MealTypeSelectModal.css";

const MealTypeSelectModal = ({ title, onSelect, onClose }) => {
  return (
    <div className="meal-type-modal-bg">
      <div className="meal-type-modal">
        <h3>{title || "🍽 어디에 추가할까요?"}</h3>

        <button onClick={() => onSelect("아침")}>🌞 아침</button>
        <button onClick={() => onSelect("점심")}>☀️ 점심</button>
        <button onClick={() => onSelect("저녁")}>🌙 저녁</button>

        <button className="meal-type-cancel" onClick={onClose}>
          취소
        </button>
      </div>
    </div>
  );
};

export default MealTypeSelectModal;
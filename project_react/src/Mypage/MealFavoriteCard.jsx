import React from 'react';

const MealFavoriteCard = ({ favorite }) => {
  return (
    <div className="favorite-card">
      {/* 식단 이미지 (데이터에 없다면 기본 이미지) */}
      <div className="image-container">
        <img src={favorite.imageUrl || "/default-meal.jpg"} alt="식단" />
        <button className="star-icon">⭐</button>
      </div>

      <div className="info-container">
        {/* 음식 목록 (예: 닭가슴살, 번티밥...) */}
        <p className="food-list">{favorite.foodListStr}</p>
        
        {/* 칼로리 */}
        <p className="calories">{favorite.totalKcal} kcal</p>
        
        {/* 추가 버튼 */}
        <button className="add-button">즐겨찾기 추가</button>
      </div>

      <style jsx>{`
        .favorite-card {
          width: 180px;
          border-radius: 15px;
          overflow: hidden;
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          margin: 10px;
        }
        .image-container { position: relative; }
        .image-container img { width: 100%; height: 120px; object-fit: cover; }
        .star-icon { position: absolute; top: 5px; right: 5px; background: none; border: none; font-size: 20px; }
        .info-container { padding: 12px; }
        .food-list { font-size: 14px; color: #333; margin-bottom: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .calories { font-weight: bold; color: #666; margin-bottom: 10px; }
        .add-button { width: 100%; padding: 8px; background: #ff80ab; color: white; border: none; border-radius: 8px; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default MealFavoriteCard;
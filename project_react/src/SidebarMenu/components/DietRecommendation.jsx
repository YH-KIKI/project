import React, { useState, useEffect } from 'react';
import './DietRecommendation.css'; 
import { fetchAiRecommendations } from '../api/dietApi'; 

const DietRecommendation = () => {
  const [activeTab, setActiveTab] = useState('맞춤 식단'); 
  const [recommendations, setRecommendations] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  
  const tabs = ['맞춤 식단', '다이어트', '건강유지', '근육증가', '저탄고지'];

  const getTodayString = () => {
    const today = new Date(); 
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = week[today.getDay()];
    return `${year}.${month}.${day} (${dayOfWeek})`; 
  };

  const currentDate = getTodayString();

  useEffect(() => {
    const loadDietData = async () => {
      setIsLoading(true); 
      setError(null);
      try {
        // 백엔드에서 이제 5개의 옵션이 담긴 리스트가 넘어옵니다.
        const data = await fetchAiRecommendations(activeTab); 
        setRecommendations(data); 
      } catch (err) {
        setError("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false); 
      }
    };
    loadDietData();
  }, [activeTab]); 

  // 🌟 옵션별 아이콘 매칭 (옵션 1~5)
  const getOptionIcon = (index) => {
    const icons = ["🥇", "🥈", "🥉", "✨", "🌟"];
    return icons[index] || "🍴";
  };

  // 🌟 식단 기록 함수
  const handleRecordDiet = (diet) => {
    if (!diet) return;

    const payload = {
      userNum: 1, 
      menuName: diet.menu,
      kcal: diet.kcal,
      carbs: diet.carbs,
      protein: diet.protein,
      fat: diet.fat,
      sodium: diet.sodium
    };
    
    console.log(`🔥 [기록하기] 선택된 식단 데이터:`, payload);
    alert(`[${diet.menu}] 오늘 식단으로 등록되었습니다!`);
  };

  return (
    <div className="recommendation-container">
      <div className="header-area">
        <h2 className="title">AI 식단 오마카세</h2>
        <span className="date">{currentDate}</span>
      </div>

      <div className="recommendation-card-wrapper">
        <div className="tab-menu">
          {tabs.map((tabName) => (
            <button 
              key={tabName} 
              className={`tab-button ${activeTab === tabName ? 'active' : ''}`}
              onClick={() => setActiveTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>

        <div className="diet-list">
          {isLoading ? (
            <div className="loading-state">
              <span className="spinner">🥗</span>
              <p>AI 셰프가 오늘의 5가지 추천 식단을 구성 중입니다...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : (
            <div className="meal-grid">
              {recommendations.map((item, index) => (
                <div className="diet-card" key={item.id || index}>
                  {/* 🌟 음식 이미지 영역 추가 */}
                  <div className="diet-image-area">
                    <img 
                      src={item.image_url || '/images/default_meal.jpg'} 
                      alt={item.menu} 
                      onError={(e) => e.target.src = '/images/default_meal.jpg'}
                    />
                    <div className="meal-badge">
                      {getOptionIcon(index)} {item.meal_time}
                    </div>
                  </div>
                  
                  <div className="diet-content">
                    <div className="diet-info">
                      <h3 className="menu-title">{item.menu}</h3>
                      <p className="ai-comment">"{item.ai_comment}"</p>
                      
                      <div className="nutrition-summary">
                        <div className="kcal-badge">{item.kcal} kcal</div>
                        <div className="macro-pills">
                          <span>탄 {item.carbs}g</span>
                          <span>단 {item.protein}g</span>
                          <span>지 {item.fat}g</span>
                        </div>
                      </div>

                      <div className="menu-tags">
                        {item.tags && item.tags.map(tag => (
                          <span key={tag} className="tag-badge">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="diet-action">
                       <button 
                        className="mini-record-btn"
                        onClick={() => handleRecordDiet(item)}
                      >
                        이 식단으로 기록하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="info-footer">
        <p>💡 탭을 클릭할 때마다 AI가 영양 목표에 맞는 5가지 옵션을 새롭게 제안합니다.</p>
      </div>
    </div>
  );
};

export default DietRecommendation;
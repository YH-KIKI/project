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
        // 🌟 이제 백엔드에서 3개의 객체가 담긴 리스트가 넘어옵니다.
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

  // 🌟 시간대별 아이콘 매칭 함수
  const getMealIcon = (mealTime) => {
    switch(mealTime) {
      case "아침": return "🌅";
      case "점심": return "☀️";
      case "저녁": return "🌙";
      default: return "🍴";
    }
  };

  // 🌟 특정 식단을 기록하는 함수 (객체를 통째로 받음)
  const handleRecordDiet = (diet) => {
    if (!diet) return;

    const payload = {
      userNum: 1, // 실제 환경에서는 로그인한 유저 번호 연동
      menuName: diet.menu,
      kcal: diet.kcal,
      carbs: diet.carbs,
      protein: diet.protein,
      fat: diet.fat,
      sodium: diet.sodium
    };
    
    console.log(`🔥 [기록하기] ${diet.meal_time} 식단 데이터:`, payload);
    alert(`[${diet.meal_time}: ${diet.menu}] 오늘 식단으로 등록되었습니다!`);
    // 이후 실제 DB 저장 API 호출 로직 추가 가능
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
              <p>AI 셰프가 오늘의 3끼 오마카세를 구성 중입니다...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : (
            <div className="meal-grid">
              {recommendations.map((item, index) => (
                <div className={`diet-card meal-time-${index}`} key={item.id || index}>
                  <div className="meal-badge">
                    {getMealIcon(item.meal_time)} {item.meal_time}
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
                        기록하기
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
        <p>💡 탭을 클릭할 때마다 AI가 새로운 메뉴를 무작위로 구성합니다.</p>
      </div>
    </div>
  );
};

export default DietRecommendation;
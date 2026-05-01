import React, { useState, useEffect } from 'react';
import './DietRecommendation.css'; 
import { fetchAiRecommendations } from '../api/dietApi'; 

const DietRecommendation = () => {
  // 🌟 변경됨: 페이지에 들어왔을 때 가장 먼저 '맞춤 식단'이 선택되어 있도록 설정합니다.
  const [activeTab, setActiveTab] = useState('맞춤 식단'); 
  const [recommendations, setRecommendations] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 

  // 🌟 변경됨: 탭 배열의 맨 앞에 '맞춤 식단'을 추가했습니다.
  const tabs = ['맞춤 식단', '다이어트', '건강유지', '근육증가', '저탄고지'];

  // 오늘 날짜를 "YYYY.MM.DD 요일" 형식으로 만들어주는 함수
  const getTodayString = () => {
    const today = new Date(); 
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = week[today.getDay()];

    return `${year}.${month}.${day} ${dayOfWeek}`; 
  };

  const currentDate = getTodayString();

  useEffect(() => {
    const loadDietData = async () => {
      setIsLoading(true); 
      setRecommendations([]); 
      
      const data = await fetchAiRecommendations(activeTab); 
      
      setRecommendations(data); 
      setIsLoading(false); 
    };

    loadDietData();
  }, [activeTab]); 

  return (
    <div className="recommendation-container">
      {/* 상단 헤더 */}
      <div className="header-area">
        <h2 className="title">AI 식단 추천</h2>
        <span className="date">{"<"} {currentDate}</span>
      </div>

      {/* 탭 버튼 메뉴 */}
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

      {/* 식단 리스트 영역 */}
      <div className="diet-list">
        {isLoading ? (
          <div className="loading-state">
            <span className="spinner">✨</span>
            <p>로로가 최적의 식단을 계산 중이에요!</p>
          </div>
        ) : (
          recommendations.map((item) => (
            <div className="diet-card" key={item.id}>
              <div className="diet-info">
                <h3 className="menu-title">{item.menu}</h3>
                <p className="menu-kcal">예상 칼로리: {item.kcal} kcal</p>
                {item.tags && (
                  <div className="menu-tags">
                    {item.tags.map(tag => (
                      <span key={tag} className="tag-badge">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="diet-image-box">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.menu} className="diet-img" />
                ) : (
                  <div className="no-img-placeholder">🍽️</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <button className="record-button" disabled={isLoading}>
        이 식단으로 기록하기
      </button>
    </div>
  );
};

export default DietRecommendation;
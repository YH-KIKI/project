import React, { useState, useEffect } from 'react';
import './DietRecommendation.css'; 
import { fetchAiRecommendations } from '../api/dietApi'; 

const DietRecommendation = () => {
  const [activeTab, setActiveTab] = useState('맞춤 식단'); 
  const [recommendations, setRecommendations] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 

  const tabs = ['맞춤 식단', '다이어트', '건강유지', '근육증가', '저탄고지'];

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
      {/* 🌟 수정됨: 제목 라인을 하얀색 카드 바깥으로 분리했습니다 */}
      <div className="header-area">
        <h2 className="title">AI 식단 추천</h2>
        <span className="date">{"<"} {currentDate}</span>
      </div>

      {/* 🌟 추가됨: 내용물들을 감싸는 100% 꽉 차는 하얀색 카드 */}
      <div className="recommendation-card">
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
    </div>
  );
};

export default DietRecommendation;
import React, { useState, useEffect } from 'react';
import './DietRecommendation.css'; 
import { fetchAiRecommendations, saveDietRecord } from '../api/dietApi'; 

const getIngredientEmoji = (ingredient) => {
  switch (ingredient) {
    case '계란': return '🍳';
    case '소고기': return '🥩';
    case '돼지고기': return '🥓';
    case '닭고기': return '🍗';
    case '샐러드': return '🥗';
    case '두부': return '🧊'; 
    case '생선': return '🐟';
    case '가공식품': return '🥫';
    case '고구마': return '🍠'; 
    case '밤': return '🌰';
    default: return '🍽️';
  }
};

const DietRecommendation = () => {
  const [activeTab, setActiveTab] = useState('맞춤 식단'); 
  const [recommendations, setRecommendations] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedDiet, setSelectedDiet] = useState(null);
  
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

  const getOptionIcon = (index) => {
    const icons = ["🥇", "🥈", "🥉", "✨", "🌟"];
    return icons[index] || "🍴";
  };

  const openRecordModal = (diet) => {
    setSelectedDiet(diet);
    setShowMealModal(true);
  };

  // MealRecordController 통신 규격에 완벽하게 맞춘 최종 기록 함수
const handleFinalRecord = async (mealType) => {
    
    // 🌟 1. localStorage의 'user' 키에서 값을 꺼내옵니다.
    const userString = localStorage.getItem('user'); 
    let userNum = 1; // 기본값

    if (userString) {
      try {
        const userObj = JSON.parse(userString); // JSON 문자열을 객체로 변환
        userNum = userObj.user_num; // 여기서 3을 꺼내옵니다!
      } catch (e) {
        console.error("유저 정보 파싱 에러:", e);
      }
    }

    // 🌟 2. 이제 userNum 변수에는 3이 담겨서 넘어갑니다!
    const payload = {
      userNum: userNum,
      mkMealType: mealType,
      mkDietDate: new Date().toISOString().split('T')[0],
      mkUserMemo: "AI 추천 식단으로 간편하게 기록했어요! 🤖",
      
      // 🌟 핵심: 여기에 탄단지 정보를 추가해서 백엔드로 보내야 합니다!
      aiMenuName: selectedDiet.menu,
      aiKcal: selectedDiet.kcal,
      aiCarbs: selectedDiet.carbs || selectedDiet.foCarbs || 0,
      aiProtein: selectedDiet.protein || selectedDiet.foProtein || 0,
      aiFat: selectedDiet.fat || selectedDiet.foFat || 0
    };
    
    console.log(`🔥 [DB전송용] ${mealType} 식단 데이터:`, payload);
    
    try {
      await saveDietRecord(payload);
      alert(`[${selectedDiet.menu}] 식단이 ${mealType}으로 성공적으로 등록되었습니다!`);
      setShowMealModal(false);
    } catch (error) {
      alert("식단 기록에 실패했습니다. 서버를 확인해주세요.");
    }
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
                <div className={`diet-card meal-time-${index % 5}`} key={item.id || index}>
                  
                  <div className="diet-icon-area">
                    <div className="meal-badge">
                      {getOptionIcon(index)} {item.meal_time}
                    </div>
                    <div className="food-emoji">
                      {getIngredientEmoji(item.main_ingredient)}
                    </div>
                  </div>
                  
                  <div className="diet-content">
                    <h3 className="menu-title">{item.menu}</h3>
                    <p className="ai-comment">"{item.ai_comment}"</p>
                    
                   <div className="nutrition-summary">
                      {/* kcal은 서버 데이터의 우선순위에 따라 출력 */}
                      <div className="kcal-badge">
                        {item.kcal || item.foKcal || 0} kcal
                      </div>
                      <div className="macro-pills">
                        {/* 🌟 수정: 팀원 데이터(foCarbs)와 추천 식단 데이터(carbs)를 모두 체크 */}
                        <span className="pill">
                          탄 {item.carbs || item.foCarbs || 0}g
                        </span>
                        <span className="pill">
                          단 {item.protein || item.foProtein || 0}g
                        </span>
                        <span className="pill">
                          지 {item.fat || item.foFat || 0}g
                        </span>
                      </div>
                    </div>

                    <div className="menu-tags">
                      {item.tags && item.tags.map(tag => (
                        <span key={tag} className="tag-badge">#{tag}</span>
                      ))}
                    </div>

                    <div className="diet-action">
                       <button 
                        className="mini-record-btn"
                        onClick={() => openRecordModal(item)}
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

      {showMealModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">어느 끼니에 기록할까요?</h3>
            <div className="modal-button-group">
              <button className="modal-btn" onClick={() => handleFinalRecord('아침')}>아침</button>
              <button className="modal-btn" onClick={() => handleFinalRecord('점심')}>점심</button>
              <button className="modal-btn" onClick={() => handleFinalRecord('저녁')}>저녁</button>
            </div>
            <button className="modal-cancel-btn" onClick={() => setShowMealModal(false)}>취소</button>
          </div>
        </div>
      )}

      <div className="info-footer">
        <p>💡 탭을 클릭할 때마다 AI가 새로운 메뉴를 무작위로 구성합니다.</p>
      </div>
    </div>
  );
};

export default DietRecommendation;
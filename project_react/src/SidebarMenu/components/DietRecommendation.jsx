import React, { useState, useEffect } from 'react';
import './DietRecommendation.css'; 
import { fetchAiRecommendations, saveDietRecord } from '../api/dietApi'; 
import axios from 'axios';

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
    default: return '🍱'; // 정식용 이모지
  }
};

const DietRecommendation = () => {
  const [activeTab, setActiveTab] = useState('맞춤 식단'); 
  const [recommendations, setRecommendations] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  
  const [userNum, setUserNum] = useState(null); 

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const userObj = JSON.parse(userString);
        setUserNum(userObj.user_num); 
      } catch (e) {
        console.error("유저 정보 파싱 에러:", e);
        setUserNum(1); 
      }
    } else {
      setUserNum(1); 
    }
  }, []); 

  useEffect(() => {
    if (userNum === null) return;

    const loadDietData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAiRecommendations(activeTab, userNum);
        setRecommendations(data);
      } catch (err) {
        setError("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDietData();
  }, [activeTab, userNum]);
    
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

  const getOptionIcon = (index) => {
    const icons = ["🥇", "🥈", "🥉", "✨", "🌟"];
    return icons[index] || "🍱";
  };

  const openRecordModal = (diet) => {
    setSelectedDiet(diet);
    setShowMealModal(true);
  };

  // 🌟 [특급 로직] 4개의 음식을 한방에 DB 규격(100g 비율)에 맞춰 저장!
  const handleFinalRecord = async (mealType) => {
    
    const userString = localStorage.getItem('user'); 
    let currentUserNum = 1; 

    if (userString) {
      try {
        const userObj = JSON.parse(userString); 
        currentUserNum = userObj.user_num; 
      } catch (e) {
        console.error("유저 정보 파싱 에러:", e);
      }
    }

    const getLocalToday = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const todayDateKey = getLocalToday();

    try {
      // 1. 해당 끼니의 기존 식단 가져오기
      const response = await axios.get(`/api/meal/today?userNum=${currentUserNum}&date=${todayDateKey}`);

      const existingFoods = [];
      let existingMkNum = null;

      if (response.data && response.data.length > 0) {
        response.data.forEach(item => {
          if (item.mkMealType === mealType) {
            existingMkNum = item.mkNum; 
            existingFoods.push({
              foNum: item.foNum,
              mdPortion: item.mdPortion || 1,
              mdKcal: Math.round((item.foKcal || 0) * (item.mdPortion || 1))
            });
          }
        });
      }

      // 2. 🌟 기존 단품 로직 대신, 4개의 음식 배열을 100g 비율(mdPortion)로 바꿔서 넣기
      let newFoods = [];
      if (selectedDiet.combo_foods && selectedDiet.combo_foods.length > 0) {
        newFoods = selectedDiet.combo_foods.map(food => ({
          foNum: food.id,
          mdPortion: Number((food.grams / 100).toFixed(2)), // 100g 단위로 환산 (예: 150g -> 1.5)
          mdKcal: Math.round(food.kcal || 0)
        }));
      } else {
        newFoods.push({
            foNum: selectedDiet.id,
            mdPortion: 1,
            mdKcal: Math.round(selectedDiet.kcal || 0)
        });
      }

      const combinedFoods = [
        ...existingFoods,
        ...newFoods
      ];

      const payload = {
        userNum: currentUserNum,
        mkNum: existingMkNum, 
        mkMealType: mealType,
        mkDietDate: todayDateKey,
        mkUserMemo: "AI 영양사가 나트륨까지 고려한 완벽한 한끼 정식! 🍱",
        foods: combinedFoods 
      };
      
      // 3. 최종 저장
      await saveDietRecord(payload);
      alert(`[${selectedDiet.menu}] 세트가 ${mealType} 식단에 완벽하게 4개 모두 기록되었습니다! 🍱`);
      setShowMealModal(false);

    } catch (error) {
      console.error("🔥 식단 추가 실패:", error);
      alert("식단 추가에 실패했습니다. 서버를 확인해주세요.");
    }
  };

  return (
    <div className="recommendation-container">
      <div className="header-area">
        <h2 className="title">AI 식단 오마카세 (정식 세트)</h2>
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
              <span className="spinner">🍱</span>
              <p>AI 셰프가 완벽한 정식을 분배 중입니다...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : (
            <div className="meal-grid">
              {/* 🌟 3개의 정식 세트 렌더링 */}
              {recommendations.slice(0, 3).map((item, index) => (
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
                    {/* 🌟 AI 코멘트에 밥, 국, 반찬 g수가 찍힙니다 */}
                    <p className="ai-comment" style={{lineHeight: '1.6'}}>"{item.ai_comment}"</p>
                    
                   <div className="nutrition-summary">
                      <div className="kcal-badge">
                        {item.kcal || item.foKcal || 0} kcal
                      </div>
                      <div className="macro-pills">
                        <span className="pill">
                          탄 {item.carbs || item.foCarbs || 0}g
                        </span>
                        <span className="pill">
                          단 {item.protein || item.foProtein || 0}g
                        </span>
                        <span className="pill">
                          지 {item.fat || item.foFat || 0}g
                        </span>
                        {/* 🔥 나트륨 뱃지 추가 */}
                        <span className="pill" style={{backgroundColor: '#FFF0F0', color: '#FF6B6B'}}>
                          나트륨 {item.sodium || 0}mg
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
                        이 정식으로 통째로 기록하기
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
            <p style={{fontSize:'12px', color:'#666', marginBottom:'15px'}}>선택 시 밥, 국, 메인, 반찬이 g비율에 맞춰 한 번에 등록됩니다.</p>
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
        <p>💡 탭을 클릭할 때마다 AI가 3가지 정식 세트를 새롭게 분배해 제안합니다.</p>
      </div>
    </div>
  );
};

export default DietRecommendation;
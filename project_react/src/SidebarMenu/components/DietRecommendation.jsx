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
    default: return '🍽️';
  }
};

const DietRecommendation = () => {
  const [activeTab, setActiveTab] = useState('맞춤 식단'); 
  const [recommendations, setRecommendations] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  
  const [userNum, setUserNum] = useState(null); // 초기값을 null로 설정

useEffect(() => {
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const userObj = JSON.parse(userString);
      setUserNum(userObj.user_num); 
    } catch (e) {
      console.error("유저 정보 파싱 에러:", e);
      setUserNum(1); // 에러 시 기본값
    }
  } else {
    setUserNum(1); // 로컬스토리지에 없으면 기본값
  }
  }, []); // 컴포넌트 마운트 시 딱 한 번만 실행

  useEffect(() => {
    // 🌟 핵심: userNum이 null이 아닐 때(준비되었을 때)만 API를 쏩니다!
    if (userNum !== null) {
      const loadDietData = async () => {
        setIsLoading(true);
        try {
          const data = await fetchAiRecommendations(activeTab, userNum);
          setRecommendations(data);
        } catch (err) {
          setError("데이터를 불러오지 못했습니다.");
        } finally {
          setIsLoading(false);
        }
      };
      loadDietData();
    }
  }, [activeTab, userNum]); // 이제 userNum이 1에서 2로 바뀌어도 딱 한 번만 제대로 호출됩니다.
    
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
        // 🌟 수정된 핵심 부분: 괄호 안에 userNum을 넣어서 API로 쏴줍니다!
        const data = await fetchAiRecommendations(activeTab, userNum); 
        setRecommendations(data); 
      } catch (err) {
        setError("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false); 
      }
    };
    loadDietData();
  }, [activeTab, userNum]); // 🌟 리액트가 userNum을 인식하도록 괄호 안에도 추가!

  const getOptionIcon = (index) => {
    const icons = ["🥇", "🥈", "🥉", "✨", "🌟"];
    return icons[index] || "🍴";
  };

  const openRecordModal = (diet) => {
    setSelectedDiet(diet);
    setShowMealModal(true);
  };

  // 🌟 기존 식단을 보호하면서 새 음식만 '추가'해주는 함수
 // 🌟 기존 식단을 보호하면서 새 음식만 '추가'해주는 함수 (완벽 호환 버전)
  const handleFinalRecord = async (mealType) => {
    
    // 1. 유저 번호 꺼내오기
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

    // 🌟 KST 타임존 보정 (오전 9시 이전 테스트 시 하루 전날로 저장되는 버그 완벽 방지)
    const getLocalToday = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const todayDateKey = getLocalToday();

    try {
      // 2. 백엔드에서 오늘 해당 끼니의 '기존 식판' 가져오기
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
              mdKcal: Math.round((item.foKcal || 0) * (item.mdPortion || 1)) // 백엔드 일반 저장 규격 맞춤
            });
          }
        });
      }

      // 3. 기존 장바구니에 AI가 추천한 '새 음식' 추가
      const combinedFoods = [
        ...existingFoods,
        {
          foNum: selectedDiet.id,
          mdPortion: 1, 
          mdKcal: Math.round(selectedDiet.kcal || 0)
        }
      ];

      // 🌟 4. [핵심] 백엔드가 "덮어쓰기"하지 않도록 AI 전용 이름표(aiMenuName 등)를 모두 제거!
      // 일반 직접 입력 식단을 저장할 때와 100% 동일한 규격으로 보냅니다.
      const payload = {
        userNum: currentUserNum,
        mkNum: existingMkNum, 
        mkMealType: mealType,
        mkDietDate: todayDateKey,
        mkUserMemo: "AI 추천 식단이 추가되었어요! 🤖",
        foods: combinedFoods 
      };
      
      // 5. 최종 저장
      await saveDietRecord(payload);
      alert(`[${selectedDiet.menu}] 식단이 ${mealType}에 성공적으로 추가되었습니다! 🍳`);
      setShowMealModal(false);

    } catch (error) {
      console.error("🔥 식단 추가 실패:", error);
      alert("식단 추가에 실패했습니다. 서버를 확인해주세요.");
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
              <p>AI 셰프가 오늘의 5가지 추천 식단을 구성 중입니다...</p>
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
        <p>💡 탭을 클릭할 때마다 AI가 영양 목표에 맞는 5가지 옵션을 새롭게 제안합니다.</p>
      </div>
    </div>
  );
};

export default DietRecommendation;
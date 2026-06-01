import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GreetingBanner from './GreetingBanner'; 
import robotFeedbackImg from '../images/로봇2.png'; 
import './Dashboard.css'; 

const Dashboard = () => {
  const navigate = useNavigate(); 

  // --- 대시보드 데이터 상태 관리 ---
  const [userInfo, setUserInfo] = useState({ name: '냠냠이', num: 1 });
  const [dailyAnalysis, setDailyAnalysis] = useState({
    currentKcal: 0,
    targetKcal: 0,
    grade: '-',
    gradeMessage: '데이터를 분석 중입니다.',
    earnedXp: 0,
    aiFeedback: '식단을 기록하면 AI가 분석해 드려요!'
  });
  const [todayMeals, setTodayMeals] = useState({ 아침: null, 점심: null, 저녁: null });

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const userString = localStorage.getItem('user');
    let currentUserNum = 1;
    let currentUserName = '냠냠이';
    
    if (userString) {
      try {
        const userObj = JSON.parse(userString);
        currentUserNum = userObj.user_num || 1;
        currentUserName = userObj.user_name || userObj.user_id || '냠냠이'; 
        setUserInfo({ name: currentUserName, num: currentUserNum });
      } catch (e) {
        console.error("유저 정보 파싱 에러:", e);
      }
    }

    const todayDate = getTodayDateString();

    const fetchDailyAnalysis = async () => {
      try {
        const response = await axios.get('/api/diet/analyze/daily', {
          params: { userNum: currentUserNum, date: todayDate, persona: '다정' }
        });
        if (response.data) {
          setDailyAnalysis(response.data);
        }
      } catch (error) {
        console.error("일일 분석 데이터를 불러오지 못했습니다.", error);
      }
    };

    const fetchTodayMeals = async () => {
      try {
        const response = await axios.get('/api/meal/today', {
          params: { userNum: currentUserNum, date: todayDate }
        });
        
        if (response.data && response.data.length > 0) {
          const meals = { 아침: null, 점심: null, 저녁: null };
          
          response.data.forEach(item => {
            // 백엔드 콘솔에 찍히던 이미지 URL 캡처
            const imgUrl = item.convertedImageUrl || item.mkImage || null;

            if (meals[item.mkMealType] === null) {
              meals[item.mkMealType] = { 
                desc: item.foName, 
                kcal: item.foKcal * (item.mdPortion || 1),
                imageUrl: imgUrl // 이미지 주소 저장
              };
            } else {
              meals[item.mkMealType].desc += `, ${item.foName}`;
              meals[item.mkMealType].kcal += (item.foKcal * (item.mdPortion || 1));
              
              // 혹시 뒤에 합쳐지는 음식에 사진이 있다면 갱신
              if (!meals[item.mkMealType].imageUrl && imgUrl) {
                meals[item.mkMealType].imageUrl = imgUrl;
              }
            }
          });
          setTodayMeals(meals);
        }
      } catch (error) {
        console.error("오늘의 식단 데이터를 불러오지 못했습니다.", error);
      }
    };

    fetchDailyAnalysis();
    fetchTodayMeals();
  }, []);

  const getScoreFromGrade = (grade) => {
    switch(grade) {
      case 'A': return 95;
      case 'B': return 85;
      case 'C': return 75;
      case 'D': return 60;
      case 'F': return 40;
      default: return 0;
    }
  };

  return (
    <div className="dashboard-wrapper">
      <GreetingBanner userName={userInfo.name} />
      
      <div className="summary-cards-container">
        <div className="border-card summary-card">
          <span className="card-title">에너지 섭취</span>
          <h3 className="card-value">{dailyAnalysis.currentKcal.toLocaleString()} <small>kcal</small></h3>
          <span className="card-sub">목표 {dailyAnalysis.targetKcal.toLocaleString()} kcal</span>
        </div>
        <div className="border-card summary-card">
          <span className="card-title">영양 밸런스</span>
          <h3 className={`card-value ${dailyAnalysis.grade === 'A' || dailyAnalysis.grade === 'B' ? 'text-green' : 'text-orange'}`}>
            {dailyAnalysis.grade === '-' ? '기록 대기' : `${dailyAnalysis.grade} 등급`}
          </h3>
          <span className="card-sub">{dailyAnalysis.gradeMessage}</span>
        </div>
        <div className="border-card summary-card">
          <span className="card-title">오늘의 점수</span>
          <h3 className="card-value">{getScoreFromGrade(dailyAnalysis.grade)} <small>점</small></h3>
          <span className="card-sub">경험치 +{dailyAnalysis.earnedXp} 획득!</span>
        </div>
      </div>

      <div>
        <div className="section-header">
          <h2 className="section-title">오늘의 식단 기록</h2>
          <span className="section-more clickable" onClick={() => navigate('/record')}>더보기 &gt;</span>
        </div>

        <div className="meal-records-container">
          {['아침', '점심', '저녁'].map((mealType) => {
            const mealData = todayMeals[mealType];
            const foodTags = mealData ? mealData.desc.split(',').map(item => item.trim()) : [];

            return (
              <div className="border-card meal-card flex-card" key={mealType}>
                
                <div className="meal-header-title">
                  <span>{mealType === '저녁' ? '🌙' : '☀️'}</span> {mealType}
                </div>
                
                <div className="meal-tags-container">
                  {mealData ? (
                    mealData.imageUrl ? (
                      /* 1순위: 등록된 이미지가 있을 때 사진을 꽉 채워 렌더링 */
                      <div className="meal-image-wrapper">
                        <img src={mealData.imageUrl} alt={`${mealType} 식단`} className="meal-uploaded-image" />
                      </div>
                    ) : (
                      /* 2순위: 이미지가 없고 텍스트 기록만 있을 때 기존 태그 렌더링 */
                      foodTags.map((food, idx) => (
                        <span key={idx} className="food-tag">
                          {food}
                        </span>
                      ))
                    )
                  ) : (
                    /* 3순위: 아예 아무런 기록도 없을 때 '기록 없음' 렌더링 */
                    <div className="empty-meal-container">
                      <span className="empty-meal-icon">🍽️</span>
                      <span className="empty-meal-text">기록 없음</span>
                    </div>
                  )}
                </div>

                <div className="meal-kcal-container">
                  <p className="meal-kcal-text">
                    {mealData ? `${Math.round(mealData.kcal).toLocaleString()} kcal` : '0 kcal'}
                  </p>
                </div>

              </div>
            );
          })}
          
          <div className="border-card add-meal-card add-meal-card-flex" onClick={() => navigate('/record')}>
            <div className="add-icon">+</div>
            <p className="add-meal-text">식단 기록<br/>추가하기</p>
          </div>
        </div>
      </div>

      <div>
        <div className="section-header">
          <h2 className="section-title">주요 기능 빠르게</h2>
        </div>

        <div className="quick-features-container">
          <div className="border-card feature-item clickable" onClick={() => navigate('/bodycheck')}>
            <div className="feature-icon bg-blue">👤</div>
            <div className="feature-text">
              <p className="feature-title">눈바디</p>
              <p className="feature-desc">AI 체형 분석</p>
            </div>
          </div>
          <div className="border-card feature-item clickable" onClick={() => navigate('/favorite')}>
            <div className="feature-icon bg-orange">⭐️</div>
            <div className="feature-text">
              <p className="feature-title">즐겨찾기</p>
              <p className="feature-desc">좋아하는 식단</p>
            </div>
          </div>
          <div className="border-card feature-item clickable" onClick={() => navigate('/badge')}>
            <div className="feature-icon bg-yellow">🏅</div>
            <div className="feature-text">
              <p className="feature-title">배지 도감</p>
              <p className="feature-desc">획득한 배지 보기</p>
            </div>
          </div>
          <div className="border-card feature-item clickable" onClick={() => navigate('/recommend')}>
            <div className="feature-icon bg-lightblue">🎯</div>
            <div className="feature-text">
              <p className="feature-title">AI 식단 추천</p>
              <p className="feature-desc">맞춤 식단 받기</p>
            </div>
          </div>
          <div className="border-card feature-item clickable" onClick={() => navigate('/aiphoto')}>
            <div className="feature-icon bg-purple">📷</div>
            <div className="feature-text">
              <p className="feature-title">사진 인식</p>
              <p className="feature-desc">음식 분석하기</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-card ai-feedback-container">
        <div className="ai-icon-wrapper">
          <img src={robotFeedbackImg} alt="AI 챗봇" style={{ width: '100%', height: '100%' }}/>
        </div>
        <div className="ai-text-content">
          <p className="ai-title">AI 한마디</p>
          <p className="ai-message" style={{ whiteSpace: 'pre-line' }}>
            {dailyAnalysis.aiFeedback}
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;
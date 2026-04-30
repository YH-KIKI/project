// MainLayout.jsx
import React from 'react';
import Sidebar from './Sidebar'; // 왼쪽 메뉴 바
import GreetingBanner from './GreetingBanner'; // 상단 인사 배너
import './MainLayout.css'; // 이 파일 전용 CSS
import robotFeedbackImg from '../images/로봇2.png';
import { useNavigate } from 'react-router-dom';

const MainLayout = () => {

  const navigate = useNavigate(); //이동 함수 생성

  const handleLoginClick = () => {
    navigate('/login'); //로그인 페이지 경로로 이동
  };

  return (
    // [page-background]: 화면 전체를 덮는 가장 큰 도화지입니다.
    // 여기에 우리가 다운로드한 '데코레이션 배경 이미지'를 깔아줄 것입니다.
    <div className="page-background">
      
      {/* [app-wrapper]: 🌟 네가 말한 '가운데 앱 영역'입니다. 🌟
          이미지에 그려진 비어있는 가운데 공간 위에 정확히 위치하게 됩니다. */}
      <div className="app-wrapper">
        
        {/* 앱 내부의 왼쪽: 사이드바 */}
        <Sidebar />

        {/* 앱 내부의 오른쪽: 메인 콘텐츠 영역 */}
        <main className="main-content">
          <header className="top-header">
            <h2 className="header-title">냠냠플래닛</h2>
            <div className="header-icons">
              <button style={{ 
                padding: '10px 30px', 
                backgroundColor: '#d1b8a0', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}onClick={handleLoginClick}>
                로그인/로그아웃
              </button>
              <button className="icon-btn">🔔</button>
              <div className="profile-icon">👩‍🍳</div>
            </div>
          </header>
          {/* 배너를 띄웁니다. userName은 props로 전달합니다. */}
          <GreetingBanner userName="냠냠이" />
          
          {/* 🌟 테두리가 추가될 콘텐츠 영역들 🌟 */}
          
          {/* 1. 상단 데이터 요약 카드 그리드 (3개) */}
          <div className="summary-cards-container">
            <div className="border-card summary-card">
              <span className="card-title">에너지 섭취</span>
              <h3 className="card-value">1,350 <small>kcal</small></h3>
              <span className="card-sub">목표 1,600 kcal</span>
            </div>
            
            <div className="border-card summary-card">
              <span className="card-title">영양 밸런스</span>
              <h3 className="card-value text-green">Good!</h3>
              <span className="card-sub">균형 잡힌 식단이에요!</span>
            </div>
            
            <div className="border-card summary-card">
              <span className="card-title">오늘의 점수</span>
              <h3 className="card-value">85 <small>점</small></h3>
              <span className="card-sub">최고예요! 🥳</span>
            </div>
          </div>

          {/* 섹션 제목 영역 추가 */}
          <div className="section-header">
            <h2 className="section-title">오늘의 식단 기록</h2>
            <span className="section-more">더보기 &gt;</span>
          </div>

          {/* 식단 기록 카드 4개로 변경 */}
          <div className="meal-records-container">
            {/* 아침 카드 */}
            <div className="border-card meal-card">
              <div className="meal-header"><span>☀️</span> 아침</div>
              {/* 실제 이미지가 있다면 아래 주석을 풀고 사용하세요 */}
              {/* <div className="meal-image"><img src={아침사진} alt="아침" /></div> */}
              <div className="meal-image-placeholder"></div>
              <p className="meal-desc">그릭요거트, 바나나, 아몬드, 삶은달걀</p>
              <p className="meal-kcal">320 kcal</p>
            </div>

            {/* 점심 카드 */}
            <div className="border-card meal-card">
              <div className="meal-header"><span>☀️</span> 점심</div>
              <div className="meal-image-placeholder"></div>
              <p className="meal-desc">현미밥, 닭가슴살, 샐러드, 김치</p>
              <p className="meal-kcal">560 kcal</p>
            </div>

            {/* 저녁 카드 */}
            <div className="border-card meal-card">
              <div className="meal-header"><span>🌙</span> 저녁</div>
              <div className="meal-image-placeholder"></div>
              <p className="meal-desc">두부김치, 잡곡밥, 나물무침</p>
              <p className="meal-kcal">470 kcal</p>
            </div>

            {/* 식단 기록 추가하기 카드 (4번째) */}
            <div className="border-card add-meal-card">
              <div className="add-icon">+</div>
              <p>식단 기록<br/>추가하기</p>
            </div>
          </div>

         {/* --- [🌟 새롭게 추가/수정된 3번 영역: 주요 기능 빠르게] --- */}
          
          <div className="section-header">
            <h2 className="section-title">주요 기능 빠르게</h2>
          </div>

          <div className="quick-features-container">
            <div className="border-card feature-item">
              <div className="feature-icon bg-blue">🩵</div>
              <div className="feature-text">
                <p className="feature-title">컨디션 로그</p>
                <p className="feature-desc">오늘의 기분 기록</p>
              </div>
            </div>
            
            <div className="border-card feature-item">
              <div className="feature-icon bg-orange">⭐️</div>
              <div className="feature-text">
                <p className="feature-title">즐겨찾기</p>
                <p className="feature-desc">좋아하는 식단</p>
              </div>
            </div>
            
            <div className="border-card feature-item">
              <div className="feature-icon bg-yellow">🏅</div>
              <div className="feature-text">
                <p className="feature-title">배지 도감</p>
                <p className="feature-desc">획득한 배지 보기</p>
              </div>
            </div>
            
            <div className="border-card feature-item">
              <div className="feature-icon bg-lightblue">🎯</div>
              <div className="feature-text">
                <p className="feature-title">AI 식단 추천</p>
                <p className="feature-desc">맞춤 식단 받기</p>
              </div>
            </div>
            
            <div className="border-card feature-item">
              <div className="feature-icon bg-purple">📷</div>
              <div className="feature-text">
                <p className="feature-title">사진 인식</p>
                <p className="feature-desc">음식 분석하기</p>
              </div>
            </div>
          </div>

          {/* 4. AI 피드백 카드 (1개) */}
          <div className="border-card ai-feedback-container">
            <div className="ai-icon-wrapper">
              {/* 💡 실제 로봇 이미지가 있다면 아래 주석을 풀고 img 태그를 사용하세요 */}
              <img src={robotFeedbackImg} alt="AI 챗봇" style={{ width: '100%', height: '100%' }}/>
              
            </div>
            <div className="ai-text-content">
              <p className="ai-title">AI 한마디</p>
              <p className="ai-message">
                <strong>오늘 단백질 섭취가 좋아요! 💪</strong><br/>
                내일은 채소를 조금 더 추가해보는 건 어떨까요? 🥦
              </p>
            </div>
          </div>
          
        </main>
        
      </div>

    </div>
  );
};

export default MainLayout;
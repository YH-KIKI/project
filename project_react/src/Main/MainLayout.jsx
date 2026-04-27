// src/Main/MainLayout.jsx (위치 수정 완료 버전)

import React from 'react';
import Sidebar from './Sidebar';
import GreetingBanner from './GreetingBanner';
import './MainLayout.css';

// 🌟 추가됨: src/images/ 폴더 안에 있는 AI 피드백 로봇 이미지를 불러옵니다.
import aiRobotFeedbackImg from '../images/로봇2.png';

const MainLayout = () => {
  return (
    // 전체 배경 도화지
    <div className="page-background">
      
      {/* ★ 삭제됨: 이미지를 배경에 띄우던 .deco-left, .deco-right 삭제 (와이어프레임에 없음) */}

      {/* 가운데 앱 영역 (빨간색 영역) */}
      <div className="app-wrapper">
        
        {/* 앱 카드의 왼쪽: 사이드바 (고양이와 로봇이 코드로 추가될 곳) */}
        <Sidebar userName="냠냠이" />

        {/* 앱 카드의 오른쪽: 메인 콘텐츠 */}
        <main className="main-content">
          {/* 배너 (고양이가 코드로 추가될 곳) */}
          <GreetingBanner userName="냠냠이" />
          
          {/* 테스트용 가짜 공간 (나중에 요약 카드 들어갈 자리) */}
          <div style={{height: '500px', background: '#f9f9f9', borderRadius: '15px', display:'flex', alignItems:'center', justifyContent:'center', color:'#999'}}>
            (이 아래에 요약 카드와 식단 기록들이 코드로 들어갈 예정)
          </div>

          {/* ★ 추가됨: 와이어프레임의 우측 하단 AI 피드백 영역 ★ */}
          <div className="ai-feedback">
            {/* 와이어프레임 위치 2-2: 웃는 로봇 이미지 추가 */}
            <img src={aiRobotFeedbackImg} alt="AI 피드백 로봇" />
            <p>AI가 분석하고 추천해주는 나만의 맞춤 식단으로 더 건강해져요! 🌱</p>
          </div>
          
        </main>
        
      </div>

    </div>
  );
};

export default MainLayout;
// AiAnalysis.jsx
import React from 'react';
import './AiAnalysis.css'; // 스타일 파일 연결

const AiAnalysis = () => {
  return (
    <div className="analysis-container">
      {/* 1. 상단 타이틀 영역 */}
      <div className="analysis-header">
        <h2>15. 영양소 분석 요약</h2>
        <span className="date-badge">2024.05.20 월</span>
      </div>

      {/* 2. 메인 카드 영역 (흰색 배경 카드) */}
      <div className="analysis-card">
        
        {/* 2-1. 칼로리 요약 */}
        <div className="calorie-section">
          <h3>나의 하루</h3>
          <div className="calorie-info">
            <span className="current-kcal">1350</span>
            <span className="target-kcal"> / 1800 kcal</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '75%' }}></div>
          </div>
          <p className="calorie-message">450 kcal 더 먹을 수 있어요</p>
        </div>

        {/* 2-2. AI 등급 평가 */}
        <div className="grade-section">
          <div className="grade-circle">B+</div>
          <div className="grade-text">
            <strong>B+ 등급: 전체적으로 균형 잡힌 식단이에요!</strong>
            <p>조금만 더 신경 쓰면 완벽해요!</p>
          </div>
        </div>

        {/* 2-3. 영양소 프로그레스 바 목록 */}
        <div className="macro-section">
          <div className="macro-item">
            <div className="macro-label"><span>탄수화물</span> <span>120/180g</span></div>
            <div className="progress-bar"><div className="progress-fill carbs" style={{ width: '66%' }}></div></div>
          </div>
          <div className="macro-item">
            <div className="macro-label"><span>단백질</span> <span>45/57g</span></div>
            <div className="progress-bar"><div className="progress-fill protein" style={{ width: '78%' }}></div></div>
          </div>
          {/* 지방, 당류, 나트륨 등도 동일한 구조로 들어갑니다 */}
        </div>

        {/* 2-4. 하단 AI 코치 피드백 */}
        <div className="feedback-section">
          <p>AI 분석 결과,<br/>당신은 지금 물을 한 잔 마시는 것이 좋아요!</p>
          <button className="ai-coach-btn">
            <span className="robot-icon">🤖</span>
            AI 코치 피드백 {'>'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AiAnalysis;
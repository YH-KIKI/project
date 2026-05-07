import React, { useState } from 'react';
import './Stats.css';

const Stats = () => {
  const [activeTab, setActiveTab] = useState('주간');

  // 🌟 주간 데이터 세트
  const weeklyData = [
    { day: '월', kcal: 1200, height: '40%' },
    { day: '화', kcal: 1350, height: '50%' },
    { day: '수', kcal: 1100, height: '35%' },
    { day: '목', kcal: 1500, height: '60%' },
    { day: '금', kcal: 1400, height: '55%' },
    { day: '토', kcal: 1800, height: '80%' },
    { day: '일', kcal: 1600, height: '70%' },
  ];

  // 🌟 월간 데이터 세트 (새로 추가됨!)
  const monthlyData = [
    { day: '1주차', kcal: 8500, height: '55%' },
    { day: '2주차', kcal: 9200, height: '65%' },
    { day: '3주차', kcal: 7800, height: '45%' },
    { day: '4주차', kcal: 10500, height: '85%' },
    { day: '5주차', kcal: 2300, height: '20%' }, // 달에 따라 5주차가 있을 수 있으니 추가
  ];

  // 🌟 현재 선택된 탭에 따라 보여줄 데이터 결정
  const currentData = activeTab === '주간' ? weeklyData : monthlyData;
  
  // 🌟 누적 칼로리 자동 계산
  const totalKcal = currentData.reduce((sum, item) => sum + item.kcal, 0);

  // 라벨링 동적 변경 (주간 누적 vs 월간 누적)
  const cumulativeLabel = activeTab === '주간' ? '주간 누적' : '월간 누적';
  const chartTitle = activeTab === '주간' ? '주간 칼로리 섭취' : '월간 칼로리 섭취';
  const ratioTitle = activeTab === '주간' ? '(주간 평균)' : '(월간 평균)';

  return (
    <div className="stats-container">
      {/* 상단 타이틀 */}
      <div className="header-area">
        <h2 className="title">통계 메인</h2>
      </div>

      <div className="stats-card">
        {/* 🌟 탭 버튼 메뉴 (클릭 시 상태 변경) */}
        <div className="stats-tab-menu">
          <button 
            className={`stats-tab-button ${activeTab === '주간' ? 'active' : ''}`}
            onClick={() => setActiveTab('주간')}
          >
            주간
          </button>
          <button 
            className={`stats-tab-button ${activeTab === '월간' ? 'active' : ''}`}
            onClick={() => setActiveTab('월간')}
          >
            월간
          </button>
        </div>

        {/* 🌟 칼로리 섭취 차트 (데이터 동적 렌더링) */}
        <div className="chart-section">
          <h3 className="section-title">
            {chartTitle} <span className="cumulative">({cumulativeLabel}: {totalKcal.toLocaleString()} kcal)</span>
          </h3>
          
          <div className="bar-chart-container">
            <div className="y-axis">
              {/* 월간일 경우 Y축 숫자를 다르게 보여주고 싶다면 여기도 조건부 렌더링 가능합니다 */}
              <span>{activeTab === '주간' ? '1500' : '10000'}</span>
              <span>{activeTab === '주간' ? '1000' : '5000'}</span>
              <span>{activeTab === '주간' ? '500' : '1000'}</span>
            </div>
            <div className="bars-area">
              {currentData.map((data, index) => (
                <div className="bar-group" key={index} style={{ width: activeTab === '주간' ? '14%' : '20%' }}>
                  <div className="bar-wrapper">
                    <div className="bar-tooltip">{data.kcal.toLocaleString()}kcal</div>
                    <div className="bar-fill" style={{ height: data.height }}></div>
                  </div>
                  <span className="x-axis-label">{data.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🌟 영양소 비율 (시안 레이아웃 완벽 구현) */}
        <div className="nutrient-ratio-section">
          <h3 className="section-title">영양소 비율 <span className="cumulative">{ratioTitle}</span></h3>

          <div className="ratio-content-wrapper">
            
            {/* 왼쪽 단: 도넛 차트 + 지방 카드 */}
            <div className="ratio-left-column">
              {/* 도넛 차트 */}
              <div className="donut-chart-box">
                <div className="donut-chart">
                  <div className="donut-hole"></div>
                  <span className="donut-label label-carbs">52%</span>
                  <span className="donut-label label-protein">22%</span>
                  <span className="donut-label label-fat">18%</span>
                  <span className="donut-label label-sodium">8%</span>
                </div>
              </div>

              {/* 지방 카드 */}
              <div className="nut-card fat-card">
                <div className="nut-header">
                  <span className="nut-name">지방</span>
                  <span className="nut-icon">🥑</span>
                </div>
                <div className="nut-middle">
                  <span className="nut-badge">[미달]</span>
                </div>
                <div className="nut-progress-bg">
                  <div className="nut-progress-fill" style={{ width: '77%' }}></div>
                </div>
                <div className="nut-footer">
                  <span className="nut-value">27g / 35g</span>
                  <span className="nut-percent">18%</span>
                </div>
              </div>
            </div>

            {/* 오른쪽 단: 탄수화물, 단백질, 나트륨 카드 */}
            <div className="ratio-right-column">
              {/* 탄수화물 카드 */}
              <div className="nut-card carbs-card">
                <div className="nut-header">
                  <span className="nut-name">탄수화물 <span className="nut-badge">[양호]</span></span>
                  <span className="nut-icon">🌾</span>
                </div>
                <div className="nut-middle">
                  <span className="nut-value">175g / 180g</span>
                </div>
                <div className="nut-progress-bg">
                  <div className="nut-progress-fill" style={{ width: '97%' }}></div>
                </div>
                <div className="nut-footer" style={{ justifyContent: 'flex-end' }}>
                  <span className="nut-percent" style={{ visibility: 'hidden' }}>0%</span>
                </div>
              </div>

              {/* 단백질 카드 */}
              <div className="nut-card protein-card">
                <div className="nut-header">
                  <span className="nut-name">단백질 <span className="nut-badge">[초과!]</span></span>
                  <span className="nut-icon">🍗</span>
                </div>
                <div className="nut-middle">
                  <span className="nut-value">74g / 57g</span>
                  <span className="nut-percent">22%</span>
                </div>
                <div className="nut-progress-bg">
                  <div className="nut-progress-fill" style={{ width: '100%' }}></div>
                </div>
              </div>

              {/* 나트륨 카드 */}
              <div className="nut-card sodium-card">
                <div className="nut-header">
                  <span className="nut-name">나트륨</span>
                  <span className="nut-icon">🧂</span>
                </div>
                <div className="nut-middle">
                  <span className="nut-badge badge-gray">[보통]</span>
                </div>
                <div className="nut-progress-bg">
                  <div className="nut-progress-fill" style={{ width: '40%' }}></div>
                </div>
                <div className="nut-footer">
                  <span className="nut-value">800mg / 2000mg</span>
                  <span className="nut-percent">8%</span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Stats;
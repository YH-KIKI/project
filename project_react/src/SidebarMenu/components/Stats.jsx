import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker'; 
import "react-datepicker/dist/react-datepicker.css"; 
import { format } from 'date-fns'; 
import { ko } from 'date-fns/locale'; 
import './Stats.css';

const Stats = ({ userNum = 1 }) => {
  const [activeTab, setActiveTab] = useState('주간');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [chartData, setChartData] = useState([]);
  const [nutrients, setNutrients] = useState({ carbs: 0, protein: 0, fat: 0, sodium: 0 });
  
  // 🌟 식단 기록된 날짜들을 저장할 상태 추가
  const [recordedDates, setRecordedDates] = useState([]); 

  // 🌟 1. 달력 도장(기록된 날짜) 데이터 가져오기 Effect
  useEffect(() => {
    const fetchRecordedDates = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/v1/diet/recorded-dates`, { params: { userNum } });
        setRecordedDates(response.data.map(dateStr => new Date(dateStr)));
      } catch (err) {
        console.error("기록된 날짜 가져오기 실패:", err);
      }
    };
    fetchRecordedDates();
  }, [userNum]);

  // 🌟 2. 통계 데이터 가져오기 Effect
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const type = activeTab === '주간' ? 'weekly' : 'monthly';
        
        const response = await axios.get(`http://localhost:8080/api/v1/diet/stats`, {
          params: { userNum: userNum, date: formattedDate, type: type }
        });
        
        setChartData(response.data.chartData);
        setNutrients(response.data.nutrients);
      } catch (err) {
        console.error("통계 데이터 로딩 실패:", err);
      }
    };
    fetchStats();
  }, [userNum, selectedDate, activeTab]);

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const divideDays = activeTab === '주간' ? 7 : daysInMonth;

  const totalKcal = chartData.reduce((sum, item) => sum + (item.kcal || 0), 0);
  const avgKcal = Math.round(totalKcal / divideDays) || 0;
  
  const maxKcal = chartData.length > 0 ? Math.max(...chartData.map(d => d.kcal || 0), 1) : 1; 

  const totalMacros = (nutrients.carbs + nutrients.protein + nutrients.fat) || 1;
  const carbsPct = Math.round((nutrients.carbs / totalMacros) * 100) || 0;
  const proteinPct = Math.round((nutrients.protein / totalMacros) * 100) || 0;
  const fatPct = Math.round((nutrients.fat / totalMacros) * 100) || 0;

  const avgLabel = '일평균 섭취';
  const chartTitle = activeTab === '주간' ? '주간 칼로리 추이' : '월간 칼로리 추이';
  const ratioTitle = activeTab === '주간' ? '(주간 평균 비율)' : '(월간 평균 비율)';

  return (
    <div className="stats-container">
      <div className="header-area">
        <h2 className="title">통계 메인</h2>
        <div className="date-picker-wrapper">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat={activeTab === '월간' ? "yyyy년 MM월" : "yyyy.MM.dd"} 
            dateFormatCalendar="yyyy년 MM월" 
            locale={ko}
            maxDate={new Date()}
            className="date-badge-input"
            showMonthYearPicker={activeTab === '월간'} 
            // 🌟 3. 달력에 식단 기록일 색칠하기 적용!
            highlightDates={[{ "react-datepicker__day--highlighted-custom": recordedDates }]} 
          />
        </div>
      </div>

      <div className="stats-card">
        <div className="stats-tab-menu">
          <button className={`stats-tab-button ${activeTab === '주간' ? 'active' : ''}`} onClick={() => setActiveTab('주간')}>주간</button>
          <button className={`stats-tab-button ${activeTab === '월간' ? 'active' : ''}`} onClick={() => setActiveTab('월간')}>월간</button>
        </div>

        <div className="chart-section">
          <h3 className="section-title">
            {chartTitle} <span className="avg-badge">({avgLabel}: {avgKcal.toLocaleString()} kcal)</span>
          </h3>
          <div className="bar-chart-container">
            <div className="y-axis">
              <span>{Math.round(maxKcal)}</span>
              <span>{Math.round(maxKcal / 2)}</span>
              <span>0</span>
            </div>
            <div className="bars-area">
              {chartData.map((data, index) => {
                const pct = (data.kcal / maxKcal) * 100 || 0;
                const barHeight = `${Math.max(pct, 2)}%`; 
                return (
                  <div className="bar-group" key={index} style={{ width: activeTab === '주간' ? '12%' : '18%' }}>
                    <div className="bar-wrapper">
                      <div className="bar-tooltip">{data.kcal ? data.kcal.toLocaleString() : 0}kcal</div>
                      <div className="bar-fill" style={{ height: barHeight }}></div>
                    </div>
                    <span className="x-axis-label">{data.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="nutrient-ratio-section">
          <h3 className="section-title">영양소 비율 <span className="avg-badge">{ratioTitle}</span></h3>
          
          <div className="ratio-content-wrapper">
            <div className="ratio-left-column">
              <div className="donut-chart-box">
                <div className="donut-chart" style={{
                  background: `conic-gradient(
                    #A7E0B3 0% ${carbsPct}%,  
                    #F5A9A9 ${carbsPct}% ${carbsPct + proteinPct}%, 
                    #F7D560 ${carbsPct + proteinPct}% 100%
                  )`
                }}>
                  <div className="donut-hole">
                    <div className="donut-hole-center-kcal">
                      <span className="hole-avg-kcal">{avgKcal.toLocaleString()}</span>
                      <span className="hole-kcal-unit">kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ratio-right-column">
              
              <div className="macro-list-card carbs-card">
                <div className="macro-list-header">
                  <div className="macro-title">
                    <span className="legend-dot" style={{backgroundColor: '#A7E0B3'}}></span>
                    탄수화물
                  </div>
                  <div className="macro-values">
                    <span className="m-current">{nutrients.carbs}g</span>
                    <span className="m-max">/ 200g</span>
                    <span className="m-pct carbs-txt">{carbsPct}%</span>
                  </div>
                </div>
                <div className="m-progress-bg">
                  <div className="m-progress-fill carbs-bg" style={{ width: `${Math.min((nutrients.carbs/200)*100, 100)}%` }}></div>
                </div>
              </div>

              <div className="macro-list-card protein-card">
                <div className="macro-list-header">
                  <div className="macro-title">
                    <span className="legend-dot" style={{backgroundColor: '#F5A9A9'}}></span>
                    단백질
                  </div>
                  <div className="macro-values">
                    <span className="m-current">{nutrients.protein}g</span>
                    <span className="m-max">/ 100g</span>
                    <span className="m-pct protein-txt">{proteinPct}%</span>
                  </div>
                </div>
                <div className="m-progress-bg">
                  <div className="m-progress-fill protein-bg" style={{ width: `${Math.min((nutrients.protein/100)*100, 100)}%` }}></div>
                </div>
              </div>

              <div className="macro-list-card fat-card">
                <div className="macro-list-header">
                  <div className="macro-title">
                    <span className="legend-dot" style={{backgroundColor: '#F7D560'}}></span>
                    지방
                  </div>
                  <div className="macro-values">
                    <span className="m-current">{nutrients.fat}g</span>
                    <span className="m-max">/ 50g</span>
                    <span className="m-pct fat-txt">{fatPct}%</span>
                  </div>
                </div>
                <div className="m-progress-bg">
                  <div className="m-progress-fill fat-bg" style={{ width: `${Math.min((nutrients.fat/50)*100, 100)}%` }}></div>
                </div>
              </div>

              <div className="macro-list-card sodium-card">
                <div className="macro-list-header">
                  <div className="macro-title">
                    <span className="legend-dot" style={{backgroundColor: '#EAEAEA', border: '1px solid #CCC'}}></span>
                    나트륨
                  </div>
                  <div className="macro-values">
                    <span className="m-current">{nutrients.sodium}mg</span>
                    <span className="m-max">/ 2000mg</span>
                  </div>
                </div>
                <div className="m-progress-bg">
                  <div className="m-progress-fill sodium-bg" style={{ width: `${Math.min((nutrients.sodium/2000)*100, 100)}%` }}></div>
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
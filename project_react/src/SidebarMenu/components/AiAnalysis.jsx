import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker'; 
import "react-datepicker/dist/react-datepicker.css"; 
import { format } from 'date-fns'; 
import { ko } from 'date-fns/locale'; 
import './AiAnalysis.css';

// 로로 이미지 임포트
import roroIcon from '../../images/로봇2.png'; 

const AiAnalysis = ({ userNum = 1 }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [analysisData, setAnalysisData] = useState(null);
  const [recordedDates, setRecordedDates] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 달력에 칠할 기록된 날짜 가져오기
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

  // 식단 데이터 가져오기
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const response = await axios.get(`http://localhost:8080/api/v1/diet/analyze/daily`, {
          params: { userNum, date: formattedDate }
        });
        setAnalysisData(response.data);
        setError(null); 
      } catch (err) {
        setAnalysisData(null); 
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysisData();
  }, [userNum, selectedDate]);

  const calculateWidth = (current, target) => {
    if (!target || target === 0) return '0%';
    return `${Math.min((current / target) * 100, 100)}%`;
  };

  return (
    <div className="analysis-container">
      {/* 1. 상단 헤더 및 달력 영역 */}
      <div className="analysis-header">
        <h2>AI 분석 요약</h2>
        <div className="date-picker-wrapper">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat={["yyyy.MM.dd", "yyyyMMdd", "yyyy-MM-dd"]} 
            dateFormatCalendar="yyyy년 MM월" /* 🌟 버그 없이 깔끔하게 "년 월" 표시 */
            locale={ko}
            maxDate={new Date()}
            className="date-badge-input"
            highlightDates={[{ "react-datepicker__day--highlighted-custom": recordedDates }]}
          />
        </div>
      </div>

      {/* 2. 메인 콘텐츠 분기 처리 (로딩/에러/빈화면/데이터있음) */}
      {loading ? (
        <div className="analysis-card loading">데이터를 불러오는 중입니다... ⏳</div>
      ) : error ? (
        <div className="analysis-card error">데이터를 불러오는데 실패했습니다.</div>
      ) : (!analysisData || analysisData.currentKcal === 0) ? (
        <div className="analysis-card empty-state">
          <div className="empty-character">🍳</div>
          <h3>아직 기록된 식단이 없어요!</h3>
          <p>이날은 어떤 맛있는 음식을 드셨나요?<br/>식단을 기록하고 AI 분석을 받아보세요.</p>
          <button className="go-record-btn" onClick={() => alert("식단 기록 페이지로 이동합니다!")}>
            식단 기록하러 가기 ✏️
          </button>
        </div>
      ) : (
        <div className="analysis-card">
          
          <div className="calorie-section">
            <h3>나의 하루</h3>
            <div className="calorie-info">
              <span className="current-kcal">{analysisData.currentKcal}</span>
              <span className="target-kcal"> / {analysisData.targetKcal} kcal</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: calculateWidth(analysisData.currentKcal, analysisData.targetKcal) }}></div>
            </div>
            <p className="calorie-message">
               {analysisData.targetKcal - analysisData.currentKcal > 0 
                  ? `${analysisData.targetKcal - analysisData.currentKcal} kcal 더 먹을 수 있어요` 
                  : '목표 칼로리를 초과했어요!'}
            </p>
          </div>

          <div className="grade-section">
            <div className="grade-circle">{analysisData.grade}</div>
            <div className="grade-text">
              <strong>{analysisData.grade} 등급: {analysisData.gradeMessage}</strong>
              <p>획득한 경험치: {analysisData.earnedXp} XP</p>
            </div>
          </div>

          <div className="macro-section">
            <div className="ai-macro-item">
              <div className="macro-label"><span>탄수화물</span> <span>{analysisData.currentCarbs}/200g</span></div>
              <div className="progress-bar"><div className="progress-fill carbs" style={{ width: calculateWidth(analysisData.currentCarbs, 200) }}></div></div>
            </div>
            <div className="ai-macro-item">
              <div className="macro-label"><span>단백질</span> <span>{analysisData.currentProtein}/100g</span></div>
              <div className="progress-bar"><div className="progress-fill protein" style={{ width: calculateWidth(analysisData.currentProtein, 100) }}></div></div>
            </div>
            <div className="ai-macro-item">
              <div className="macro-label"><span>지방</span> <span>{analysisData.currentFat}/50g</span></div>
              <div className="progress-bar"><div className="progress-fill fat" style={{ width: calculateWidth(analysisData.currentFat, 50) }}></div></div>
            </div>
            <div className="ai-macro-item">
              <div className="macro-label"><span>나트륨</span> <span>{analysisData.currentSodium}/2000mg</span></div>
              <div className="progress-bar"><div className="progress-fill sodium" style={{ width: calculateWidth(analysisData.currentSodium, 2000) }}></div></div>
            </div>
          </div>

          {/* 하단 로로 코치 피드백 */}
          <div className="feedback-section">
            <div className="feedback-header">
              <div className="roro-icon-wrap">
                <img src={roroIcon} alt="Roro AI Coach" className="roro-icon-img" />
              </div>
              <strong>다정한 로로 코치의 맞춤 피드백</strong>
            </div>
            <div className="feedback-message-list">
              {analysisData.aiFeedback ? (
                analysisData.aiFeedback.split('\n').map((line, index) => (
                  <p key={index} className="feedback-bubble">{line}</p>
                ))
              ) : (
                <p className="feedback-bubble">로로 코치가 식단을 분석 중입니다!</p>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AiAnalysis;
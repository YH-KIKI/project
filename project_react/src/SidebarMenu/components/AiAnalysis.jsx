import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker'; 
import "react-datepicker/dist/react-datepicker.css"; 
import { format } from 'date-fns'; 
import { ko } from 'date-fns/locale'; 
import { useNavigate } from 'react-router-dom'; 
import './AiAnalysis.css';

import roroIcon from '../../images/로봇2.png'; 

const AiAnalysis = () => {
  const navigate = useNavigate(); 

  // 식단 기록 페이지와 동일하게 '진짜 로그인한 유저 번호'를 가져옵니다!
  const userString = localStorage.getItem("user");
  const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;
  const userNum = user?.user_num || Number(localStorage.getItem("userNum")) || 1;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [analysisData, setAnalysisData] = useState(null);
  const [recordedDates, setRecordedDates] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecordedDates = async () => {
      try {
        const response = await axios.get(`/api/diet/recorded-dates`, { params: { userNum } });
        setRecordedDates(response.data.map(dateStr => new Date(dateStr)));
      } catch (err) {
        console.error("기록된 날짜 가져오기 실패:", err);
      }
    };
    fetchRecordedDates();
  }, [userNum]);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        const response = await axios.get(`/api/diet/analyze/daily`, {
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
      <div className="analysis-header">
        <h2>AI 분석 요약</h2>
        <div className="date-picker-wrapper">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy.MM.dd" 
            locale={ko}
            maxDate={new Date()}
            className="date-badge-input" 
            highlightDates={[{ "react-datepicker__day--highlighted-custom": recordedDates }]}
          />
        </div>
      </div>

      {loading ? (
        <div className="analysis-card loading">데이터를 불러오는 중입니다... ⏳</div>
      ) : error ? (
        <div className="analysis-card error">데이터를 불러오는데 실패했습니다.</div>
      ) : (!analysisData || analysisData.currentKcal === 0) ? (
        <div className="analysis-card empty-state">
          <div className="empty-character">🍳</div>
          <h3>아직 기록된 식단이 없어요!</h3>
          <p>이날은 어떤 맛있는 음식을 드셨나요?<br />식단을 기록하고 AI 분석을 받아보세요.</p>
          <button className="go-record-btn" onClick={() => navigate('/record')}>
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

          {/* 🌟 수정된 탄단지 프로그레스 바 영역: 하드코딩 제거 및 동적 데이터 연결 */}
          <div className="macro-section">
            <div className="ai-macro-item">
              <div className="macro-label">
                <span>탄수화물</span> 
                <span>{analysisData.currentCarbs}/{analysisData.targetCarbs || 0}g</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill carbs" style={{ width: calculateWidth(analysisData.currentCarbs, analysisData.targetCarbs) }}></div>
              </div>
            </div>
            <div className="ai-macro-item">
              <div className="macro-label">
                <span>단백질</span> 
                <span>{analysisData.currentProtein}/{analysisData.targetProtein || 0}g</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill protein" style={{ width: calculateWidth(analysisData.currentProtein, analysisData.targetProtein) }}></div>
              </div>
            </div>
            <div className="ai-macro-item">
              <div className="macro-label">
                <span>지방</span> 
                <span>{analysisData.currentFat}/{analysisData.targetFat || 0}g</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill fat" style={{ width: calculateWidth(analysisData.currentFat, analysisData.targetFat) }}></div>
              </div>
            </div>
            <div className="ai-macro-item">
              <div className="macro-label">
                <span>나트륨</span> 
                <span>{analysisData.currentSodium}/{analysisData.targetSodium || 2000}mg</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill sodium" style={{ width: calculateWidth(analysisData.currentSodium, analysisData.targetSodium || 2000) }}></div>
              </div>
            </div>
          </div>

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
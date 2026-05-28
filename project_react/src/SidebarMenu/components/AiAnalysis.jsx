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

  const userString = localStorage.getItem("user");
  const user = userString && userString !== "undefined" ? JSON.parse(userString) : null;
  const userNum = user?.user_num || Number(localStorage.getItem("userNum")) || 1;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [analysisData, setAnalysisData] = useState(null);
  const [recordedDates, setRecordedDates] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. 현재 선택된 코치(페르소나) 상태 추가
  const [persona, setPersona] = useState("다정");

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
        
        // 2. params에 persona를 포함하여 스프링부트로 전송
        const response = await axios.get(`/api/diet/analyze/daily`, {
          params: { userNum, date: formattedDate, persona }
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
  }, [userNum, selectedDate, persona]); // 3. persona가 바뀔 때마다 즉시 새 피드백 요청

  const calculateWidth = (current, target) => {
    if (!target || target === 0) return '0%';
    return `${Math.min((current / target) * 100, 100)}%`;
  };

  // 4. 페르소나에 맞춰 하단 피드백 타이틀을 동적으로 변경하는 함수
  const getCoachName = () => {
    switch(persona) {
      case "팩폭": return "호랑이 코치";
      case "열혈": return "열혈 트레이너";
      case "츤데레": return "츤데레 코치";
      default: return "다정한 로로 코치";
    }
  };

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h2>AI 분석 요약</h2>
        <div className="header-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          
          {/* 5. AI 코치 선택 드롭다운 UI 추가 */}
          <div className="persona-selector">
            <select 
              value={persona} 
              onChange={(e) => setPersona(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #ffb6c1',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#555'
              }}
            >
              <option value="다정">👼 다정 모드</option>
              <option value="팩폭">🐯 팩폭 모드</option>
              <option value="열혈">🔥 열혈 모드</option>
              <option value="츤데레">😎 츤데레 모드</option>
            </select>
          </div>
          
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
              {/* 6. 하드코딩 문구 제거, 제미나이가 만든 1줄 타이틀 적용 */}
              <strong>{analysisData.gradeMessage}</strong>
              <p>획득한 경험치: {analysisData.earnedXp} XP</p>
            </div>
          </div>

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
                <img src={roroIcon} alt="AI Coach" className="roro-icon-img" />
              </div>
              {/* 7. 선택한 코치에 맞게 이름이 변하는 타이틀 */}
              <strong>{getCoachName()}의 맞춤 피드백</strong>
            </div>
            <div className="feedback-message-list">
              {analysisData.aiFeedback ? (
                analysisData.aiFeedback.split('\n').map((line, index) => (
                  <p key={index} className="feedback-bubble">{line}</p>
                ))
              ) : (
                <p className="feedback-bubble">코치가 식단을 분석 중입니다!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAnalysis;
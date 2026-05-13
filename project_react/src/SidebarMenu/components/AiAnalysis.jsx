// AiAnalysis.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker'; 
import "react-datepicker/dist/react-datepicker.css"; 
import { format } from 'date-fns'; 
import { ko } from 'date-fns/locale'; 
import './AiAnalysis.css';

const AiAnalysis = ({ userNum = 1 }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [analysisData, setAnalysisData] = useState(null);
  const [recordedDates, setRecordedDates] = useState([]); // 🌟 식단이 기록된 날짜들 보관
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. 컴포넌트 렌더링 시 기록된 전체 날짜 목록 가져오기 (달력에 도장 찍기용)
  useEffect(() => {
    const fetchRecordedDates = async () => {
      try {
        // 추후 백엔드에 이 API를 만들어주세요!
        const response = await axios.get(`http://localhost:8080/api/v1/diet/recorded-dates`, {
          params: { userNum: userNum }
        });
        // ["2026-05-12", "2026-05-13"] 형태의 문자열을 Date 객체 배열로 변환
        const dateObjects = response.data.map(dateStr => new Date(dateStr));
        setRecordedDates(dateObjects);
      } catch (err) {
        console.error("기록된 날짜 목록 가져오기 실패:", err);
      }
    };
    fetchRecordedDates();
  }, [userNum]);

  // 2. 선택된 날짜의 식단 분석 데이터 가져오기
  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        setLoading(true);
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');
        
        const response = await axios.get(`http://localhost:8080/api/v1/diet/analyze/daily`, {
          params: {
            userNum: userNum,
            date: formattedDate
          }
        });
        
        setAnalysisData(response.data);
        setError(null); 
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
        setAnalysisData(null); 
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysisData();
  }, [userNum, selectedDate]);

  // 프로그레스 바 너비 계산
  const calculateWidth = (current, target) => {
    if (!target || target === 0) return '0%';
    const percentage = (current / target) * 100;
    return `${Math.min(percentage, 100)}%`;
  };

  return (
    <div className="analysis-container">
      {/* 1. 상단 타이틀 및 달력 영역 */}
      <div className="analysis-header">
        <h2>AI 분석 요약</h2>
        <div className="date-picker-wrapper">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            // 🌟 3가지 입력 방식 지원 (2026.05.13, 20260513, 2026-05-13 모두 가능!)
            dateFormat={["yyyy.MM.dd", "yyyyMMdd", "yyyy-MM-dd"]} 
            locale={ko}
            maxDate={new Date()}
            className="date-badge-input"
            showYearDropdown 
            showMonthDropdown 
            dropdownMode="select"
            // 🌟 기록된 날짜들에 핑크색 배경 커스텀 클래스 적용
            highlightDates={[
              {
                "react-datepicker__day--highlighted-custom": recordedDates
              }
            ]}
          />
        </div>
      </div>

      {/* 로딩 / 에러 / 빈 화면(데이터 없음) 처리 */}
      {loading ? (
        <div className="analysis-card loading">데이터를 불러오는 중입니다... ⏳</div>
      ) : error ? (
        <div className="analysis-card error">데이터를 불러오는데 실패했습니다.</div>
      ) : (!analysisData || analysisData.currentKcal === 0) ? (
        /* 🌟 데이터가 없을 때 나오는 귀여운 Empty State 🌟 */
        <div className="analysis-card empty-state">
          <div className="empty-character">🍳</div>
          <h3>아직 기록된 식단이 없어요!</h3>
          <p>이날은 어떤 맛있는 음식을 드셨나요?<br/>식단을 기록하고 AI 분석을 받아보세요.</p>
          <button className="go-record-btn" onClick={() => alert("식단 기록 페이지로 이동합니다!")}>
            식단 기록하러 가기 ✏️
          </button>
        </div>
      ) : (
        /* 2. 메인 카드 영역 (정상적으로 데이터가 있을 때) */
        <div className="analysis-card">
          
          <div className="calorie-section">
            <h3>나의 하루</h3>
            <div className="calorie-info">
              <span className="current-kcal">{analysisData.currentKcal}</span>
              <span className="target-kcal"> / {analysisData.targetKcal} kcal</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: calculateWidth(analysisData.currentKcal, analysisData.targetKcal) }}
              ></div>
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

          <div className="feedback-section">
            {/* 파이썬에서 \n으로 넘어오는 줄바꿈을 html <br/>로 변환하여 출력 */}
            <p dangerouslySetInnerHTML={{ __html: analysisData.aiFeedback ? analysisData.aiFeedback.replace(/\n/g, '<br/>') : 'AI 피드백 준비 중입니다!' }}></p>
            <button className="ai-coach-btn">
              <span className="robot-icon">🤖</span>
              AI 코치 피드백 {'>'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default AiAnalysis;
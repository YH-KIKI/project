import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Evaluation.css'; // 🌟 외부 분리된 CSS 불러오기

const Evaluation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mealResult, mealType } = location.state || {}; 

  const [userGoal, setUserGoal] = useState(null); 
  const [aiComment, setAiComment] = useState('냥이 영양사가 식단을 분석중이다냥... 🐾');
  const [isAiLoading, setIsAiLoading] = useState(true);

  // 중복 호출 방지용 락 장치
  const hasCalledAi = useRef(false);

  // 기존에 적혀있던 자동 주소 선택 스위치냥
  const SERVER_URL = process.env.REACT_APP_API_URL || window.location.origin;

  // 주소에서 자바 포트(:8080)를 싹 지우고, 파이썬 포트(:8000)를 붙인
  const AI_SERVER_URL = SERVER_URL.replace(':8080', '') + ':8000';

  const handleCancel = async () => {
    const mkNum = mealResult?.mkNum; 
    const mdayNum = mealResult?.mdayNum;

    if (!mkNum) {
      alert("식단 고유 번호를 찾을 수 없어 취소할 수 없습니다.");
      return;
    }

    if (window.confirm("정말 이 식단 기록을 취소하고 삭제하시겠습니까? 🗑️")) {
      try {
        const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
        // MealController
        await axios.post(`/api/meal/cancel?mkNum=${mkNum}&mdayNum=${mdayNum}`, null, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert("식단 기록이 취소되었습니다. 메인 화면으로 이동합니다.");
        navigate('/'); 
      } catch (error) {
        console.error("식단 취소 실패", error);
        alert("삭제 처리 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    if (!mealResult || !mealResult.kcal || hasCalledAi.current) return;

    const fetchGoalAndAiEvaluation = async () => {
      hasCalledAi.current = true; 

      try {
        const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
        
        const response = await axios.get('/api/information_select', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const goalData = response.data;
        setUserGoal(goalData);

        const safeKcal = goalData?.userDailyKcal || 2000;
        const safeCarbs = goalData?.userDailyCarbs || 300;
        const safeProtein = goalData?.userDailyProtein || 65;
        const safeFat = goalData?.userDailyFat || 55;
        
        const ratio = mealType === '점심' ? 0.4 : 0.3;
        const targetObj = {
          kcal: safeKcal * ratio,
          carbs: safeCarbs * ratio,
          protein: safeProtein * ratio,
          fat: safeFat * ratio
        };

        const currentObj = {
          kcal: mealResult.kcal || 0,
          carbs: mealResult.carbs || 0,
          protein: mealResult.protein || 0,
          fat: mealResult.fat || 0
        };

        // [핵심] 조립된 수치를 들고 자바 백엔드의 AI 평가 API 호출
        const aiResponse = await axios.post(`/api/ai/evaluate`, {

          mealResult: currentObj,
          mealTarget: targetObj,
          mealType: mealType,
          userModel: goalData?.userModel || '2',
          userName: goalData?.userName || '회원'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAiComment(aiResponse.data.aiComment);
      } catch (error) {
        console.error("데이터 로딩 또는 AI 호출 실패", error);
        setAiComment("냥이 영양사가 피곤해서 졸고있다냥! 다음 끼니에 다시 불러달라냥! 😿");
        if(!userGoal) setUserGoal({ userDailyKcal: 2000, userDailyCarbs: 300, userDailyProtein: 65, userDailyFat: 55, userModel: '2' });
      } finally {
        setIsAiLoading(false); 
      }
    };

    fetchGoalAndAiEvaluation();
  }, [mealResult]);

  if (!mealResult) return <div className="loading-box">데이터를 불러오는 중...</div>;

  const safeGoal = {
    userDailyKcal: userGoal?.userDailyKcal || 2000,
    userDailyCarbs: userGoal?.userDailyCarbs || 300,
    userDailyProtein: userGoal?.userDailyProtein || 65,
    userDailyFat: userGoal?.userDailyFat || 55,
    userModel: userGoal?.userModel || '2'
  };

  const ratio = mealType === '점심' ? 0.4 : 0.3;
  const mealTarget = {
    kcal: safeGoal.userDailyKcal * ratio,
    carbs: safeGoal.userDailyCarbs * ratio,
    protein: safeGoal.userDailyProtein * ratio,
    fat: safeGoal.userDailyFat * ratio,
  };

  const nutrientList = [
    { name: '에너지', val: mealResult.kcal || 0, goal: mealTarget.kcal, unit: 'kcal' },
    { name: '탄수화물', val: mealResult.carbs, goal: mealTarget.carbs, unit: 'g' },
    { name: '단백질', val: mealResult.protein, goal: mealTarget.protein, unit: 'g' },
    { name: '지방', val: mealResult.fat, goal: mealTarget.fat, unit: 'g' },
  ];

  return (
    <div className="evaluation-container">
      <h2>📊 {mealType} 식단 평가 리포트</h2>
      <p>설정하신 <b>{safeGoal.userModel === '1' ? '다이어트' : '일반'}</b> 목표 대비 섭취량입니다.</p>

      {nutrientList.map((item) => {
        const percent = item.goal > 0 ? Math.min((item.val / item.goal) * 100, 100) : 0;
        const isOver = item.val > item.goal;
        
        return (
          <div key={item.name} className="nutrient-item">
            <div className="nutrient-info">
              <span className="nutrient-name">{item.name}</span>
              <span className={isOver ? 'status-over' : 'status-good'}>
                {Number(item.val).toFixed(1)} / {Math.round(item.goal)}{item.unit}
              </span>
            </div>
            {/* 프로그레스 바 */}
            <div className="progress-bar-bg">
              <div 
                className={`progress-bar-fill ${isOver ? 'over' : 'good'}`}
                style={{ width: `${percent}%` }} 
              />
            </div>
          </div>
        );
      })}

      {/* 냥이 영양사 AI 평가 뷰어 컴포넌트 구역 */}
      <div className="ai-comment-box">
        <div className="ai-header">
          <span>🐱</span>
          <h4>AI 냥이 영양사의 실시간 한줄평</h4>
          {isAiLoading && <span className="spinner-icon">🔄</span>}
        </div>
        <p className="ai-text">{aiComment}</p>
      </div>

      {/* 하단 버튼 기능 */}
      <div className="button-group">
        <button className="btn-save" onClick={() => navigate('/')}>
          기록 저장 (확인)
        </button>
        <button className="btn-cancel" onClick={handleCancel}>
          기록 취소 (DB 삭제)
        </button>
      </div>
    </div>
  );
};

export default Evaluation;
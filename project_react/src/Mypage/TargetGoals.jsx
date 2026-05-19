import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css';

const TargetGoals = () => {
  const [todayTotal, setTodayTotal] = useState({ totalKcal: 0, totalCarbs: 0, totalProtein: 0, totalFat: 0, totalNatrium: 0 });
  const [userGoal, setUserGoal] = useState({ userDailyKcal: 0, userDailyCarbs: 0, userDailyProtein: 0, userDailyFat: 0 });
  const [loading, setLoading] = useState(true);

  //애니메이션을 위한 별도의 퍼센트 상태
  const [aniPercent, setAniPercent] = useState({ kcal: 0, carbs: 0, protein: 0, fat: 0 });
  const hasAlerted = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userNum = user.user_num; 
        const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');

        if (!userNum) return;

        const [nutritionRes, goalRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/meal/today-nutrition?userNum=${userNum}`),
          axios.get(`http://localhost:8080/api/information_select`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const goals = goalRes.data;
        if (!goals || goals.userDailyKcal === 0 || !goals.userDailyKcal) {
          if (!hasAlerted.current) {
            alert("개인정보에 키, 몸무게, 목표 몸무게, 나이, 활동량을 입력해야 목표치를 보여줄 수 있어요! 정보 입력 페이지로 이동합니다. 🏃‍♂️");
            hasAlerted.current = true;
            navigate('/information');
          }
          return;
        }

        setTodayTotal(nutritionRes.data);
        setUserGoal(goalRes.data);
        setLoading(false);

        //데이터를 다 받은 후, 0.1초 뒤에 바가 차오르도록 설정
        setTimeout(() => {
          setAniPercent({
            kcal: getCalc(nutritionRes.data.totalKcal, goalRes.data.userDailyKcal),
            carbs: getCalc(nutritionRes.data.totalCarbs, goalRes.data.userDailyCarbs),
            protein: getCalc(nutritionRes.data.totalProtein, goalRes.data.userDailyProtein),
            fat: getCalc(nutritionRes.data.totalFat, goalRes.data.userDailyFat)
          });
        }, 100);
      } catch (error) {
        console.error("데이터 로딩 실패", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // 퍼센트 계산용 헬퍼 함수
  const getCalc = (cur, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min(Math.round((cur / goal) * 100), 100);
  };

  //목표 초과 시 색상을 결정하는 함수
  const getSafeColor = (cur, goal, baseColor) => {
    return cur > goal ? '#ff5252' : baseColor; // 초과하면 빨간색, 아니면 기본색
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>데이터를 불러오는 중...</div>;

  return (
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '40px', borderRadius: '30px', 
          width: '85%', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          minHeight: '800px', overflowY: 'auto'
        }}>
          <h2 style={{ color: '#5d4037', marginBottom: '30px', textAlign: 'left' }}>
            오늘의 목표 달성도 🎯 {todayTotal.totalKcal > userGoal.userDailyKcal && <span style={{fontSize:'16px', color:'#ff5252'}}>⚠️ 목표 초과 주의!</span>}
          </h2>

          {/* 메인 칼로리 바 */}
          <div style={{ marginBottom: '40px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>에너지 (kcal)</span>
              <span style={{ color: getSafeColor(todayTotal.totalKcal, userGoal.userDailyKcal, '#c6465d'), fontWeight: 'bold' }}>
                {Math.round((todayTotal.totalKcal / userGoal.userDailyKcal) * 100)}%
              </span>
            </div>
            <div style={{ width: '100%', height: '25px', backgroundColor: '#eee', borderRadius: '15px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${aniPercent.kcal}%`, // 🌟 aniPercent 사용
                height: '100%', 
                backgroundColor: getSafeColor(todayTotal.totalKcal, userGoal.userDailyKcal, '#ff8a80'), 
                borderRadius: '15px',
                transition: 'width 1.5s cubic-bezier(0.1, 0.5, 0.1, 1)' // 🌟 경험치 바 느낌의 애니메이션
              }}></div>
            </div>
            <p style={{ textAlign: 'right', marginTop: '5px', fontSize: '14px', color: todayTotal.totalKcal > userGoal.userDailyKcal ? '#ff5252' : '#666' }}>
              {todayTotal.totalKcal} / {userGoal.userDailyKcal} kcal
            </p>
          </div>

          <hr style={{ border: '0.5px solid #eee', marginBottom: '40px' }} />

          {/* 탄단지 상세 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '40px' }}>
            {[
              { label: '탄수화물', val: todayTotal.totalCarbs, goal: userGoal.userDailyCarbs, color: '#ffb74d', key: 'carbs' },
              { label: '단백질', val: todayTotal.totalProtein, goal: userGoal.userDailyProtein, color: '#81c784', key: 'protein' },
              { label: '지방', val: todayTotal.totalFat, goal: userGoal.userDailyFat, color: '#64b5f6', key: 'fat' }
            ].map((item, i) => (
              <div key={i} style={{ 
                backgroundColor: item.val > item.goal ? '#fff1f1' : '#fdf7f5', 
                padding: '20px', borderRadius: '20px', border: item.val > item.goal ? '1px solid #ff5252' : '1px solid #fce4ec', textAlign: 'center'
              }}>
                <span style={{ fontSize: '13px', color: '#888' }}>{item.label}</span>
                <div style={{ fontSize: '20px', fontWeight: 'bold', margin: '8px 0', color: item.val > item.goal ? '#ff5252' : '#000' }}>
                  {Math.round(item.val)}g {item.val > item.goal && '❗'}
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>목표: {item.goal}g</div>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${aniPercent[item.key]}%`, // 🌟 aniPercent 사용
                    height: '100%', 
                    backgroundColor: getSafeColor(item.val, item.goal, item.color),
                    borderRadius: '3px',
                    transition: 'width 1.5s ease-out'
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* 나트륨 알림 박스 */}
          <div style={{ 
            padding: '20px', borderRadius: '20px', 
            backgroundColor: todayTotal.totalNatrium > 2000 ? '#ffebee' : '#e8f5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            border: todayTotal.totalNatrium > 2000 ? '1px solid #ff5252' : 'none'
          }}>
            <div style={{ textAlign: 'left' }}>
              <strong style={{ color: todayTotal.totalNatrium > 2000 ? '#c62828' : '#2e7d32' }}>
                나트륨 {todayTotal.totalNatrium > 2000 ? '과다 섭취 주의!' : '적정량 섭취 중'}
              </strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                현재: {Math.round(todayTotal.totalNatrium)}mg / 권장: 2000mg
              </p>
            </div>
            <span style={{ fontSize: '30px' }}>{todayTotal.totalNatrium > 2000 ? '🧂⚠️' : '🥦✅'}</span>
          </div>
        </div>
  );
};

export default TargetGoals;
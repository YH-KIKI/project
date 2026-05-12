import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css';

const TargetGoals = () => {
  // 1. 상태 관리
  const [todayTotal, setTodayTotal] = useState({
    totalKcal: 0,
    totalCarbs: 0,
    totalProtein: 0,
    totalFat: 0,
    totalNatrium: 0
  });
  
  const [userGoal, setUserGoal] = useState({
    userDailyKcal: 0,
    userDailyCarbs: 0,
    userDailyProtein: 0,
    userDailyFat: 0
  });

  const [loading, setLoading] = useState(true);

  // 2. 데이터 가져오기 (TargetGoals가 마운트될 때 실행)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userNum = user.user_num; // DTO 공사한 카멜케이스 확인!
        const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');

        if (!userNum) {
          console.error("로그인 세션 만료");
          return;
        }

        // 오늘 섭취량과 유저 목표량을 동시에 가져옴
        const [nutritionRes, goalRes] = await Promise.all([
          axios.get(`http://localhost:8080/api/meal/today-nutrition?userNum=${userNum}`),
          axios.get(`http://localhost:8080/api/information_select`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setTodayTotal(nutritionRes.data);
        setUserGoal(goalRes.data);
      } catch (error) {
        console.error("대시보드 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 3. 퍼센트 계산 함수
  const getPercent = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>데이터를 불러오는 중...</div>;

  return (
    <div className="page-background">
      <div className="app-wrapper">
        <Sidebar />
        
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          padding: '40px', 
          borderRadius: '30px', 
          width: '62%', 
          top: '20px', 
          position: 'relative',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          minHeight: '800px',
          overflowY: 'auto'
        }}>
          <h2 style={{ color: '#5d4037', marginBottom: '30px', textAlign: 'left' }}>
            오늘의 목표 달성도 🎯
          </h2>

          {/* 메인 칼로리 바 */}
          <div style={{ marginBottom: '40px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontWeight: 'bold' }}>에너지 (kcal)</span>
              <span style={{ color: '#c6465d', fontWeight: 'bold' }}>
                {getPercent(todayTotal.totalKcal, userGoal.userDailyKcal)}%
              </span>
            </div>
            <div style={{ width: '100%', height: '25px', backgroundColor: '#eee', borderRadius: '15px' }}>
              <div style={{ 
                width: `${getPercent(todayTotal.totalKcal, userGoal.userDailyKcal)}%`, 
                height: '100%', 
                backgroundColor: '#ff8a80', 
                borderRadius: '15px',
                transition: 'width 1s ease-in-out'
              }}></div>
            </div>
            <p style={{ textAlign: 'right', marginTop: '5px', fontSize: '14px', color: '#666' }}>
              {todayTotal.totalKcal} / {userGoal.userDailyKcal} kcal
            </p>
          </div>

          <hr style={{ border: '0.5px solid #eee', marginBottom: '40px' }} />

          {/* 탄단지 상세 그리드 (사용자님 제공 코드 스타일 적용) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '15px',
            marginBottom: '40px'
          }}>
            {[
              { label: '탄수화물', val: todayTotal.totalCarbs, goal: userGoal.userDailyCarbs, color: '#ffb74d' },
              { label: '단백질', val: todayTotal.totalProtein, goal: userGoal.userDailyProtein, color: '#81c784' },
              { label: '지방', val: todayTotal.totalFat, goal: userGoal.userDailyFat, color: '#64b5f6' }
            ].map((item, i) => (
              <div key={i} style={{ 
                backgroundColor: '#fdf7f5', 
                padding: '20px', 
                borderRadius: '20px', 
                border: '1px solid #fce4ec',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '13px', color: '#888' }}>{item.label}</span>
                <div style={{ fontSize: '20px', fontWeight: 'bold', margin: '8px 0' }}>
                  {Math.round(item.val)}g
                </div>
                <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                  목표: {item.goal}g
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: '#eee', borderRadius: '3px' }}>
                  <div style={{ 
                    width: `${getPercent(item.val, item.goal)}%`, 
                    height: '100%', 
                    backgroundColor: item.color,
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>
            ))}
          </div>

          {/* 나트륨 알림 박스 */}
          <div style={{ 
            padding: '20px', 
            borderRadius: '20px', 
            backgroundColor: todayTotal.totalNatrium > 2000 ? '#ffebee' : '#e8f5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
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
      </div>
    </div>
  );
};

export default TargetGoals;
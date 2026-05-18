import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Evaluation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mealResult, mealType } = location.state || {}; // Analyze에서 보낸 '한 끼 합계'

  const [userGoal, setUserGoal] = useState(null); // 하루 목표치 저장

  useEffect(() => {
    const fetchGoal = async () => {
      const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
      // 🌟 알려주신 그 API! 하루 목표치를 가져옵니다.
      const response = await axios.get('http://localhost:8080/api/information_select', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserGoal(response.data);
    };
    fetchGoal();
  }, []);

  if (!userGoal || !mealResult) return <div>로딩 중...</div>;

  // 🍽️ 이번 한 끼에 먹어야 할 권장량 계산 (비율 곱하기)
  const ratio = mealType === '점심' ? 0.4 : 0.3;
  const mealTarget = {
    kcal: userGoal.userDailyKcal * ratio,
    carbs: userGoal.userDailyCarbs * ratio,
    protein: userGoal.userDailyProtein * ratio,
    fat: userGoal.userDailyFat * ratio,
    sodium: 2000 * ratio // 나트륨은 공통 2000mg 기준
  };

  const nutrientList = [
    { name: '에너지', val: mealResult.kcal, goal: mealTarget.kcal, unit: 'kcal' },
    { name: '탄수화물', val: mealResult.carbs, goal: mealTarget.carbs, unit: 'g' },
    { name: '단백질', val: mealResult.protein, goal: mealTarget.protein, unit: 'g' },
    { name: '지방', val: mealResult.fat, goal: mealTarget.fat, unit: 'g' },
  ];

  return (
    <div style={{ padding: '40px', backgroundColor: '#fffcf9', borderRadius: '30px' }}>
      <h2>📊 {mealType} 식단 평가 리포트</h2>
      <p>설정하신 <b>{userGoal.userModel === '1' ? '다이어트' : '일반'}</b> 목표 대비 섭취량입니다.</p>

      {nutrientList.map((item) => {
        const percent = Math.min((item.val / item.goal) * 100, 100);
        return (
          <div key={item.name} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.name}</span>
              <span style={{color: item.val > item.goal ? 'red' : 'green'}}>
                {item.val.toFixed(1)} / {Math.round(item.goal)}{item.unit}
              </span>
            </div>
            {/* 게이지 바는 TargetGoals와 동일하게 구성 */}
            <div style={{ width: '100%', height: '15px', backgroundColor: '#eee', borderRadius: '10px' }}>
              <div style={{ 
                width: `${percent}%`, 
                height: '100%', 
                backgroundColor: item.val > item.goal ? '#ff5252' : '#81c784',
                borderRadius: '10px',
                transition: 'width 1s ease-in-out'
              }} />
            </div>
          </div>
        );
      })}
      <button onClick={() => navigate('/')}>확인 완료</button>
    </div>
  );
};

export default Evaluation;
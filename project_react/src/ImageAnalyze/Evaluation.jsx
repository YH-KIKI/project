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
      try {
        const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
        const response = await axios.get('/api/information_select', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserGoal(response.data);
      } catch (error) {
        console.error("목표치 가져오기 실패, 기본값으로 대체합니다.", error);
        // 에러 방지용 기본 목적치 강제 세팅
        setUserGoal({ userDailyKcal: 2000, userDailyCarbs: 300, userDailyProtein: 65, userDailyFat: 55, userModel: '2' });
      }
    };
    fetchGoal();
  }, []);

  if (!mealResult) return <div style={{ padding: '40px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;

  // 하루 권장량 안전하게 가공 (서버 데이터가 비어있으면 표준 권장량 꽂아버리기)
  const safeGoal = {
    userDailyKcal: userGoal?.userDailyKcal || 2000,
    userDailyCarbs: userGoal?.userDailyCarbs || 300,
    userDailyProtein: userGoal?.userDailyProtein || 65,
    userDailyFat: userGoal?.userDailyFat || 55,
    userModel: userGoal?.userModel || '2'
  };

  // 이번 한 끼에 먹어야 할 권장량 계산 (비율 곱하기)
  const ratio = mealType === '점심' ? 0.4 : 0.3;
  const mealTarget = {
    kcal: safeGoal.userDailyKcal * ratio,
    carbs: safeGoal.userDailyCarbs * ratio,
    protein: safeGoal.userDailyProtein * ratio,
    fat: safeGoal.userDailyFat * ratio,
    sodium: 2000 * ratio
  };

  // 🌟 [중요 보정] 만약 자바가 0.4g 처럼 소수점 쪼그라든 값을 던졌다면 원래 단위로 복구!
  // 음식 영양소가 너무 작은 값이 들어오면 리액트단에서 물리적으로 100을 곱해 복구하는 안전장치입니다.
  const fixNutrient = (val) => {
    if (val > 0 && val < 5) {
      return val * 100; // 0.6g -> 60g 복구 / 0.4g -> 40g 복구
    }
    return val || 0;
  };

  const nutrientList = [
    { name: '에너지', val: mealResult.kcal || 0, goal: mealTarget.kcal, unit: 'kcal' },
    { name: '탄수화물', val: fixNutrient(mealResult.carbs), goal: mealTarget.carbs, unit: 'g' },
    { name: '단백질', val: fixNutrient(mealResult.protein), goal: mealTarget.protein, unit: 'g' },
    { name: '지방', val: fixNutrient(mealResult.fat), goal: mealTarget.fat, unit: 'g' },
  ];

  return (
    <div style={{ padding: '40px', backgroundColor: '#fffcf9', borderRadius: '30px', maxWidth: '600px', margin: '40px auto', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
      <h2>📊 {mealType} 식단 평가 리포트</h2>
      <p>설정하신 <b>{safeGoal.userModel === '1' ? '다이어트' : '일반'}</b> 목표 대비 섭취량입니다.</p>

      {nutrientList.map((item) => {
        const percent = item.goal > 0 ? Math.min((item.val / item.goal) * 100, 100) : 0;
        return (
          <div key={item.name} style={{ marginBottom: '20px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontWeight: 'bold', color: '#555' }}>{item.name}</span>
              <span style={{ color: item.val > item.goal ? '#ff5252' : '#81c784', fontWeight: 'bold' }}>
                {Number(item.val).toFixed(1)} / {Math.round(item.goal)}{item.unit}
              </span>
            </div>
            <div style={{ width: '100%', height: '15px', backgroundColor: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${percent}%`, 
                height: '100%', 
                backgroundColor: item.val > item.goal ? '#ff5252' : '#81c784',
                borderRadius: '10px',
                transition: 'width 1.2s cubic-bezier(0.1, 0.5, 0.1, 1)'
              }} />
            </div>
          </div>
        );
      })}
      <button 
        onClick={() => navigate('/')}
        style={{ marginTop: '30px', padding: '12px 40px', backgroundColor: '#c6465d', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        확인 완료
      </button>
    </div>
  );
};

export default Evaluation;
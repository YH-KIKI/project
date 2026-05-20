import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../Main/MainLayout.css';

const Goal = () => {
  const [todayTotal, setTodayTotal] = useState({ totalKcal: 0, totalCarbs: 0, totalProtein: 0, totalFat: 0, totalNatrium: 0 });
  const [userGoal, setUserGoal] = useState({ userDailyKcal: 0, userDailyCarbs: 0, userDailyProtein: 0, userDailyFat: 0, userModel: '2', userBaseKcal: 2000 });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false); // 저장 버튼 로딩 상태

  // 애니메이션을 위한 별도의 퍼센트 상태
  const [aniPercent, setAniPercent] = useState({ kcal: 0, carbs: 0, protein: 0, fat: 0 });
  const hasAlerted = useRef(false);
  const navigate = useNavigate();

  // [핵심 영양학 공식 상자] 선택한 모드(1,2,3,4)에 따라 기초 칼로리 대비 탄/단/지 중량을 자동으로 가르는 치트키 함수냥!
  const calculateNutrientsByMode = (mode, baseKcal) => {
    let kcal = baseKcal;
    let carbsRatio = 0.5;   // 탄수화물 비율
    let proteinRatio = 0.2; // 단백질 비율
    let fatRatio = 0.3;     // 지방 비율

    switch (mode) {
      case '1': // 다이어트
				// kcal = baseKcal - 500;
        carbsRatio = 0.4; proteinRatio = 0.4; fatRatio = 0.2;
        break;
      case '2': // 건강유지
        carbsRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
        break;
      case '3': // 근육증량
        carbsRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
        break;
      case '4': // 저탄고지
        carbsRatio = 0.1; proteinRatio = 0.2; fatRatio = 0.7;
        break;
      default:
        break;
    }

    // g당 칼로리 계산 (탄수화물/단백질은 4kcal, 지방은 9kcal냥!)
    return {
      userDailyKcal: Math.round(kcal),
      userDailyCarbs: Math.round((kcal * carbsRatio) / 4),
      userDailyProtein: Math.round((kcal * proteinRatio) / 4),
      userDailyFat: Math.round((kcal * fatRatio) / 9),
      userModel: mode,
      userBaseKcal: baseKcal // 원본 기초칼로리 보존냥
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userNum = user.user_num; 
        const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');

        if (!userNum) return;

        const [nutritionRes, goalRes] = await Promise.all([
          axios.get(`/api/meal/today-nutrition?userNum=${userNum}`),
          axios.get(`/api/information_select`, {
            headers: { Authorization: `Bearer ${token}` }
          }        )
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
        
        // 처음 데이터 로드할 때 백엔드에 저장되어 있던 원본 기준 칼로리(userDailyKcal 등)를 세팅해 둡니다.
        setUserGoal({
          ...goals,
          userBaseKcal: goals.userBaseKcal || goals.userDailyKcal // 기초 기준 칼로리가 없으면 현재 수치로 폴백냥
        });
        setLoading(false);

        // 데이터 애니메이션 가동
        setTimeout(() => {
          setAniPercent({
            kcal: getCalc(nutritionRes.data.totalKcal, goals.userDailyKcal),
            carbs: getCalc(nutritionRes.data.totalCarbs, goals.userDailyCarbs),
            protein: getCalc(nutritionRes.data.totalProtein, goals.userDailyProtein),
            fat: getCalc(nutritionRes.data.totalFat, goals.userDailyFat)
          });
        }, 100);
      } catch (error) {
        console.error("데이터 로딩 실패", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // [추가] 사용자가 화면에서 4대 모드 버튼을 클릭할 때 실시간 수치 조립 함수
  const handleModeChange = (mode) => {
    // 원본 기초 칼로리를 바탕으로 새로운 탄단지 비율 수식 계산냥
    const updatedGoal = calculateNutrientsByMode(mode, userGoal.userBaseKcal);
    
    // [초핵심 방어막] 기존 userGoal에 들어있던 유저의 진짜 이름(userName), 이메일, 키, 몸무게 정보를
    // 통째로 유지(...userGoal)하면서, 바뀐 탄단지 수치(updatedGoal)만 덮어씁니다!
    setUserGoal({
      ...userGoal,       // 기존의 이름, 이메일, 성별, 키, 몸무게 등 원본 데이터
      ...updatedGoal,    // 새로 계산된 userModel, kcal, carbs, protein, fat만
    });

    // 게이지 바 퍼센트 실시간 리프레시 동기화냥!
    setAniPercent({
      kcal: getCalc(todayTotal.totalKcal, updatedGoal.userDailyKcal),
      carbs: getCalc(todayTotal.totalCarbs, updatedGoal.userDailyCarbs),
      protein: getCalc(todayTotal.totalProtein, updatedGoal.userDailyProtein),
      fat: getCalc(todayTotal.totalFat, updatedGoal.userDailyFat)
    });
  };

  // [추가] 바뀐 최종 모드 스펙을 자바 백엔드 DB에 업데이트하는 전송 함수냥!
  const handleSaveGoal = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
      
      // 1. 로컬 스토리지에서 지금 로그인한 유저 정보 가져오기
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userNum = user.user_num;

      if (!userNum) {
        alert("로그인 정보가 유실되었습니다. 다시 로그인 해주세요!");
        return;
      }

			// 만약 favoriteFoods나 dislikeFoods가 객체 배열 형태로 들어있다면, 
      // 자바 DTO 스펙(List<Integer>)에 맞게 오직 foNum(숫자)만 추출해서 새로 매핑합니다냥!
      const formattedFavorite = Array.isArray(userGoal.favoriteFoods) 
        ? userGoal.favoriteFoods.map(f => typeof f === 'object' ? f.foNum : f)
        : [];

      const formattedDislike = Array.isArray(userGoal.dislikeFoods) 
        ? userGoal.dislikeFoods.map(f => typeof f === 'object' ? f.foNum : f)
        : [];

      // 2. ⚠️ 중요: 기존 userGoal 정보 전체(...userGoal)를 그대로 복사하고,
      // 진짜 userNum을 수동으로 딱 꽂아서 백엔드가 뻗지 않게 조립합니다냥!
      const sendData = {
        ...userGoal,
        userNum: userNum, // 백엔드 UserPrivacyDTO의 userNum 필드명과 완벽 매칭!
				favoriteFoods: formattedFavorite, // ⭕ 숫자로만 이루어진 깔끔한 배열 완성냥!
        dislikeFoods: formattedDislike
      };

      console.log("📤 자바로 날아갈 최종 데이터 상자 확인냥:", sendData);

      // 3. 든든하게 조립된 sendData를 자바로 전송!
      await axios.post('/api/information_updata', sendData, {
        headers: { Authorization: `Bearer ${token}` }			
      });
      alert("🎯 목표 관리 모드가 성공적으로 변경되어 저장되었습니다냥!");
    } catch (error) {
      console.error("목표 업데이트 실패", error);
      alert("목표 변경 저장 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 퍼센트 계산용 헬퍼 함수
  const getCalc = (cur, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min(Math.round((cur / goal) * 100), 100);
  };

  // 목표 초과 시 색상을 결정하는 함수
  const getSafeColor = (cur, goal, baseColor) => {
    return cur > goal ? '#ff5252' : baseColor; 
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>데이터를 불러오는 중...</div>;

  return (
    <div style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '40px', borderRadius: '30px', 
      width: '85%', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      minHeight: '800px', overflowY: 'auto'
    }}>
      <h2 style={{ color: '#5d4037', marginBottom: '10px', textAlign: 'left' }}>
        목표관리 🎯 {todayTotal.totalKcal > userGoal.userDailyKcal && <span style={{fontSize:'16px', color:'#ff5252'}}>⚠️ 목표 초과 주의!</span>}
      </h2>

      {/* 🌟 [새 기능] 상단 4모드 자유 전환 컨트롤러 대시보드 뷰 구역 */}
      <div style={{ backgroundColor: '#fdf7f5', padding: '20px', borderRadius: '20px', marginBottom: '35px', textAlign: 'left', border: '1px solid #fce4ec' }}>
        <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', color: '#5d4037' }}>⚙️ 목표 관리 모드 자유 선택</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
          {[
            { id: '1', name: '🏃‍♂️ 다이어트' },
            { id: '2', name: '🥗 건강유지' },
            { id: '3', name: '💪 근육증량' },
            { id: '4', name: '🥩 저탄고지' }
          ].map((mode) => {
            const isSelected = userGoal.userModel === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                style={{
                  padding: '10px 22px',
                  borderRadius: '15px',
                  border: isSelected ? '2px solid #c6465d' : '1px solid #ddd',
                  backgroundColor: isSelected ? '#c6465d' : '#fff',
                  color: isSelected ? 'white' : '#555',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {mode.name}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>💡 모드를 누르면 아래 게이지바가 실시간 기준치에 맞게 자동 조정됩니다냥!</span>
          <button
            onClick={handleSaveGoal}
            disabled={isUpdating}
            style={{
              padding: '8px 20px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isUpdating ? "저장 중..." : "🔄 변경사항 저장하기"}
          </button>
        </div>
      </div>

      {/* 메인 칼로리 바 */}
      <div style={{ marginBottom: '40px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontWeight: 'bold' }}>에너지 (kcal)</span>
          <span style={{ color: getSafeColor(todayTotal.totalKcal, userGoal.userDailyKcal, '#c6465d'), fontWeight: 'bold' }}>
            {userGoal.userDailyKcal > 0 ? Math.round((todayTotal.totalKcal / userGoal.userDailyKcal) * 100) : 0}%
          </span>
        </div>
        <div style={{ width: '100%', height: '25px', backgroundColor: '#eee', borderRadius: '15px', overflow: 'hidden' }}>
          <div style={{ 
            width: `${aniPercent.kcal}%`, 
            height: '100%', 
            backgroundColor: getSafeColor(todayTotal.totalKcal, userGoal.userDailyKcal, '#ff8a80'), 
            borderRadius: '15px',
            transition: 'width 1.5s cubic-bezier(0.1, 0.5, 0.1, 1)' 
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
                width: `${aniPercent[item.key]}%`, 
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

export default Goal;
// import React, { useState, useEffect, useRef } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const Evaluation = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { mealResult, mealType } = location.state || {}; // Analyze에서 보낸 '한 끼 합계'

//   const [userGoal, setUserGoal] = useState(null); // 하루 목표치 저장
  

//   const [aiComment, setAiComment] = useState('냥이 영양사가 식단을 분석중이다냥... 🐾');
//   const [isAiLoading, setIsAiLoading] = useState(true);

//   // 페이지가 몇 번을 재렌더링되어도 절대 변하지 않는 물리적 잠금장치 상자냥!
//   const hasCalledAi = useRef(false);

//   const handleCancel = async () => {
//     const mkNum = mealResult?.mkNum; 
//     const mdayNum = mealResult?.mdayNum;

//     if (!mkNum) {
//       alert("식단 고유 번호를 찾을 수 없어 취소할 수 없습니다.");
//       return;
//     }

//     if (window.confirm("정말 이 식단 기록을 취소하고 삭제하시겠습니까? 🗑️")) {
//       try {
//         const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');

//         await axios.post(`/api/meal/cancel?mkNum=${mkNum}&mdayNum=${mdayNum}`, null, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         alert("식단 기록이 취소되었습니다. 메인 화면으로 이동합니다.");
//         navigate('/'); 
//       } catch (error) {
//         console.error("식단 취소 실패", error);
//         alert("삭제 처리 중 오류가 발생했습니다.");
//       }
//     }
//   };

//   useEffect(() => {
//     // 데이터가 비어있거나, 이미 AI 요청을 한 번 '시작'했다면 즉시 차단
//     if (!mealResult || !mealResult.kcal || hasCalledAi.current) return;

//     const fetchGoalAndAiEvaluation = async () => {
//       // 진입하자마자 중복 호출 차단
//       hasCalledAi.current = true; 

//       try {
//         const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
        
//         // 유저 목표치 먼저 가져오기
//         const response = await axios.get('/api/information_select', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const goalData = response.data;
//         setUserGoal(goalData);

//         // 가져온 목표치 기반으로 한 끼 목표 수식 계산
//         const safeKcal = goalData?.userDailyKcal || 2000;
//         const safeCarbs = goalData?.userDailyCarbs || 300;
//         const safeProtein = goalData?.userDailyProtein || 65;
//         const safeFat = goalData?.userDailyFat || 55;
        
//         const ratio = mealType === '점심' ? 0.4 : 0.3;
//         const targetObj = {
//           kcal: safeKcal * ratio,
//           carbs: safeCarbs * ratio,
//           protein: safeProtein * ratio,
//           fat: safeFat * ratio
//         };

//         const currentObj = {
//           kcal: mealResult.kcal || 0,
//           carbs: mealResult.carbs || 0,
//           protein: mealResult.protein || 0,
//           fat: mealResult.fat || 0
//         };

//         // [핵심] 조립된 수치를 들고 자바 백엔드의 AI 평가 API 호출
//         const aiResponse = await axios.post('/api/ai/evaluate', {
//           mealResult: currentObj,
//           mealTarget: targetObj,
//           mealType: mealType,
//           userModel: goalData?.userModel || '2',
//           userName: goalData?.userName || '회원'
//         }, {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         // 성공한 피드백 문장을 딱 한 번만 안전하게 저장냥!
//         setAiComment(aiResponse.data.aiComment);
//       } catch (error) {
//         console.error("데이터 로딩 또는 AI 호출 실패", error);
//         setAiComment("냥이 영양사가 피곤해서 졸고있다냥! 다음 끼니에 다시 불러달라냥! 😿");
//         if(!userGoal) setUserGoal({ userDailyKcal: 2000, userDailyCarbs: 300, userDailyProtein: 65, userDailyFat: 55, userModel: '2' });
//       } finally {
//         setIsAiLoading(false); // 통신이 끝나면 로딩 마크 끄기냥!
//       }
//     };

//     fetchGoalAndAiEvaluation();
//   }, [mealResult]);

//   if (!mealResult) return <div style={{ padding: '40px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;

//   const safeGoal = {
//     userDailyKcal: userGoal?.userDailyKcal || 2000,
//     userDailyCarbs: userGoal?.userDailyCarbs || 300,
//     userDailyProtein: userGoal?.userDailyProtein || 65,
//     userDailyFat: userGoal?.userDailyFat || 55,
//     userModel: userGoal?.userModel || '2'
//   };

//   const ratio = mealType === '점심' ? 0.4 : 0.3;
//   const mealTarget = {
//     kcal: safeGoal.userDailyKcal * ratio,
//     carbs: safeGoal.userDailyCarbs * ratio,
//     protein: safeGoal.userDailyProtein * ratio,
//     fat: safeGoal.userDailyFat * ratio,
//   };

//   const nutrientList = [
//     { name: '에너지', val: mealResult.kcal || 0, goal: mealTarget.kcal, unit: 'kcal' },
//     { name: '탄수화물', val: mealResult.carbs, goal: mealTarget.carbs, unit: 'g' },
//     { name: '단백질', val: mealResult.protein, goal: mealTarget.protein, unit: 'g' },
//     { name: '지방', val: mealResult.fat, goal: mealTarget.fat, unit: 'g' },
//   ];

//   return (
//     <div style={{ padding: '40px', backgroundColor: '#fffcf9', borderRadius: '30px', maxWidth: '600px', margin: '40px auto', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
//       <h2>📊 {mealType} 식단 평가 리포트</h2>
//       <p>설정하신 <b>{safeGoal.userModel === '1' ? '다이어트' : '일반'}</b> 목표 대비 섭취량입니다.</p>

//       {nutrientList.map((item) => {
//         const percent = item.goal > 0 ? Math.min((item.val / item.goal) * 100, 100) : 0;
//         return (
//           <div key={item.name} style={{ marginBottom: '20px', textAlign: 'left' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//               <span style={{ fontWeight: 'bold', color: '#555' }}>{item.name}</span>
//               <span style={{ color: item.val > item.goal ? '#ff5252' : '#81c784', fontWeight: 'bold' }}>
//                 {Number(item.val).toFixed(1)} / {Math.round(item.goal)}{item.unit}
//               </span>
//             </div>
//             <div style={{ width: '100%', height: '15px', backgroundColor: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
//               <div style={{ 
//                 width: `${percent}%`, 
//                 height: '100%', 
//                 backgroundColor: item.val > item.goal ? '#ff5252' : '#81c784',
//                 borderRadius: '10px',
//                 transition: 'width 1.2s cubic-bezier(0.1, 0.5, 0.1, 1)'
//               }} />
//             </div>
//           </div>
//         );
//       })}

//       {/* 냥이 영양사 AI 평가 뷰어 컴포넌트 구역 */}
//       <div style={{ marginTop: '35px', padding: '20px', backgroundColor: '#fff3e0', borderRadius: '20px', border: '1px solid #ffe0b2', textAlign: 'left', position: 'relative' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
//           <span style={{ fontSize: '28px' }}>🐱</span>
//           <h4 style={{ margin: 0, color: '#e65100' }}>AI 냥이 영양사의 실시간 한줄평</h4>
//           {isAiLoading && <span style={{ fontSize: '12px', color: '#ff9800', animation: 'spin 1s linear infinite' }}>🔄</span>}
//         </div>
//         <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: '#5d4037', fontWeight: '500', whiteSpace: 'pre-wrap' }}>
//           {aiComment}
//         </p>
//       </div>

//       <div style={{ display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'center' }}>
//         <button onClick={() => navigate('/')} style={{ padding: '12px 40px', backgroundColor: '#81c784', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
//           기록 저장 (확인)
//         </button>
//         <button onClick={handleCancel} style={{ padding: '12px 40px', backgroundColor: '#ff5252', color: 'white', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold' }}>
//           기록 취소 (DB 삭제)
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Evaluation;

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

        const aiResponse = await axios.post('/api/ai/evaluate', {
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
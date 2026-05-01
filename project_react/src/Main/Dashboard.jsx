import React, { useState } from 'react';
import axios from 'axios';
import GreetingBanner from './GreetingBanner'; 
import robotFeedbackImg from '../images/로봇2.png'; 

const Dashboard = () => {
  // --- 파이썬 API 통신을 위한 상태 관리 ---
  const [message, setMessage] = useState(''); 
  const [file, setFile] = useState(null); 
  const [str, setStr] = useState(''); 

  const handleFileChange = (event) => {
      setFile(event.target.files[0]); 
  };

  const sendData = async () => {
      try {
          if (!file || !message) {
              alert("메시지와 파일을 모두 입력해주세요.");
              return;
          }
          const formData = new FormData();
          formData.append('message', message);
          formData.append('file', file);

          console.log("1. [React] 스프링부트로 보낼 준비 완료 👇");
          
          const response = await axios.post('http://localhost:8080/api/v1/ai/api/detect/proxy', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          console.log("6. [React] 스프링부트로부터 최종 결과 수신 👇");
          setStr(JSON.stringify(response.data, null, 2)); 

      } catch (error) {
          console.error("에러 발생:", error);
          if (error.response) setStr(`서버 에러: ${error.response.status}`);
          else if (error.request) setStr("서버에 연결할 수 없습니다.");
          else setStr("요청 전송 중 에러가 발생했습니다.");
      }
  };

  return (
    <>
      <GreetingBanner userName="냠냠이" />
      
      {/* 1. 상단 데이터 요약 카드 그리드 */}
      <div className="summary-cards-container">
        <div className="border-card summary-card">
          <span className="card-title">에너지 섭취</span>
          <h3 className="card-value">1,350 <small>kcal</small></h3>
          <span className="card-sub">목표 1,600 kcal</span>
        </div>
        <div className="border-card summary-card">
          <span className="card-title">영양 밸런스</span>
          <h3 className="card-value text-green">Good!</h3>
          <span className="card-sub">균형 잡힌 식단이에요!</span>
        </div>
        <div className="border-card summary-card">
          <span className="card-title">오늘의 점수</span>
          <h3 className="card-value">85 <small>점</small></h3>
          <span className="card-sub">최고예요! 🥳</span>
        </div>
      </div>

      {/* 2. 오늘의 식단 기록 */}
      <div className="section-header">
        <h2 className="section-title">오늘의 식단 기록</h2>
        <span className="section-more">더보기 &gt;</span>
      </div>

      <div className="meal-records-container">
        <div className="border-card meal-card">
          <div className="meal-header"><span>☀️</span> 아침</div>
          <div className="meal-image-placeholder"></div>
          <p className="meal-desc">그릭요거트, 바나나, 아몬드, 삶은달걀</p>
          <p className="meal-kcal">320 kcal</p>
        </div>
        <div className="border-card meal-card">
          <div className="meal-header"><span>☀️</span> 점심</div>
          <div className="meal-image-placeholder"></div>
          <p className="meal-desc">현미밥, 닭가슴살, 샐러드, 김치</p>
          <p className="meal-kcal">560 kcal</p>
        </div>
        <div className="border-card meal-card">
          <div className="meal-header"><span>🌙</span> 저녁</div>
          <div className="meal-image-placeholder"></div>
          <p className="meal-desc">두부김치, 잡곡밥, 나물무침</p>
          <p className="meal-kcal">470 kcal</p>
        </div>
        <div className="border-card add-meal-card">
          <div className="add-icon">+</div>
          <p>식단 기록<br/>추가하기</p>
        </div>
      </div>

      {/* 3. 주요 기능 빠르게 */}
      <div className="section-header">
        <h2 className="section-title">주요 기능 빠르게</h2>
      </div>

      <div className="quick-features-container">
        <div className="border-card feature-item">
          <div className="feature-icon bg-blue">🩵</div>
          <div className="feature-text">
            <p className="feature-title">컨디션 로그</p>
            <p className="feature-desc">오늘의 기분 기록</p>
          </div>
        </div>
        <div className="border-card feature-item">
          <div className="feature-icon bg-orange">⭐️</div>
          <div className="feature-text">
            <p className="feature-title">즐겨찾기</p>
            <p className="feature-desc">좋아하는 식단</p>
          </div>
        </div>
        <div className="border-card feature-item">
          <div className="feature-icon bg-yellow">🏅</div>
          <div className="feature-text">
            <p className="feature-title">배지 도감</p>
            <p className="feature-desc">획득한 배지 보기</p>
          </div>
        </div>
        <div className="border-card feature-item">
          <div className="feature-icon bg-lightblue">🎯</div>
          <div className="feature-text">
            <p className="feature-title">AI 식단 추천</p>
            <p className="feature-desc">맞춤 식단 받기</p>
          </div>
        </div>
        <div className="border-card feature-item">
          <div className="feature-icon bg-purple">📷</div>
          <div className="feature-text">
            <p className="feature-title">사진 인식</p>
            <p className="feature-desc">음식 분석하기</p>
          </div>
        </div>
      </div>

      {/* 4. AI 한마디 피드백 */}
      <div className="border-card ai-feedback-container">
        <div className="ai-icon-wrapper">
          <img src={robotFeedbackImg} alt="AI 챗봇" style={{ width: '100%', height: '100%' }}/>
        </div>
        <div className="ai-text-content">
          <p className="ai-title">AI 한마디</p>
          <p className="ai-message">
            <strong>오늘 단백질 섭취가 좋아요! 💪</strong><br/>
            내일은 채소를 조금 더 추가해보는 건 어떨까요? 🥦
          </p>
        </div>
      </div>

      {/* 5. API 연동 테스트 UI (가장 하단에 배치) */}
      <div className="border-card" style={{ marginTop: '20px', padding: '20px' }}>
        <h3 style={{ marginTop: 0 }}>🛠️ 파이썬 API 연동 테스트</h3>
        <div style={{ marginBottom: '10px' }}>
            <label>메시지: </label>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="파이썬으로 보낼 메시지" style={{ padding: '5px' }}/>
        </div>
        <div style={{ marginBottom: '10px' }}>
            <label>파일: </label>
            <input type="file" onChange={handleFileChange} />
        </div>
        <button onClick={sendData} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#ff8fa3', color: 'white', border: 'none', borderRadius: '5px' }}>
            서버로 전송하기
        </button>
        {str && <pre style={{ marginTop: '15px', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>✅ 결과: {str}</pre>}
      </div>
    </>
  );
};

export default Dashboard;
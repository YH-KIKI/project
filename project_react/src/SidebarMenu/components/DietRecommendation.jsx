import React, { useState, useEffect } from 'react';
import './DietRecommendation.css'; 
import { fetchAiRecommendations, testUploadImage } from '../api/dietApi'; 

const DietRecommendation = () => {
  const [activeTab, setActiveTab] = useState('맞춤 식단'); 
  const [recommendations, setRecommendations] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  
  // 테스트용 파일 업로드 상태 관리
  const [selectedFile, setSelectedFile] = useState(null);

  const tabs = ['맞춤 식단', '다이어트', '건강유지', '근육증가', '저탄고지'];

  const getTodayString = () => {
    const today = new Date(); 
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = week[today.getDay()];
    return `${year}.${month}.${day} ${dayOfWeek}`; 
  };

  const currentDate = getTodayString();

  useEffect(() => {
    const loadDietData = async () => {
      setIsLoading(true); 
      setError(null);
      setRecommendations([]); 
      try {
        const data = await fetchAiRecommendations(activeTab); 
        setRecommendations(data); 
      } catch (err) {
        setError("데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoading(false); 
      }
    };
    loadDietData();
  }, [activeTab]); 

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleTestUploadClick = async () => {
    if (!selectedFile) {
      alert("먼저 사진 파일을 선택해주세요!");
      return;
    }
    await testUploadImage(selectedFile);
  };

  const handleRecordDiet = () => {
    const diet = recommendations[0];
    if (!diet) return;

    // 팀원이 사용할 데이터 구조 포장
    const payload = {
      userNum: 1,
      menuName: diet.menu,
      kcal: diet.kcal,
      carbs: diet.carbs,
      protein: diet.protein,
      fat: diet.fat,
      sodium: diet.sodium
    };
    
    console.log("🔥 [기록하기] 전달될 데이터:", payload);
    alert(`[${diet.menu}] 기록 준비 완료! 콘솔을 확인하세요.`);
  };

  return (
    <div className="recommendation-container">
      <div className="header-area">
        <h2 className="title">AI 식단 추천</h2>
        <span className="date">{"<"} {currentDate}</span>
      </div>

      <div className="recommendation-card">
        <div className="tab-menu">
          {tabs.map((tabName) => (
            <button 
              key={tabName} 
              className={`tab-button ${activeTab === tabName ? 'active' : ''}`}
              onClick={() => setActiveTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>

        <div className="diet-list">
          {isLoading ? (
            <div className="loading-state">
              <span className="spinner">✨</span>
              <p>최적의 맞춤 식단을 계산 중이에요!</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
            </div>
          ) : (
            recommendations.map((item) => (
              <div className="diet-card" key={item.id}>
                <div className="diet-info">
                  <h3 className="menu-title">{item.menu}</h3>
                  <p className="menu-kcal">예상 칼로리: {item.kcal} kcal</p>
                  <div className="menu-macros">
                    <span>탄 {item.carbs || 0}g</span> | 
                    <span> 단 {item.protein || 0}g</span> | 
                    <span> 지 {item.fat || 0}g</span> | 
                    <span className="sodium"> 나트륨 {item.sodium || 0}mg</span>
                  </div>
                  {item.tags && (
                    <div className="menu-tags">
                      {item.tags.map(tag => (
                        <span key={tag} className="tag-badge">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="diet-image-box">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.menu} className="diet-img" />
                  ) : (
                    <div className="no-img-placeholder">🍽️</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          className="record-button" 
          disabled={isLoading || recommendations.length === 0}
          onClick={handleRecordDiet}
        >
          이 식단으로 기록하기
        </button>

        <div style={{
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#fff', 
          borderRadius: '12px', 
          border: '1px dashed #ff8fa3',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <h4 style={{ margin: 0, color: '#ff6b8b', fontSize: '14px' }}>🧪 파이썬 사진 전송 테스트</h4>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange}
            style={{ fontSize: '13px' }}
          />
          <button 
            onClick={handleTestUploadClick}
            style={{
              padding: '8px',
              backgroundColor: selectedFile ? '#ff8fa3' : '#eee',
              color: selectedFile ? 'white' : '#888',
              border: 'none',
              borderRadius: '8px',
              cursor: selectedFile ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            로로(파이썬)에게 사진 보내기! 🚀
          </button>
        </div>

      </div>
    </div>
  );
};

export default DietRecommendation;
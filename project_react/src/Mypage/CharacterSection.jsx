import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CharacterSection.css';

const CharacterSection = ({ charInfo, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // [수정] 서버 데이터와 별개로 현재 선택된 캐릭터 타입을 관리하는 로컬 state 추가
  const [localType, setLocalType] = useState(null);

  // 부모로부터 charInfo가 새로 오면 로컬 상태 동기화
  useEffect(() => {
    if (charInfo && charInfo.chType) {
      setLocalType(charInfo.chType);
    }
  }, [charInfo]);

  if (!charInfo) {
    return (
      <section className="char-section">
        <p style={{ color: '#888' }}>캐릭터 정보를 불러오는 중입니다...</p>
      </section>
    );
  }

  const getLevelTitle = (level) => {
    if (level >= 91) return "👑 다이어트 신";
    if (level >= 61) return "🏋️ 건강 마스터";
    if (level >= 31) return "🍎 프로 식단러";
    if (level >= 11) return "🌱 쑥쑥 자라요";
    return "🐣 식단 병아리"; 
  };

  // [수정] localType을 기반으로 이름과 이미지를 결정 (서버 응답 지연 해결)
  const getCharNameByType = (type) => {
    const typeNum = Number(type);
    if (typeNum === 1) return "냠냠이";
    if (typeNum === 2) return "로로";
    if (typeNum === 3) return "탄탄이";
    if (typeNum === 4) return "꿈꿈이";
    return "냠냠이";
  };

  const getCharImgByType = (type) => {
    const typeNum = Number(type);
    let fileName = "nyam_lv1.png";
    if (typeNum === 2) fileName = "roro_lv1.png";
    else if (typeNum === 3) fileName = "tan_lv1.png";
    else if (typeNum === 4) fileName = "kku_lv1.png";
    return `/images/characters/${fileName}?t=${new Date().getTime()}`;
  };

  const currentName = getCharNameByType(localType || charInfo.chType);
  const levelTitle = getLevelTitle(charInfo.chLevel);
  const expPercentage = (charInfo.chExp / charInfo.nextLevelExp) * 100;

  const changeCharacter = async (typeNum) => {
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    
    try {
      const response = await axios.post(`http://localhost:8080/api/character/update`, 
        { userNum: charInfo.userNum, type: typeNum },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status === 200) {
        // [수정] 서버에서 데이터를 다시 가져오기 전에 로컬에서 먼저 이미지를 바꿔버림
        setLocalType(typeNum); 
        alert("캐릭터가 변경되었습니다!");
        setIsModalOpen(false);
        
        if (onUpdate) onUpdate(); 
      }
    } catch (error) {
      console.error("캐릭터 변경 실패:", error);
      alert("캐릭터 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="char-section">
      <div style={{ position: 'relative' }}>
        <img 
          src={getCharImgByType(localType || charInfo.chType)} 
          alt={currentName} 
          style={{ width: '120px', marginBottom: '10px' }} 
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = "/images/characters/nyam_lv1.png"; 
          }}
        />
      </div>

      <div style={{ width: '80%', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>LV. {charInfo.chLevel}</span>
          <div className="char-progress-container">
            <div className="char-progress-fill" style={{ width: `${expPercentage}%` }} />
          </div>
        </div>
        <p className="char-status-text">{levelTitle} {currentName}</p>
      </div>

      <button onClick={() => setIsModalOpen(true)} className="char-change-btn">
        캐릭터 변경
      </button>

      {isModalOpen && (
        <div className="char-modal-overlay">
          <div className="char-modal-content">
            <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>캐릭터 설정</h3>
            <div className="char-option-grid">
              <div className="char-option-item" onClick={() => changeCharacter(1)}>
                <img src="/images/characters/nyam_lv1.png" alt="냠냠이" style={{width: '50px'}} />
                <p style={{fontSize: '13px', marginTop: '5px'}}>냠냠이</p>
              </div>
              <div className="char-option-item" onClick={() => changeCharacter(2)}>
                <img src="/images/characters/roro_lv1.png" alt="로로" style={{width: '50px'}} />
                <p style={{fontSize: '13px', marginTop: '5px'}}>로로</p>
              </div>
              <div className="char-option-item" onClick={() => changeCharacter(3)}>
                <img src="/images/characters/tan_lv1.png" alt="탄탄이" style={{width: '50px'}} />
                <p style={{fontSize: '13px', marginTop: '5px'}}>탄탄이</p>
              </div>
              <div className="char-option-item" onClick={() => changeCharacter(4)}>
                <img src="/images/characters/kku_lv1.png" alt="꿈꿈이" style={{width: '50px'}} />
                <p style={{fontSize: '13px', marginTop: '5px'}}>꿈꿈이</p>
              </div>
            </div>
            <button onClick={() => setIsModalOpen(false)} className="char-modal-close-btn">닫기</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CharacterSection;
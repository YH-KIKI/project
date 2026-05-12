import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CharacterSection.css';

const CharacterSection = ({ charInfo, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localType, setLocalType] = useState(null);

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

  // --- [로직 수정] 기획안 기반 레벨별 필요 경험치(Max XP) 반환 ---
  const getRequiredExp = (level) => {
    if (level >= 91) return 1000; // 👑 다이어트 신 구간 (91~98)
    if (level >= 61) return 750;  // 🏋️ 건강 마스터 구간 (61~90)
    if (level >= 31) return 500;  // 🍎 프로 식단러 구간 (31~60)
    if (level >= 11) return 250;  // 🌱 쑥쑥 자라요 구간 (11~30)
    return 100;                   // 🐣 식단 병아리 구간 (1~10)
  };

  const getLevelTitle = (level) => {
    if (level >= 91) return "👑 다이어트 신";
    if (level >= 61) return "🏋️ 건강 마스터";
    if (level >= 31) return "🍎 프로 식단러";
    if (level >= 11) return "🌱 쑥쑥 자라요";
    return "🐣 식단 병아리"; 
  };

  // --- 경험치 계산 ---
  const requiredExp = getRequiredExp(charInfo.chLevel);
  const expPercentage = Math.min((charInfo.chExp / requiredExp) * 100, 100);

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

  const changeCharacter = async (typeNum) => {
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    try {
      const response = await axios.post(`http://localhost:8080/api/character/update`, 
        { userNum: charInfo.userNum, type: typeNum },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
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
            {/* 호버 시 나타날 툴팁 추가 */}
            <div className="char-exp-tooltip">
              ({charInfo.chExp} / {requiredExp} XP)
            </div>
          </div>
        </div>
        <p className="char-status-text">
          {levelTitle} {currentName}
        </p>
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
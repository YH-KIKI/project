import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CharacterSection.css';

const CharacterSection = ({ charInfo, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localType, setLocalType] = useState(null);

  useEffect(() => {
    if (charInfo && charInfo.cgNum) {
      setLocalType(charInfo.cgNum);
    }
  }, [charInfo]);

  if (!charInfo) {
    return (
      <section className="char-section">
        <p style={{ color: '#888' }}>
          캐릭터 정보를 불러오는 중입니다...
        </p>
      </section>
    );
  }

  /**
   * [수정] 경험치 퍼센트 계산 로직
   * 백엔드에서 넘겨준 currentLevelExp(시작점)와 nextLevelExp(목표점)를 사용합니다.
   */
  const calculateExpPercentage = () => {
    const { chExp, currentLevelExp, nextLevelExp } = charInfo;
    
    // 만렙 처리 또는 데이터 미도달 시
    if (!nextLevelExp) return 100;
    
    // 현재 레벨 내에서의 진행도 계산
    const numerator = chExp - currentLevelExp;
    const denominator = nextLevelExp - currentLevelExp;
    
    const percentage = (numerator / denominator) * 100;
    return Math.min(Math.max(percentage, 0), 100); // 0~100 사이 유지
  };

  const expPercentage = calculateExpPercentage();

  /**
   * [수정] 백엔드 DTO에 정의된 cgName과 cgImg를 직접 활용
   */
  const levelTitle = charInfo.cgName; // "식단 병아리" 등 DB 명칭 사용
  const characterImage = `/images/characters/${charInfo.cgImg}?t=${new Date().getTime()}`;

  const changeCharacter = async (typeNum) => {
    const token =
      localStorage.getItem('login_token') ||
      sessionStorage.getItem('login_token');

    try {
      const response = await axios.post(`/api/character/update`, 
        { userNum: charInfo.userNum, type: typeNum },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert("캐릭터가 변경되었습니다!");
        setIsModalOpen(false);
        if (onUpdate) onUpdate(); // 데이터 새로고침 트리거
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
          src={characterImage}
          alt={levelTitle}
          style={{ width: '120px', marginBottom: '10px' }}
        />
      </div>

      <div style={{ width: '80%', marginTop: '10px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '10px',
          marginBottom: '5px'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
            LV. {charInfo.chLevel}
          </span>

          <div className="char-progress-container">
            <div
              className="char-progress-fill"
              style={{ width: `${expPercentage}%` }}
            />

            <div className="char-exp-tooltip">
              {/* 툴팁: 현재 레벨에서 얻은 경험치 / 현재 레벨 목표량 */}
              ({charInfo.chExp - charInfo.currentLevelExp} / {charInfo.nextLevelExp - charInfo.currentLevelExp} XP)
            </div>
          </div>
        </div>

        <p className="char-status-text">
          {levelTitle}
        </p>
      </div>

      <div className="char-button-group">
        <button
          onClick={() => setIsModalOpen(true)}
          className="char-change-btn"
        >
          캐릭터 변경
        </button>
      </div>

      {/* 캐릭터 변경 모달 */}
      {isModalOpen && (
        <div className="char-modal-overlay">
          <div className="char-modal-content">
            <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>
              캐릭터 설정
            </h3>

            <div className="char-option-grid">
              {/* 각 캐릭터의 베이스 번호 (1:냠냠, 7:로로, 13:탄탄, 19:꿈꿈) */}
              {[1, 7, 13, 19].map((type) => (
                <div
                  key={type}
                  className="char-option-item"
                  onClick={() => changeCharacter(type)}
                >
                  <img
                    src={`/images/characters/${type === 1 ? 'nyam' : type === 7 ? 'roro' : type === 13 ? 'tan' : 'kku'}_lv1.png`}
                    alt="char"
                    style={{ width: '50px' }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="char-modal-close-btn"
            >
              닫기
            </button>
          </div>
        </div>
      )}

    </section>
  );
};

export default CharacterSection;
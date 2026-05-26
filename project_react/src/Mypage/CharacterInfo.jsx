import React, { useState } from 'react';
import './CharacterInfo.css';
import CharacterHistory from './CharacterHistory';

// charInfo를 props로 받아 userNum을 하위 컴포넌트에 전달할 수 있게 합니다.
const CharacterInfo = ({ charInfo }) => {
  const [isRewardOpen, setIsRewardOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const characters = [
    { name: '냠냠이', prefix: 'nyam' },
    { name: '로로', prefix: 'roro' },
    { name: '탄탄이', prefix: 'tan' },
    { name: '꿈꿈이', prefix: 'kku' }
  ];

  const rewardData = [
    { type: '일간', a: '50XP', b: '30XP', c: '15XP', d: '5XP' },
    { type: '주간', a: '200XP', b: '100XP', c: '50XP', d: '0XP' },
    { type: '월간', a: '1000XP', b: '500XP', c: '200XP', d: '0XP' }
  ];

  const activityRewardData = [
    { type: '매일 로그인', reward: '5 XP' },
    { type: '3일 연속', reward: '+ 5 XP' },
    { type: '7일 연속', reward: '+ 10 XP' },
    { type: '게시글 작성', reward: '5 XP' }
  ];

  const levelGuideData = [
    { lv: 'Lv. 1 ~ 10', title: '🐣 식단 병아리', xp: '100~200 XP' },
    { lv: 'Lv. 11 ~ 30', title: '🌱 쑥쑥 자라요', xp: '250~450 XP' },
    { lv: 'Lv. 31 ~ 60', title: '🍎 프로 식단러', xp: '500~700 XP' },
    { lv: 'Lv. 61 ~ 90', title: '🏋️ 건강 마스터', xp: '750~900 XP' },
    { lv: 'Lv. 91 ~ 98', title: '👑 다이어트 신', xp: '1000~1300 XP' },
    { lv: 'Lv. 99 (MAX)', title: '🌟 전설', xp: '누적 6만' }
  ];

  return (
    <div className="char-info-abs-layer">
      {/* 1. 보상안내 물음표 버튼 */}
      <button 
        className="help-icon-btn" 
        onClick={() => setIsRewardOpen(true)} 
        title="보상 안내"
        style={{ right: '40px', top: '20px' }}
      >
        ?
      </button>

      {/* 2. 도감 및 히스토리 버튼 영역 */}
      <div className="preview-trigger-area" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button className="open-preview-modal-btn" onClick={() => setIsPreviewOpen(true)}>
          ✨ 캐릭터 성장 도감 보기
        </button>
        <button className="open-preview-modal-btn" onClick={() => setIsHistoryOpen(true)}>
          📜 성장 히스토리
        </button>
      </div>

      {/* [모달 1] 보상 안내 가이드 */}
      {isRewardOpen && (
        <div className="char-modal-overlay" onClick={() => setIsRewardOpen(false)}>
          <div className="char-modal-content reward-modal-width" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="char-modal-header">
              <h3>📊 경험치 획득 가이드</h3>
              <button className="char-close-x" onClick={() => setIsRewardOpen(false)}>&times;</button>
            </div>
            <div className="char-modal-body">
              <div className="grade-standard-banner" style={{ marginBottom: '15px' }}>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>[ 등급별 오차율 기준 ]</p>
                <p>
                  <span style={{color: '#00b894'}}>A(±10%)</span> | <span style={{color: '#0984e3'}}>B(±20%)</span> | <span style={{color: '#fdcb6e'}}>C(±30%)</span> | <span style={{color: '#e17055'}}>D(±40%)</span>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1.5', minWidth: '320px' }}>
                  <h4 style={{ fontSize: '14px', color: '#333', marginBottom: '8px', borderLeft: '4px solid #00b894', paddingLeft: '8px' }}>🍎 식단 보상</h4>
                  <table className="reward-info-table" style={{ fontSize: '11px' }}>
                    <thead>
                      <tr>
                        <th>종류</th><th>A</th><th>B</th><th>C</th><th>D</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rewardData.map((item, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 'bold' }}>{item.type}</td>
                          <td style={{ color: '#00b894', fontWeight: 'bold' }}>{item.a}</td>
                          <td>{item.b}</td><td>{item.c}</td><td>{item.d}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ flex: '1', minWidth: '240px' }}>
                  <h4 style={{ fontSize: '14px', color: '#333', marginBottom: '8px', borderLeft: '4px solid #6c5ce7', paddingLeft: '8px' }}>🏃 활동 보너스</h4>
                  <table className="reward-info-table" style={{ fontSize: '11px' }}>
                    <thead>
                      <tr>
                        <th>활동 명칭</th><th>경험치</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityRewardData.map((item, i) => (
                        <tr key={i}>
                          <td style={{ textAlign: 'left', paddingLeft: '10px' }}>{item.type}</td>
                          <td style={{ color: '#6c5ce7', fontWeight: 'bold' }}>{item.reward}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '14px', color: '#333', marginBottom: '10px', borderLeft: '4px solid #ffcc00', paddingLeft: '8px' }}>🚀 레벨별 성장 가이드</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                  gap: '8px' 
                }}>
                  {levelGuideData.map((guide, idx) => (
                    <div key={idx} style={{ 
                      padding: '8px 12px', 
                      backgroundColor: '#f9f9f9', 
                      borderRadius: '8px', 
                      fontSize: '11px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ fontWeight: 'bold', color: '#444' }}>{guide.lv} {guide.title}</span>
                      <span style={{ color: '#ff7675', fontWeight: 'bold' }}>{guide.xp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reward-tip-box" style={{ marginTop: '15px', fontSize: '11px' }}>
                <p>💡 <b>필수 끼니 누락</b>은 자동 F | <b>게시글 보상</b>은 하루 1회 | <b>연속 로그인</b> 보너스는 기본 점수에 합산됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* [모달 2] 캐릭터 성장 도감 */}
      {isPreviewOpen && (
        <div className="char-modal-overlay" onClick={() => setIsPreviewOpen(false)}>
          <div className="char-modal-content preview-modal-width" onClick={(e) => e.stopPropagation()}>
            <div className="char-modal-header">
              <h3>✨ 캐릭터 성장 도감</h3>
              <button className="char-close-x" onClick={() => setIsPreviewOpen(false)}>&times;</button>
            </div>
            <div className="char-modal-body">
              <div className="preview-tabs">
                {characters.map((char, idx) => (
                  <button 
                    key={idx} 
                    className={`p-tab-btn ${activeTab === idx ? 'active' : ''}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    {char.name}
                  </button>
                ))}
              </div>
              <div className="preview-evolution-grid">
                {[1, 2, 3, 4, 5, 6].map((lv) => (
                  <div key={lv} className="p-evo-card">
                    <div className="p-img-box">
                      {/* 이미지 경로 최적화 */}
                      <img 
                        src={`/images/characters/${characters[activeTab].prefix}_lv${lv}.png`} 
                        alt={`${characters[activeTab].name} lv${lv}`} 
                      />
                    </div>
                    <span>{lv}단계</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* [모달 3] 성장 히스토리 - userNum 전달 추가 */}
      <CharacterHistory 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        userNum={charInfo?.userNum} 
      />
    </div>
  );
};

export default CharacterInfo;
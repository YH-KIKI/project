import React, { useState } from 'react';
import './CharacterInfo.css';

const CharacterInfo = () => {
  const [isRewardOpen, setIsRewardOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // 캐릭터 이름 및 파일 접두사(prefix)
  const characters = [
    { name: '냠냠이', prefix: 'nyam' },
    { name: '로로', prefix: 'roro' },
    { name: '탄탄이', prefix: 'tan' },
    { name: '꿈꿈이', prefix: 'kku' }
  ];

  // 기획안 기준: 보상 종류 및 상세 조건 데이터
  const rewardData = [
    { 
      type: '일간 (Daily)', 
      condition: '아침·점심·저녁 모두 등록', 
      a: '50 XP', b: '30 XP', c: '15 XP', d: '5 XP', f: '0 XP' 
    },
    { 
      type: '주간 (Weekly)', 
      condition: '7일 연속 등록 & 평균 C등급 이상', 
      a: '200 XP', b: '100 XP', c: '50 XP', d: '0 XP', f: '0 XP' 
    },
    { 
      type: '월간 (Monthly)', 
      condition: '한 달 모두 등록 & 평균 C등급 이상', 
      a: '1,000 XP', b: '500 XP', c: '200 XP', d: '0 XP', f: '0 XP' 
    }
  ];

  // 레벨별 성장 가이드 데이터
  const levelGuideData = [
    { lv: 'Lv. 1 ~ 10', title: '🐣 식단 병아리', xp: '100 ~ 200 XP', desc: '폭풍 성장기: 일간 보상 며칠만 받아도 바로 렙업. 앱의 재미를 느끼는 구간' },
    { lv: 'Lv. 11 ~ 30', title: '🌱 쑥쑥 자라요', xp: '250 ~ 450 XP', desc: '습관 형성기: 주간 보상을 받아야 수월한 레벨업 가능. 1주일 연속 기록 유도' },
    { lv: 'Lv. 31 ~ 60', title: '🍎 프로 식단러', xp: '500 ~ 700 XP', desc: '유지어터 구간: 매일매일의 기록과 주간 보상이 꾸준히 쌓여야 하는 본격 관리기' },
    { lv: 'Lv. 61 ~ 90', title: '🏋️ 건강 마스터', xp: '750 ~ 900 XP', desc: '고수 구간: 월간 보상(1,000 XP)이 레벨업의 치트키. 한 달 만근이 강력한 동기부여' },
    { lv: 'Lv. 91 ~ 98', title: '👑 다이어트 신', xp: '1,000 ~ 1,300 XP', desc: '마의 구간: 만렙 코앞. 꾸준한 A등급 유지와 완벽한 출석이 요구되는 최고난도 구간' },
    { lv: 'Lv. 99 (MAX)', title: '🌟 전설의 냠냠이', xp: '누적 60,300 XP', desc: '만렙 달성: 랭킹 최상위권, 특별 테두리 등 명예 보상 지급' }
  ];

  return (
    <div className="char-info-abs-layer">
      {/* 1. 보상안내 물음표 버튼: 위치 조정 유지 */}
      <button 
        className="help-icon-btn" 
        onClick={() => setIsRewardOpen(true)} 
        title="보상 안내"
        style={{ right: '40px', top: '20px' }}
      >
        ?
      </button>

      {/* 2. 도감 열기 버튼 */}
      <div className="preview-trigger-area">
        <button className="open-preview-modal-btn" onClick={() => setIsPreviewOpen(true)}>
          ✨ 캐릭터 성장 도감 보기
        </button>
      </div>

      {/* [모달 1] 보상 안내 가이드 */}
      {isRewardOpen && (
        <div className="char-modal-overlay" onClick={() => setIsRewardOpen(false)}>
          <div className="char-modal-content reward-modal-width" onClick={(e) => e.stopPropagation()}>
            <div className="char-modal-header">
              <h3>📊 경험치 획득 가이드</h3>
              <button className="char-close-x" onClick={() => setIsRewardOpen(false)}>&times;</button>
            </div>
            <div className="char-modal-body">
              {/* 등급별 오차율 기준 요약 */}
              <div className="grade-standard-banner">
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>[ 칼로리/비율 오차율 ]</p>
                <p>
                  <span style={{color: '#00b894'}}>A</span> ±10% | 
                  <span style={{color: '#0984e3'}}> B</span> ±20% | 
                  <span style={{color: '#fdcb6e'}}> C</span> ±30% | 
                  <span style={{color: '#e17055'}}> D</span> ±40%
                </p>
              </div>

              {/* 보상 테이블 */}
              <table className="reward-info-table">
                <thead>
                  <tr>
                    <th>보상 종류</th>
                    <th>필수 달성 조건</th>
                    <th>A등급</th>
                    <th>B등급</th>
                    <th>C등급</th>
                    <th>D등급</th>
                  </tr>
                </thead>
                <tbody>
                  {rewardData.map((item, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 'bold', color: '#333' }}>{item.type}</td>
                      <td style={{ fontSize: '11px', color: '#666' }}>{item.condition}</td>
                      <td style={{ color: '#00b894', fontWeight: 'bold' }}>{item.a}</td>
                      <td style={{ color: '#0984e3' }}>{item.b}</td>
                      <td style={{ color: '#fdcb6e' }}>{item.c}</td>
                      <td style={{ color: '#e17055' }}>{item.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 레벨별 성장 가이드 추가 */}
              <div className="level-growth-guide" style={{ marginTop: '20px', textAlign: 'left' }}>
                <h4 style={{ fontSize: '14px', color: '#333', marginBottom: '10px', borderLeft: '4px solid #ffcc00', paddingLeft: '8px' }}>🚀 레벨별 성장 가이드</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {levelGuideData.map((guide, idx) => (
                    <div key={idx} style={{ padding: '8px', backgroundColor: '#f9f9f9', borderRadius: '8px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', color: '#444' }}>{guide.lv} {guide.title}</span>
                        <span style={{ color: '#ff7675', fontWeight: 'bold' }}>{guide.xp}</span>
                      </div>
                      <p style={{ color: '#777', margin: 0, lineHeight: '1.4' }}>{guide.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="reward-tip-box" style={{ marginTop: '15px' }}>
                <p>💡 <b>필수 끼니 누락 시</b> 해당 일자는 <b>자동 F등급</b> 처리됩니다.</p>
                <p>💡 주간/월간 보상은 기간 내 <b>평균 등급이 C등급 이상</b>일 때 지급됩니다.</p>
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
    </div>
  );
};

export default CharacterInfo;
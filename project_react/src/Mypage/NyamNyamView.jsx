import React, { useState, useEffect } from 'react';
import nyamLogo from './NYAM.png'; // *** 파일명 NYAM.png와 대소문자까지 일치해야 합니다.

const NyamNyamView = () => { // *** 파일명 NyamNyamView.jsx에 맞춰 V를 대문자로 수정
  // 1. 초기 데이터 설정
  const [level, setLevel] = useState(10);
  const [currentExp, setCurrentExp] = useState(0); 
  const targetExp = 65; 
  const [isHovered, setIsHovered] = useState(false);

  // 2. 애니메이션 실행
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentExp(targetExp);
    }, 500);
    return () => clearTimeout(timer);
  }, [targetExp]);

  return (
    <section style={{
      width: '100%',
      border: '1px solid #FFDADA',
      borderRadius: '30px',
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '20px',
      position: 'relative',
      backgroundColor: '#fff',
      boxSizing: 'border-box' // *** 영역 이탈 방지 추가
    }}>
      {/* 설정 버튼 */}
      <button style={{ 
        position: 'absolute', top: '20px', right: '20px',
        backgroundColor: '#FFE5E5', padding: '8px 15px', borderRadius: '15px', 
        fontWeight: 'bold', border: 'none', cursor: 'pointer',
        zIndex: 10 // *** 클릭 우선순위
      }}>⚙️ 설정</button>

      {/* 말풍선 */}
      <div style={{
        position: 'relative',
        backgroundColor: '#FFE5E5',
        padding: '10px 20px',
        borderRadius: '20px',
        marginBottom: '15px',
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        animation: 'bounce 2s infinite'
      }}>
        건강하게 크고 싶이!
        <div style={{
          position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
          borderTop: '10px solid #FFE5E5'
        }}></div>
      </div>

      {/* 캐릭터 이미지 */}
      <div style={{ width: '140px', height: '140px', marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
        <img 
          src={nyamLogo} 
          alt="냠냠이" 
          style={{ 
            maxWidth: '100%',
            maxHeight: '100%',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      </div>

      {/* 레벨 및 경험치 바 */}
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontWeight: '900', fontSize: '20px', color: '#444' }}>LV. {level}</span>
          
          <div style={{
            flex: 1, height: '18px', backgroundColor: '#F0F0F0', borderRadius: '10px',
            overflow: 'hidden', border: '1px solid #E0E0E0'
          }}>
            <div style={{
              width: `${currentExp}%`,
              height: '100%',
              backgroundColor: '#FF9F43',
              transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
            }}></div>
          </div>
        </div>
        
        <p style={{ margin: 0, color: '#888', fontSize: '15px', textAlign: 'center', fontWeight: '600' }}>
          냠냠이의 건강 레벨
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </section>
  );
};

export default NyamNyamView; // *** 파일명과 동일하게 V 대문자로 수정
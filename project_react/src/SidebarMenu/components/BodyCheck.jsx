import React, { useState, useRef } from 'react';
import axios from 'axios';
import './BodyCheck.css';
import { uploadBodyCheckImage } from '../api/bodyCheckApi'; // 앞서 만든 통신 파일 연결

const BodyCheck = () => {
  // 🌟 기본 탭 및 로딩 상태
  const [activeTab, setActiveTab] = useState('album');
  const [isLoading, setIsLoading] = useState(false);
  
  // 🌟 AI 분석 타입 ('pose' 또는 'outline') 및 파일 업로드 돔 제어
  const [analyzeType, setAnalyzeType] = useState('pose');
  const fileInputRef = useRef(null);

  // 🌟 잠금(시크릿 모드) 상태 관리
  const [isUnlocked, setIsUnlocked] = useState(false); 
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // 임시 앨범 데이터 (나중에 DB에서 불러올 데이터)
  const albumRecords = [
    { id: 1, date: '2026.05.11' },
    { id: 2, date: '2026.04.11' },
  ];

  const getTodayString = () => {
    const today = new Date(); 
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); 
    const day = String(today.getDate()).padStart(2, '0');
    const week = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = week[today.getDay()];
    return `${year}.${month}.${day} ${dayOfWeek}`; 
  };

  // 🔒 비밀번호 확인 통신 함수
  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) {
      setPasswordError(true);
      return;
    }

    try {
      // 스프링부트로 비밀번호 검증 요청 (API 주소 및 파라미터는 환경에 맞게 조정 가능)
      const response = await axios.post('http://localhost:8080/api/v1/user/verify-password?userNum=1', {
        password: passwordInput
      }, { withCredentials: true });

      if (response.data === true) {
        setIsUnlocked(true); // 잠금 해제! (블러가 걷힘)
        setPasswordError(false);
      } else {
        setPasswordError(true); // 비밀번호 틀림
      }
    } catch (error) {
      console.error("비밀번호 검증 에러", error);
      alert("비밀번호 확인 중 오류가 발생했습니다. 백엔드 서버를 확인해주세요.");
    }
  };

  // 📷 사진 업로드 함수 (스프링부트로 전송)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // API 파일의 uploadBodyCheckImage 함수 호출!
      const result = await uploadBodyCheckImage(file, analyzeType);
      console.log("🔥 AI 분석 결과 도착:", result);
      alert(`[${analyzeType === 'pose' ? '자세 분석' : '윤곽선 따기'}] 완료! 콘솔창을 확인하세요.`);
      
    } catch (error) {
      alert("사진 전송에 실패했습니다. 스프링부트 서버가 켜져 있는지 확인해주세요.");
    } finally {
      setIsLoading(false);
      e.target.value = ''; // 동일한 파일 다시 선택 가능하도록 초기화
    }
  };

  // 🖼️ 각 사진 칸을 구성하는 컴포넌트
  const ImagePlaceholder = () => (
    <div className="bc-image-placeholder">
       {/* 숨겨진 파일 입력창 */}
       <input 
        type="file" 
        accept="image/*" 
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />

      {isLoading ? (
        <div className="bc-loading-text">
          <span className="spinner">✨</span> AI가 체형을 분석 중입니다...
        </div>
      ) : (
        <div className="bc-btn-group">
          <button 
            className="bc-upload-btn pose-btn" 
            onClick={() => {
              setAnalyzeType('pose');
              fileInputRef.current.click();
            }}
          >
            🦴 1번 AI: 골격/자세 분석
          </button>
          <button 
            className="bc-upload-btn outline-btn" 
            onClick={() => {
              setAnalyzeType('outline');
              fileInputRef.current.click();
            }}
          >
            👤 2번 AI: 실루엣(누끼) 따기
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="body-check-wrapper">
      
      {/* 🔒 1. 비밀번호 입력 팝업 (모달) */}
      {!isUnlocked && (
        <div className="password-modal-overlay">
          <div className="password-modal">
            <h3>🔒 눈바디 시크릿 모드</h3>
            <p>소중한 기록을 보호하기 위해<br/>비밀번호를 한 번 더 입력해 주세요.</p>
            
            <input 
              type="password" 
              placeholder="비밀번호 입력"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()} // 엔터키 지원
              className={passwordError ? 'error-shake' : ''}
              autoFocus
            />
            {passwordError && <span className="error-msg">비밀번호가 일치하지 않습니다.</span>}
            
            <button onClick={handlePasswordSubmit}>기록 보기</button>
          </div>
        </div>
      )}

      {/* 🌟 2. 메인 컨텐츠 영역 (isUnlocked가 false면 blurred 클래스 추가) */}
      <div className={`bc-main-content ${!isUnlocked ? 'blurred' : ''}`}>
        
        <div className="bc-header-area">
          <h2 className="bc-main-title">눈바디(Body Check) 앨범</h2>
          <span className="bc-header-date">{getTodayString()}</span>
        </div>

        <div className="bc-main-card">
          <div className="bc-tab-menu">
            <button
              className={`bc-tab-button ${activeTab === 'album' ? 'active' : ''}`}
              onClick={() => setActiveTab('album')}
            >
              눈바디 앨범
            </button>
            <button
              className={`bc-tab-button ${activeTab === 'compare' ? 'active' : ''}`}
              onClick={() => setActiveTab('compare')}
            >
              변화 비교
            </button>
          </div>

          <div className="bc-content-card">
            
            {/* --- [눈바디 앨범 탭] --- */}
            {activeTab === 'album' && (
              <>
                <div className="bc-album-grid">
                  {albumRecords.map((record) => (
                    <div key={record.id} className="bc-album-item">
                      <div className="bc-item-header">
                        <span className="bc-item-date">{record.date}</span>
                        <span className="bc-camera-icon">📸</span>
                      </div>
                      <ImagePlaceholder />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* --- [변화 비교 탭] --- */}
            {activeTab === 'compare' && (
              <div className="bc-compare-wrapper">
                <div className="bc-compare-header">
                  <p className="bc-compare-dates">2026.04.11 → 2026.05.11</p>
                </div>
                <div className="bc-compare-content">
                  <div className="bc-compare-item">
                    <ImagePlaceholder />
                    <div className="bc-compare-label">
                      <strong>전</strong> <span>2026.04.11</span>
                    </div>
                  </div>
                  
                  <div className="bc-compare-item">
                    <ImagePlaceholder />
                    <div className="bc-compare-label">
                      <strong>후</strong> <span>2026.05.11</span>
                    </div>
                  </div>
                </div>
                <div className="bc-compare-action">
                  <button className="bc-primary-btn">비교 완료</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyCheck;
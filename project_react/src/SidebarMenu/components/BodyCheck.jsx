import React, { useState, useRef } from 'react';
import axios from 'axios';
import './BodyCheck.css';

const BodyCheck = () => {
  const [activeTab, setActiveTab] = useState('album'); 
  
  // 🌟 앨범 목록 상태: 빈 배열로 시작하여 기본 이미지를 없앴습니다.
  const [albumRecords, setAlbumRecords] = useState([]);

  // 비교 탭 상태
  const [leftPreview, setLeftPreview] = useState(null);
  const [leftDate, setLeftDate] = useState('과거 날짜');
  const [rightPreview, setRightPreview] = useState(null);
  const [rightDate, setRightDate] = useState('오늘 날짜');

  const [internalAlbumTarget, setInternalAlbumTarget] = useState(null); 

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null); 

  const [showAIPopup, setShowAIPopup] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const [isUnlocked, setIsUnlocked] = useState(false); 
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const formatDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) { setPasswordError(true); return; }
    try {
      const response = await axios.post('http://localhost:8080/api/v1/user/verify-password?userNum=1', { password: passwordInput }, { withCredentials: true });
      if (response.data === true) { setIsUnlocked(true); setPasswordError(false); } 
      else { setPasswordError(true); }
    } catch (error) { 
      alert("서버 연결 오류. (테스트를 위해 임시로 잠금 해제합니다)"); 
      setIsUnlocked(true); 
    }
  };

  const triggerUpload = (target, type) => {
    setUploadTarget(target);
    if (type === 'camera') cameraInputRef.current.click();
    else galleryInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (uploadTarget === 'album') {
      const previewUrl = URL.createObjectURL(file);
      const newRecord = {
        id: Date.now(),
        date: formatDate(new Date()),
        preview: previewUrl,
        aiType: '원본' 
      };
      setAlbumRecords([newRecord, ...albumRecords]);
      alert("오늘의 눈바디가 앨범에 등록되었습니다! 📸");

    } else if (uploadTarget === 'compare-right') {
      setPendingFile(file);
      setShowAIPopup(true);
    }
    e.target.value = ''; 
  };

  const selectFromInternalAlbum = (record) => {
    if (internalAlbumTarget === 'left') {
      setLeftPreview(record.preview);
      setLeftDate(record.date);
    } else if (internalAlbumTarget === 'right') {
      setRightPreview(record.preview);
      setRightDate(record.date);
    }
    setInternalAlbumTarget(null); 
  };

  const handleAISelection = (type) => {
    setShowAIPopup(false);
    if (!pendingFile) return;

    const previewUrl = URL.createObjectURL(pendingFile);
    const todayStr = formatDate(new Date());

    if (uploadTarget === 'compare-right') {
      setRightPreview(previewUrl);
      setRightDate(todayStr);
      alert(`[${type === 'pose' ? '체형 점수 분석' : '실루엣 따기'}] 모드가 선택되었습니다! 🚀`);
    }
    setPendingFile(null);
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm("정말로 이 눈바디 기록을 삭제하시겠습니까?")) {
      const updatedRecords = albumRecords.filter(record => record.id !== id);
      setAlbumRecords(updatedRecords);
      alert("기록이 삭제되었습니다.");
    }
  };

  return (
    <div className="body-check-wrapper">
      <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} ref={cameraInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*" style={{ display: 'none' }} ref={galleryInputRef} onChange={handleFileChange} />

      {!isUnlocked && (
        <div className="password-modal-overlay" style={{zIndex: 999}}>
          <form className="password-modal" onSubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }}>
            <h3>🔒 눈바디 시크릿 모드</h3>
            <p>비밀번호를 입력해 주세요.</p>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} autoFocus />
            <button type="submit">기록 보기</button>
          </form>
        </div>
      )}

      {internalAlbumTarget && (
        <div className="password-modal-overlay" style={{zIndex: 1000}}>
          <div className="ai-select-modal internal-album-modal">
            <h3>📁 내 눈바디 앨범</h3>
            <p>비교하고 싶은 과거의 기록을 선택하세요.</p>
            
            <div className="mini-album-grid">
              {albumRecords.map(record => (
                <div key={record.id} className="mini-album-item" onClick={() => selectFromInternalAlbum(record)}>
                  <img src={record.preview} alt="과거기록" />
                  <span>{record.date}</span>
                </div>
              ))}
              {albumRecords.length === 0 && <p style={{color: '#999', gridColumn: 'span 2', padding: '20px'}}>저장된 앨범이 없습니다.</p>}
            </div>
            <button className="cancel-btn" onClick={() => setInternalAlbumTarget(null)}>닫기</button>
          </div>
        </div>
      )}

      {showAIPopup && (
        <div className="password-modal-overlay" style={{zIndex: 1000}}>
          <div className="ai-select-modal">
            <h3>🤖 AI 분석 모드 선택</h3>
            <p>선택하신 사진으로 어떤 분석을 진행할까요?</p>
            <div className="ai-select-buttons">
              <button className="bc-upload-btn pose-btn" onClick={() => handleAISelection('pose')}>🦴 체형 점수 분석</button>
              <button className="bc-upload-btn outline-btn" onClick={() => handleAISelection('outline')}>👤 체형 변화 비교 (실루엣 따기)</button>
            </div>
            <button className="cancel-btn" onClick={() => { setShowAIPopup(false); setPendingFile(null); }}>취소</button>
          </div>
        </div>
      )}

      <div className={`bc-main-content ${!isUnlocked ? 'blurred' : ''}`}>
        <div className="bc-header-area">
          <h2 className="bc-main-title">눈바디(Body Check) 앨범</h2>
          <span className="bc-header-date">{formatDate(new Date())}</span>
        </div>

        <div className="bc-main-card">
          <div className="bc-tab-menu">
            <button className={`bc-tab-button ${activeTab === 'album' ? 'active' : ''}`} onClick={() => setActiveTab('album')}>눈바디 앨범</button>
            <button className={`bc-tab-button ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>변화 비교</button>
          </div>

          <div className="bc-content-card">
            
            {activeTab === 'album' && (
               <div className="bc-album-grid">
                 {/* 🌟 '오늘의 눈바디 기록하기' 카드만 남겨두었습니다. */}
                 <div className="bc-album-item add-new-item">
                   <div className="add-new-content">
                     <p>오늘의 눈바디 기록하기</p>
                     <div className="bc-btn-group" style={{width: '90%'}}>
                       <button className="bc-upload-btn camera-btn" onClick={() => triggerUpload('album', 'camera')}>📷 카메라 촬영</button>
                       <button className="bc-upload-btn gallery-btn" onClick={() => triggerUpload('album', 'gallery')}>📁 기기에서 첨부</button>
                     </div>
                   </div>
                 </div>

                 {albumRecords.map((record) => (
                   <div key={record.id} className="bc-album-item">
                     <div className="bc-item-header">
                       <div className="bc-item-header-left">
                         <span className="bc-item-date">{record.date}</span>
                         <span className="bc-tag" style={{ backgroundColor: record.aiType === '원본' ? '#bbb' : '#8c7ae6' }}>
                           {record.aiType === 'pose' ? '🦴 체형분석' : record.aiType === 'outline' ? '👤 실루엣' : '📸 원본'}
                         </span>
                       </div>
                       <button className="bc-delete-btn" onClick={() => handleDeleteRecord(record.id)}>🗑️ 삭제</button>
                     </div>
                     <div className="bc-image-placeholder">
                       {record.preview && <img src={record.preview} alt="눈바디" className="bc-preview-img" />}
                     </div>
                   </div>
                 ))}
               </div>
            )}

            {activeTab === 'compare' && (
              <div className="bc-compare-wrapper">
                <div className="bc-compare-header">
                  <p className="bc-compare-dates">{leftDate} ➔ {rightDate}</p>
                </div>
                <div className="bc-compare-content">
                  <div className="bc-compare-item">
                    <div className="bc-compare-label"><strong>전</strong></div>
                    <div className="bc-image-placeholder">
                      {leftPreview ? (
                        <img src={leftPreview} alt="과거" className="bc-preview-img" onClick={() => setInternalAlbumTarget('left')}/>
                      ) : (
                        <button className="bc-upload-btn gallery-btn" style={{width: '80%'}} onClick={() => setInternalAlbumTarget('left')}>📁 눈바디 앨범에서 선택</button>
                      )}
                    </div>
                  </div>
                  
                  <div className="bc-compare-item">
                    <div className="bc-compare-label"><strong>후</strong></div>
                    <div className="bc-image-placeholder">
                      {rightPreview ? (
                        <img src={rightPreview} alt="현재" className="bc-preview-img" onClick={() => triggerUpload('compare-right', 'gallery')}/>
                      ) : (
                        <div className="bc-btn-group" style={{width: '90%'}}>
                          <button className="bc-upload-btn camera-btn" onClick={() => triggerUpload('compare-right', 'camera')}>📷 카메라로 촬영</button>
                          <button className="bc-upload-btn gallery-btn" onClick={() => triggerUpload('compare-right', 'gallery')}>📁 기기에서 첨부</button>
                          <button className="bc-upload-btn" style={{backgroundColor: '#ffb8b8', color: 'white'}} onClick={() => setInternalAlbumTarget('right')}>📁 눈바디 앨범에서 선택</button>
                        </div>
                      )}
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
import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import './BodyCheck.css';
import { uploadBodyCheckImage } from '../api/bodyCheckApi';
import Cropper from 'react-easy-crop';

// ==========================================
// ✂️ [도우미 함수] 선택한 영역만큼 사진을 잘라주는 함수
// ==========================================
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
      resolve({ file, url: URL.createObjectURL(blob) });
    }, 'image/jpeg', 0.95); 
  });
};
// ==========================================

const BodyCheck = () => {
  const [activeTab, setActiveTab] = useState('album'); 
  const [albumRecords, setAlbumRecords] = useState([]);

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
  const [isLoading, setIsLoading] = useState(false);

  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);

  const [isUnlocked, setIsUnlocked] = useState(false); 
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0 }); 
  const [zoom, setZoom] = useState(1); 
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); 

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

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

  // 🌟 [수정됨] 카메라/앨범에서 사진을 고르기 전에 검사하는 로직 추가!
  const triggerUpload = (target, type) => {
    // '후' 사진을 올리려는데 '전' 사진이 없다면? 경고창 띄우고 멈춤!
    if (target === 'compare-right' && !leftPreview) {
      alert("🚨 '전(과거)' 사진을 먼저 등록해 주세요!\n과거 사진이 있어야 변화를 비교할 수 있습니다.");
      return;
    }

    setUploadTarget(target);
    if (type === 'camera') cameraInputRef.current.click();
    else galleryInputRef.current.click();
  };

  // 🌟 [수정됨] 내부 눈바디 앨범 창을 띄울 때도 똑같이 검사합니다!
  const openInternalAlbum = (target) => {
    if (target === 'right' && !leftPreview) {
      alert("🚨 '전(과거)' 사진을 먼저 등록해 주세요!\n과거 사진이 있어야 변화를 비교할 수 있습니다.");
      return;
    }
    setInternalAlbumTarget(target);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImageToCrop(imageUrl);
    setShowCropModal(true);
    e.target.value = ''; 
  };

  const handleCropSave = async () => {
    try {
      const { file: croppedFile, url: croppedUrl } = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      setShowCropModal(false);
      setImageToCrop(null);

      if (uploadTarget === 'album') {
        setIsLoading(true);
        try {
          await uploadBodyCheckImage(croppedFile, '원본'); 
          const newRecord = { id: Date.now(), date: formatDate(new Date()), preview: croppedUrl, aiType: '원본' };
          setAlbumRecords([newRecord, ...albumRecords]);
          alert("오늘의 눈바디가 앨범과 DB에 등록되었습니다! 📸");
        } catch (err) {
          alert("서버 업로드에 실패했습니다.");
        } finally {
          setIsLoading(false);
        }
      } else if (uploadTarget === 'compare-right') {
        setPendingFile(croppedFile);
        setShowAIPopup(true); 
      } else if (uploadTarget === 'compare-left') {
        setLeftPreview(croppedUrl);
        setLeftDate(formatDate(new Date()));
      }
    } catch (e) {
      console.error(e);
      alert("사진을 자르는 중 오류가 발생했습니다.");
    }
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

  const handleAISelection = async (type) => {
    setShowAIPopup(false);
    if (!pendingFile) return;

    setIsLoading(true); 
    try {
      const responseData = await uploadBodyCheckImage(pendingFile, type);
      let parsedData = responseData;
      if (typeof responseData === 'string') {
        try { parsedData = JSON.parse(responseData); } catch (e) { }
      }

      let finalImageUrl = URL.createObjectURL(pendingFile); 
      if (type !== '원본' && parsedData && parsedData.image_base64) {
         finalImageUrl = `data:image/jpeg;base64,${parsedData.image_base64}`;
      }

      if (uploadTarget === 'compare-right') {
        setRightPreview(finalImageUrl);
        setRightDate(formatDate(new Date()));
        
        const typeName = type === 'pose' ? '체형 분석' : '원본 등록';
        alert(`[${typeName}] 완료! 아래 '겹쳐서 차이점 보기' 버튼을 눌러보세요! 🚀`);
      }
    } catch (error) {
      alert("서버 통신에 실패했습니다.");
    } finally {
      setIsLoading(false); 
      setPendingFile(null);
    }
  };

  const handleDeleteRecord = (id) => {
    if (window.confirm("정말로 이 기록을 삭제하시겠습니까?")) {
      setAlbumRecords(albumRecords.filter(record => record.id !== id));
    }
  };

  return (
    <div className="body-check-wrapper">
      <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} ref={cameraInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*" style={{ display: 'none' }} ref={galleryInputRef} onChange={handleFileChange} />

      {isLoading && (
        <div className="password-modal-overlay" style={{zIndex: 9999}}>
          <div className="ai-select-modal" style={{width: '240px', padding: '30px'}}>
            <span style={{fontSize: '40px', display: 'block', marginBottom: '15px'}} className="spinner">✨</span>
            <h3 style={{fontSize: '16px'}}>AI 분석 및 저장 중...</h3>
            <p style={{marginTop: '10px', fontSize: '13px', color: '#888'}}>조금만 기다려 주세요.</p>
          </div>
        </div>
      )}

      {showCropModal && (
        <div className="password-modal-overlay" style={{zIndex: 4000}}>
          <div className="ai-select-modal" style={{width: '90%', maxWidth: '400px', height: '65vh', padding: '20px', display: 'flex', flexDirection: 'column'}}>
            <h3 style={{marginBottom: '5px'}}>✂️ 사진 영역 설정</h3>
            <p style={{fontSize: '13px', color: '#666', marginBottom: '15px'}}>사진을 드래그하거나 확대해서 3:4 비율에 맞춰주세요!</p>
            
            <div style={{ position: 'relative', flexGrow: 1, backgroundColor: '#333', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px' }}>
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={3 / 4} 
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px'}}>
              <span style={{fontSize: '12px', color: '#888'}}>축소</span>
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(e.target.value)} style={{flexGrow: 1}}/>
              <span style={{fontSize: '12px', color: '#888'}}>확대</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCropSave} style={{ flex: 1, padding: '15px', backgroundColor: '#ff6b8b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                영역 지정 완료
              </button>
              <button onClick={() => { setShowCropModal(false); setImageToCrop(null); }} style={{ flex: 1, padding: '15px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {showOverlay && (
        <div className="password-modal-overlay" style={{zIndex: 2000}}>
          <div className="ai-select-modal" style={{width: '90%', maxWidth: '400px', padding: '20px'}}>
            <h3 style={{marginBottom: '10px'}}>✨ 체형 변화 겹쳐보기</h3>
            <p style={{fontSize: '13px', color: '#666', marginBottom: '15px'}}>바를 움직여서 전후 변화를 비교해 보세요!</p>
            
            <input 
              type="range" 
              min="0" max="1" step="0.05" 
              value={overlayOpacity} 
              onChange={(e) => setOverlayOpacity(e.target.value)} 
              style={{width: '100%', marginBottom: '20px'}}
            />

            <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', backgroundColor: '#eee', borderRadius: '10px', overflow: 'hidden' }}>
              <img src={leftPreview} alt="과거" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <img src={rightPreview} alt="현재" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: overlayOpacity }} />
            </div>
            
            <button className="cancel-btn" style={{marginTop: '20px', width: '100%'}} onClick={() => setShowOverlay(false)}>닫기</button>
          </div>
        </div>
      )}

      {!isUnlocked && (
        <div className="password-modal-overlay" style={{zIndex: 999}}>
          <form className="password-modal" onSubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }}>
            <h3>🔒 눈바디 시크릿 모드</h3>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} autoFocus />
            <button type="submit">기록 보기</button>
          </form>
        </div>
      )}

      {internalAlbumTarget && (
        <div className="password-modal-overlay" style={{zIndex: 1000}}>
          <div className="ai-select-modal internal-album-modal">
            <h3>📁 내 눈바디 앨범</h3>
            <div className="mini-album-grid">
              {albumRecords.map(record => (
                <div key={record.id} className="mini-album-item" onClick={() => selectFromInternalAlbum(record)}>
                  <img src={record.preview} alt="과거기록" />
                  <span>{record.date}</span>
                </div>
              ))}
              {albumRecords.length === 0 && <p style={{color: '#999', gridColumn: 'span 2'}}>저장된 앨범이 없습니다.</p>}
            </div>
            <button className="cancel-btn" onClick={() => setInternalAlbumTarget(null)}>닫기</button>
          </div>
        </div>
      )}

      {showAIPopup && (
        <div className="password-modal-overlay" style={{zIndex: 1000}}>
          <div className="ai-select-modal">
            <h3>🤖 사진 분석 모드 선택</h3>
            <p style={{marginBottom: '15px'}}>선택하신 사진을 어떻게 등록할까요?</p>
            <div className="ai-select-buttons">
              <button className="bc-upload-btn pose-btn" onClick={() => handleAISelection('pose')}>🦴 체형 점수 분석 (AI)</button>
              <button className="bc-upload-btn" style={{backgroundColor: '#ff8fa3', color: 'white'}} onClick={() => handleAISelection('원본')}>✨ 원본 사진 그대로 등록</button>
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
                  
                  {/* --- 전 (Before) 영역 --- */}
                  <div className="bc-compare-item">
                    <div className="bc-compare-label">
                      <strong>전</strong>
                    </div>
                    <div className="bc-image-placeholder" style={{ position: 'relative' }}>
                      {leftPreview ? (
                        <>
                          <img src={leftPreview} alt="과거" className="bc-preview-img" onClick={() => triggerUpload('compare-left', 'gallery')}/>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              setLeftPreview(null); 
                              setLeftDate('과거 날짜'); 
                            }} 
                            style={{ 
                              position: 'absolute', top: '12px', right: '12px', 
                              backgroundColor: 'rgba(0, 0, 0, 0.55)', color: 'white', 
                              border: 'none', borderRadius: '50%', width: '32px', height: '32px', 
                              fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                              display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10
                            }}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <div className="bc-btn-group" style={{width: '90%'}}>
                          {/* 🌟 함수 이름 변경됨 */}
                          <button className="bc-upload-btn" style={{backgroundColor: '#ffb8b8', color: 'white'}} onClick={() => openInternalAlbum('left')}>📁 앨범에서 선택</button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* --- 후 (After) 영역 --- */}
                  <div className="bc-compare-item">
                    <div className="bc-compare-label">
                      <strong>후</strong>
                    </div>
                    <div className="bc-image-placeholder" style={{ position: 'relative' }}>
                      {rightPreview ? (
                        <>
                          <img src={rightPreview} alt="현재" className="bc-preview-img" onClick={() => triggerUpload('compare-right', 'gallery')}/>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation();
                              setRightPreview(null); 
                              setRightDate('오늘 날짜'); 
                            }} 
                            style={{ 
                              position: 'absolute', top: '12px', right: '12px', 
                              backgroundColor: 'rgba(0, 0, 0, 0.55)', color: 'white', 
                              border: 'none', borderRadius: '50%', width: '32px', height: '32px', 
                              fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                              display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10
                            }}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <div className="bc-btn-group" style={{width: '90%'}}>
                          <button className="bc-upload-btn camera-btn" onClick={() => triggerUpload('compare-right', 'camera')}>📷 카메라로 촬영</button>
                          <button className="bc-upload-btn gallery-btn" onClick={() => triggerUpload('compare-right', 'gallery')}>📁 기기에서 첨부</button>
                          {/* 🌟 함수 이름 변경됨 */}
                          <button className="bc-upload-btn" style={{backgroundColor: '#ffb8b8', color: 'white'}} onClick={() => openInternalAlbum('right')}>📁 앨범에서 선택</button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
                
                <div className="bc-compare-action">
                  <button 
                    className="bc-primary-btn" 
                    onClick={() => setShowOverlay(true)}
                    disabled={!leftPreview || !rightPreview} 
                    style={{ backgroundColor: (!leftPreview || !rightPreview) ? '#ccc' : '#e84393' }}
                  >
                    ✨ 사진 겹쳐서 차이점 보기
                  </button>
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
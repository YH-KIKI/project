import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import './BodyCheck.css';
import { uploadBodyCheckImage } from '../api/bodyCheckApi';
import Cropper from 'react-easy-crop';

// ==========================================
// 🌟 스프링부트 서버 주소 설정 (이미지 렌더링에 필수)
// ==========================================
const SERVER_URL = process.env.REACT_APP_API_URL;

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

const BodyCheck = ({ userNum = 1 }) => {
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

  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0 }); 
  const [zoom, setZoom] = useState(1); 
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null); 

  // =====================================================================
  // 스프링부트에서 눈바디 목록 가져오기 (DB 연동)
  // =====================================================================
  const fetchAlbumRecords = useCallback(async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/v1/bodycheck/list`, {
        params: { userNum: userNum } 
      });
      // DB에서 가져온 데이터 형태: [{bcNum, bcImagePath, bcType, bcAiResult, bcDate}]
      setAlbumRecords(response.data); 
    } catch (err) {
      console.error("기록 로딩 실패:", err);
    }
  }, [userNum]);

  useEffect(() => {
    if (isUnlocked) {
      fetchAlbumRecords();
    }
  }, [isUnlocked, fetchAlbumRecords]);

  // =====================================================================
  // DB에서 기록 삭제하기 (DELETE 연동)
  // =====================================================================
  const handleDeleteRecord = async (bcNum) => {
    if (window.confirm("정말로 이 기록을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`${SERVER_URL}/api/v1/bodycheck/${bcNum}`);
        // 화면에서도 지우기
        setAlbumRecords(albumRecords.filter(record => record.bcNum !== bcNum));
        alert("삭제되었습니다. 🗑️");
      } catch (err) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

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
    if (!passwordInput.trim()) return;
    try {
      const response = await axios.post(`${SERVER_URL}/api/v1/user/verify-password?userNum=${userNum}`, { password: passwordInput }, { withCredentials: true });
      if (response.data === true) { 
        setIsUnlocked(true); 
      } else { 
        alert("비밀번호가 틀렸습니다."); 
      }
    } catch (error) { 
      alert("서버 연결 오류. 테스트를 위해 임시로 잠금 해제합니다."); 
      setIsUnlocked(true); 
    }
  };

  const triggerUpload = (target, type) => {
    if (target === 'compare-right' && !leftPreview) {
      alert("🚨 '전(과거)' 사진을 먼저 등록해 주세요!");
      return;
    }
    setUploadTarget(target);
    if (type === 'camera') cameraInputRef.current.click();
    else galleryInputRef.current.click();
  };

  const openInternalAlbum = (target) => {
    if (target === 'right' && !leftPreview) {
      alert("🚨 '전(과거)' 사진을 먼저 등록해 주세요!");
      return;
    }
    setInternalAlbumTarget(target);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageToCrop(URL.createObjectURL(file));
    setShowCropModal(true);
    e.target.value = ''; 
  };

  const handleCropSave = async () => {
    try {
      const { file: croppedFile } = await getCroppedImg(imageToCrop, croppedAreaPixels);
      setShowCropModal(false);
      setImageToCrop(null);

      if (uploadTarget === 'album') {
        setIsLoading(true);
        try {
          await uploadBodyCheckImage(croppedFile, '원본'); 
          alert("성공적으로 등록되었습니다! 📸");
          fetchAlbumRecords(); 
        } catch (err) {
          alert("업로드 실패");
        } finally {
          setIsLoading(false);
        }
      } else if (uploadTarget === 'compare-right') {
        setPendingFile(croppedFile);
        setShowAIPopup(true); 
      } else if (uploadTarget === 'compare-left') {
        setLeftPreview(URL.createObjectURL(croppedFile));
        setLeftDate(formatDate(new Date()));
      }
    } catch (e) {
      alert("사진 처리 중 오류 발생");
    }
  };

  const handleAISelection = async (type) => {
    setShowAIPopup(false);
    if (!pendingFile) return;
    setIsLoading(true); 
    try {
      const responseData = await uploadBodyCheckImage(pendingFile, type);
      let finalImageUrl = URL.createObjectURL(pendingFile); 
      if (type !== '원본' && responseData.image_base64) {
         finalImageUrl = `data:image/jpeg;base64,${responseData.image_base64}`;
      }
      setRightPreview(finalImageUrl);
      setRightDate(formatDate(new Date()));
      alert("등록 완료! 🚀");
    } catch (error) {
      alert("서버 통신 실패");
    } finally {
      setIsLoading(false); 
      setPendingFile(null);
    }
  };

 // 내부 앨범에서 선택할 때도 AI 팝업 띄우기
  const selectFromInternalAlbum = async (record) => {
    const fullImageUrl = `${SERVER_URL}${record.bcImagePath}`;
    
    if (internalAlbumTarget === 'left') {
      // 전(Before) 사진은 AI 분석이 필요 없으므로 바로 화면에 띄움
      setLeftPreview(fullImageUrl);
      setLeftDate(record.bcDate);
      setInternalAlbumTarget(null);
      
    } else if (internalAlbumTarget === 'right') {
      // 후(After) 사진을 골랐을 때는 AI 팝업을 띄우기 위한 작업 시작!
      setInternalAlbumTarget(null);
      setIsLoading(true); // 로딩 스피너 돌리기
      
      try {
        // 1. 서버에 있는 사진 주소(URL)를 가져와서 실제 파일(Blob) 형태로 다운로드
        const response = await fetch(fullImageUrl);
        const blob = await response.blob();
        
        // 2. 다운로드한 데이터를 AI가 읽을 수 있는 File 객체로 변환
        const file = new File([blob], "album_image.jpg", { type: blob.type || "image/jpeg" });

        // 3. 변환된 파일을 대기열에 넣고 AI 팝업창 열기!
        setPendingFile(file);
        setShowAIPopup(true); 
      } catch (error) {
        alert("앨범 사진을 분석용으로 변환하는 데 실패했습니다.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="body-check-wrapper">
      <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} ref={cameraInputRef} onChange={handleFileChange} />
      <input type="file" accept="image/*" style={{ display: 'none' }} ref={galleryInputRef} onChange={handleFileChange} />

      {/* 로딩 모달 */}
      {isLoading && (
        <div className="password-modal-overlay" style={{zIndex: 9999}}>
          <div className="ai-select-modal" style={{width: '240px', padding: '30px'}}>
            <span className="spinner" style={{fontSize: '40px', display: 'block', marginBottom: '15px'}}>✨</span>
            <h3 style={{fontSize: '16px'}}>분석 및 저장 중...</h3>
          </div>
        </div>
      )}

      {/* 크롭 모달 */}
      {showCropModal && (
        <div className="password-modal-overlay" style={{zIndex: 4000}}>
          <div className="ai-select-modal crop-modal">
            <h3>✂️ 사진 영역 설정</h3>
            <div className="crop-container" style={{ position: 'relative', width: '100%', height: '300px', backgroundColor: '#333', borderRadius: '12px', overflow: 'hidden', marginBottom: '15px' }}>
              <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={3 / 4} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
            </div>
            <div className="crop-controls" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
              <span>축소</span>
              <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(e.target.value)} style={{ flexGrow: 1 }}/>
              <span>확대</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleCropSave} style={{ flex: 1, padding: '15px', backgroundColor: '#ff6b8b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>지정 완료</button>
              <button onClick={() => { setShowCropModal(false); setImageToCrop(null); }} style={{ flex: 1, padding: '15px', backgroundColor: '#eee', color: '#555', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* AI 옵션 선택 팝업 */}
      {showAIPopup && (
        <div className="password-modal-overlay" style={{zIndex: 3000}}>
          <div className="ai-select-modal">
            <h3>🤖 AI 비교분석 옵션</h3>
            <p>비교할 사진에 효과를 적용해볼까요?</p>
            <div className="ai-select-buttons">
              <button className="bc-upload-btn camera-btn" onClick={() => handleAISelection('pose')}>🦴 AI 뼈대 추출 (자세 교정용)</button>
              <button className="bc-upload-btn gallery-btn" onClick={() => handleAISelection('outline')}>👤 AI 실루엣 추출 (바디라인 비교용)</button>
            </div>
            <button className="cancel-btn" onClick={() => setShowAIPopup(false)}>취소</button>
          </div>
        </div>
      )}

      {/* 비밀번호 잠금 모달 */}
      {!isUnlocked && (
        <div className="password-modal-overlay" style={{zIndex: 999}}>
          <form className="password-modal" onSubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }}>
            <h3>🔒 눈바디 시크릿 모드</h3>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} autoFocus />
            <button type="submit">기록 보기</button>
          </form>
        </div>
      )}

      {/* 내부 앨범 모달 */}
      {internalAlbumTarget && (
        <div className="password-modal-overlay" style={{zIndex: 1000}}>
          <div className="ai-select-modal internal-album-modal">
            <h3>📁 내 눈바디 앨범</h3>
            <div className="mini-album-grid">
              {/* 🌟 [수정 완료] DTO 필드명(bcNum, bcImagePath, bcDate) 적용 및 서버 URL 연동 */}
              {albumRecords.map(record => (
                <div key={record.bcNum} className="mini-album-item" onClick={() => selectFromInternalAlbum(record)}>
                  <img src={`${SERVER_URL}${record.bcImagePath}`} alt="과거기록" />
                  <span>{record.bcDate}</span>
                </div>
              ))}
              {albumRecords.length === 0 && <p style={{color: '#999', gridColumn: 'span 2'}}>저장된 앨범이 없습니다.</p>}
            </div>
            <button className="cancel-btn" onClick={() => setInternalAlbumTarget(null)}>닫기</button>
          </div>
        </div>
      )}

      {/* 겹쳐보기 오버레이 모달 */}
      {showOverlay && leftPreview && rightPreview && (
        <div className="password-modal-overlay" style={{zIndex: 5000}}>
          <div className="ai-select-modal" style={{width: '90%', maxWidth: '500px'}}>
            <h3>👀 겹쳐서 비교하기</h3>
            <div style={{position: 'relative', width: '100%', aspectRatio: '3/4', backgroundColor: '#f0f0f0', borderRadius: '12px', overflow: 'hidden'}}>
              <img src={leftPreview} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover'}} alt="before" />
              <img src={rightPreview} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: overlayOpacity}} alt="after" />
            </div>
            <div style={{marginTop: '20px'}}>
              <label style={{display: 'block', marginBottom: '10px', fontWeight: 'bold'}}>투명도 조절</label>
              <input type="range" min="0" max="1" step="0.01" value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))} style={{width: '100%'}} />
            </div>
            <button onClick={() => setShowOverlay(false)} style={{marginTop: '15px', padding: '10px', width: '100%', backgroundColor: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>닫기</button>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
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
            
            {/* --- 앨범 탭 --- */}
            {activeTab === 'album' && (
               <div className="bc-album-grid">
                 {/* 👇 여기를 수정! 오늘의 눈바디 추가 슬롯 */}
                 <div className="bc-album-item">
                   {/* 🌟 [높이 맞춤용] 눈에 보이지 않는 투명한 헤더를 추가해서 공간을 차지하게 만듭니다 */}
                   <div className="bc-item-header" style={{ visibility: 'hidden' }}>
                     <span className="bc-item-date">0000.00.00</span>
                     <button className="bc-delete-btn">🗑️ 삭제</button>
                   </div>
                   
                   <div className="bc-image-placeholder">
                     <div style={{fontSize: '36px', color: '#ffb6c1', marginBottom: '10px'}}>📸</div>
                     <p style={{color: '#ff6b8b', fontWeight: 'bold', marginBottom: '15px'}}>오늘의 눈바디 추가</p>
                     <div className="bc-btn-group">
                       <button className="bc-upload-btn camera-btn" onClick={() => triggerUpload('album', 'camera')}>카메라 촬영</button>
                       <button className="bc-upload-btn gallery-btn" onClick={() => triggerUpload('album', 'gallery')}>갤러리 첨부</button>
                     </div>
                   </div>
                 </div>

                 {/* 🌟 [수정 완료] DB에서 가져온 기록들 반복 출력 (DTO 필드명 및 URL 연동) */}
                 {albumRecords.map((record) => (
                   <div key={record.bcNum} className="bc-album-item">
                     <div className="bc-item-header">
                       <span className="bc-item-date">{record.bcDate}</span>
                       <button className="bc-delete-btn" onClick={() => handleDeleteRecord(record.bcNum)}>🗑️ 삭제</button>
                     </div>
                     <div className="bc-image-placeholder">
                       <img src={`${SERVER_URL}${record.bcImagePath}`} alt="눈바디" className="bc-preview-img" />
                     </div>
                   </div>
                 ))}
               </div>
            )}

            {/* --- 비교 탭 --- */}
            {activeTab === 'compare' && (
              <div className="bc-compare-wrapper">
                <div className="bc-compare-header">
                  <p className="bc-compare-dates">{leftDate} ➔ {rightDate}</p>
                </div>
                <div className="bc-compare-content">
                  
                  {/* Before */}
                  <div className="bc-compare-item">
                    <div className="bc-compare-label"><strong>전 (Before)</strong></div>
                    <div className="bc-image-placeholder" style={{position: 'relative'}}>
                      {leftPreview ? (
                        <>
                          <img src={leftPreview} alt="과거" className="bc-preview-img" />
                          <button 
                            onClick={() => { setLeftPreview(null); setLeftDate('과거 날짜'); }} 
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', zIndex: 10 }}
                          >✕</button>
                        </>
                      ) : (
                        <>
                          <div style={{fontSize: '36px', color: '#ffb6c1', marginBottom: '10px'}}>📸</div>
                          <p style={{color: '#a3938c', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px'}}>이곳에 사진이 들어갑니다</p>
                          <div className="bc-btn-group">
                            <button className="bc-upload-btn album-sel-btn" onClick={() => openInternalAlbum('left')}>📁 앨범에서 선택</button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* After */}
                  <div className="bc-compare-item">
                    <div className="bc-compare-label"><strong>후 (After)</strong></div>
                    <div className="bc-image-placeholder" style={{position: 'relative'}}>
                      {rightPreview ? (
                        <>
                          <img src={rightPreview} alt="현재" className="bc-preview-img" />
                          <button 
                            onClick={() => { setRightPreview(null); setRightDate('오늘 날짜'); }} 
                            style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', zIndex: 10 }}
                          >✕</button>
                        </>
                      ) : (
                        <>
                          <div style={{fontSize: '36px', color: '#ffb6c1', marginBottom: '10px'}}>📸</div>
                          <p style={{color: '#a3938c', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px'}}>이곳에 사진이 들어갑니다</p>
                          <div className="bc-btn-group">
                            <button className="bc-upload-btn camera-btn" onClick={() => triggerUpload('compare-right', 'camera')}>카메라 촬영</button>
                            <button className="bc-upload-btn gallery-btn" onClick={() => triggerUpload('compare-right', 'gallery')}>갤러리 첨부</button>
                            <button className="bc-upload-btn album-sel-btn" onClick={() => openInternalAlbum('right')}>📁 앨범에서 선택</button>
                          </div>
                        </>
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
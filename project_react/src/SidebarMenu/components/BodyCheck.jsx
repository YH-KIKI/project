import React, { useState } from 'react';
import './BodyCheck.css';

const BodyCheck = () => {
  // 🌟 핵심: 현재 선택된 탭 상태 관리 ('album' 또는 'compare')
  const [activeTab, setActiveTab] = useState('album');

  const albumRecords = [
    { id: 1, date: '2024.05.20' },
    { id: 2, date: '2024.04.20' },
    { id: 3, date: '2024.04.10' },
    { id: 4, date: '2024.03.20' },
  ];

  // 이제 공간이 넓어졌으니 버튼 글씨를 다시 시원하게 보여줍니다!
  const ImagePlaceholder = () => (
    <div className="bc-image-placeholder">
      <button className="bc-upload-btn">📷 휴대폰 카메라로 찍기</button>
      <button className="bc-upload-btn">📁 앨범에서 선택하기</button>
    </div>
  );

  return (
    <div className="body-check-wrapper">
      <div className="bc-header-area">
        <h2 className="bc-main-title">눈바디(Body Check) 앨범</h2>
        <span className="bc-header-date">2024.05.20 월</span>
      </div>

      <div className="bc-main-card">
        {/* 🌟 1. 통계 페이지 스타일의 탭 메뉴 */}
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

        {/* 🌟 2. 선택된 탭에 따라 아래 공간을 꽉 차게 사용합니다 */}
        <div className="bc-content-card">
          
          {/* --- [눈바디 앨범 탭 내용] --- */}
          {activeTab === 'album' && (
            <>
              {/* 넓어진 공간에 맞춰 2칸짜리 그리드로 앨범을 예쁘게 정렬 */}
              <div className="bc-album-grid">
                {albumRecords.map((record) => (
                  <div key={record.id} className="bc-album-item">
                    <div className="bc-item-header">
                      <span className="bc-item-date">{record.date}</span>
                      <span className="bc-camera-icon">📷</span>
                    </div>
                    <ImagePlaceholder />
                  </div>
                ))}
              </div>
              <div className="bc-button-wrapper">
                <button className="bc-primary-btn">+ 새로운 눈바디 추가</button>
              </div>
            </>
          )}

          {/* --- [변화 비교 탭 내용] --- */}
          {activeTab === 'compare' && (
            <>
              <div className="bc-compare-header">
                <p className="bc-compare-dates">2024.04.20 → 2024.05.20</p>
              </div>
              <div className="bc-compare-content">
                <div className="bc-compare-item">
                  <ImagePlaceholder />
                  <div className="bc-compare-label">
                    <strong>전</strong>
                    <span>2024.04.20</span>
                  </div>
                </div>
                
                <div className="bc-compare-item">
                  <ImagePlaceholder />
                  <div className="bc-compare-label">
                    <strong>후</strong>
                    <span>2024.05.20</span>
                  </div>
                </div>
              </div>
              <div className="bc-button-wrapper">
                <button className="bc-primary-btn">비교 완료</button>
              </div>
            </>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default BodyCheck;
import React from 'react';
import Sidebar from './Sidebar'; 
import './MainLayout.css'; 
import { useNavigate, Outlet } from 'react-router-dom';

const MainLayout = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login'); 
  };

  return (
    <div className="page-background">
      <div className="app-wrapper">
        
        {/* 껍데기 1: 왼쪽 메뉴 */}
        <Sidebar />

        <main className="main-content">
          {/* 껍데기 2: 상단 헤더 */}
          <header className="top-header">
            <h2 className="header-title">냠냠플래닛</h2>
            <div className="header-icons">
              <button style={{ 
                padding: '10px 30px', 
                backgroundColor: '#d1b8a0', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer'
              }} onClick={handleLoginClick}>
                로그인/로그아웃
              </button>
              <button className="icon-btn">🔔</button>
              <div className="profile-icon">👩‍🍳</div>
            </div>
          </header>
          
          {/* 🌟 핵심: 여기에 Dashboard나 DietRecommendation이 들어옵니다! */}
          <div className="content-area" style={{ paddingBottom: '40px' }}>
             <Outlet /> 
          </div>

        </main>
      </div>
    </div>
  );
};

export default MainLayout;
import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar'; 
import './MainLayout.css'; 
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 로그인 후 헤더 상태를 즉시 반영하기 위한 도구

  // 토큰 존재 여부를 체크하는 상태 추가
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 화면이 켜질 때나, 주소(경로)가 바뀔 때마다 토큰 체크
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [location]); // 로그인 성공해서 메인으로 리다이렉트 되었을 때 글자를 바로 로그아웃으로 바꾸기 위해 location을 추적합니다.

  // 버튼 클릭 시 행동 분기
  const handleAuthClick = () => {
    if (isLoggedIn) {
      //로그인 상태라면 ➡️ 로그아웃 처리
      if (window.confirm("로그아웃 하시겠습니까?")) {
        localStorage.clear(); // 토큰, 리프레시토큰, 유저정보 싹 비우기
        sessionStorage.clear();
        setIsLoggedIn(false);
        alert("로그아웃 되었습니다!");
        navigate('/'); // 메인 페이지(또는 로그인 페이지)로 강제 이동
      }
    } else {
      //비로그인 상태라면 ➡️ 로그인 페이지로 이동
      navigate('/login'); 
    }
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
              }} onClick={handleAuthClick}>
                {isLoggedIn ? '로그아웃' : '로그인'}
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
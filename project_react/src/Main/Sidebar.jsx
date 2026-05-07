// src/Main/Sidebar.jsx

import React from 'react';
import './Sidebar.css';
// 🌟 1. useNavigate 대신 현재 주소를 알려주는 useLocation을 가져옵니다.
import { Link, useLocation } from 'react-router-dom'; 

import catChefSidebarImg from '../images/냠냠이1.png';
import robotWinkSidebarImg from '../images/로봇1.png';

const Sidebar = ({ userName }) => {
  const location = useLocation(); // 🌟 2. 현재 웹브라우저의 주소창 경로를 가져옵니다.

  // active: false 부분은 지웠습니다. 아래 반복문에서 자동으로 계산할 거예요!
  const menuItems = [
    { name: '대시보드', icon: '🏠', path: '/' },
    { name: '식단 기록', icon: '📝', path: '/record' },
    { name: 'AI 분석', icon: '✨', path: '/analyze' }, // 👈 배열 안에 이미 완벽하게 있습니다!
    { name: 'AI 식단 추천', icon: '🥗', path: '/recommend' }, 
    { name: '목표 관리', icon: '❤️', path: '/goal' },
    { name: '통계', icon: '📊', path: '/stats' },
    { name: '마이페이지', icon: '👤', path: '/mypage' },
  ];

  return (
    <aside className="sidebar">
      
      {/* 메뉴 상단 고양이 이미지 */}
      <div className="sidebar-cat-eating">
        <Link to="/">
          <img 
            src={catChefSidebarImg} 
            alt="메뉴 고양이 밥먹는 모습" 
            style={{ cursor: 'pointer' }} 
          />
        </Link>
      </div>

      <nav className="sidebar-menu">
        <ul>
          {menuItems.map((menu, index) => {
            // 3. 현재 주소(location.pathname)가 메뉴의 주소(menu.path)와 같으면 true!
            // 이렇게 하면 내가 누른 메뉴에만 자동으로 'active' 디자인이 적용됩니다.
            const isActive = location.pathname === menu.path;

            return (
              <li 
                key={index} 
                className={`menu-item ${isActive ? 'active' : ''}`}
              >
                <Link 
                  to={menu.path} 
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit', 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: '100%' 
                  }}
                >
                  <span className="menu-icon">{menu.icon}</span>
                  <span className="menu-name">{menu.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 메뉴 하단 로봇 이미지 & 응원 문구 */}
      <div className="sidebar-robot-wink">
        <img src={robotWinkSidebarImg} alt="메뉴 하단 윙크 로봇" />
      </div>
      <div className="sidebar-footer">
        <div className="cheer-balloon-sm">
          오늘도<br/>건강한 한 끼<br/>함께해요! 💚
        </div>
      </div>
      
    </aside>
  );
};

export default Sidebar;
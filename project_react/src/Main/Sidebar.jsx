// src/Main/Sidebar.jsx

import React from 'react';
import './Sidebar.css';
import { useNavigate, Link } from 'react-router-dom';

// 🌟 추가됨: src/images/ 폴더 안에 있는 메뉴 고양이와 로봇 이미지를 불러옵니다.
import catChefSidebarImg from '../images/냠냠이1.png';
import robotWinkSidebarImg from '../images/로봇1.png';

const Sidebar = ({ userName }) => {
  // 🌟 1. 각 메뉴마다 이동할 주소(path)를 추가해 줍니다.
  const menuItems = [
    { name: '대시보드', icon: '🏠', active: true, path: '/' },
    { name: '식단 기록', icon: '📝', active: false, path: '/record' },
    { name: 'AI 분석', icon: '✨', active: false, path: '/analyze' },
    { name: 'AI 식단 추천', icon: '🥗', active: false, path: '/recommend' }, // 👈 AI 식단 추천 주소!
    { name: '목표 관리', icon: '❤️', active: false, path: '/goal' },
    { name: '통계', icon: '📊', active: false, path: '/stats' },
    { name: '마이페이지', icon: '👤', active: false, path: '/mypage' },
  ];

  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      
      {/* 메뉴 상단 고양이 이미지 (이전과 동일) */}
      <div className="sidebar-cat-eating">
        <Link to="/">
          <img 
            src={catChefSidebarImg} 
            alt="메뉴 고양이 밥먹는 모습" 
            style={{ cursor: 'pointer' }} 
          />
        </Link>
      </div>

      {/* 🌟 2. 메뉴 리스트에 Link 태그 적용 */}
      <nav className="sidebar-menu">
        <ul>
          {menuItems.map((menu, index) => (
            <li 
              key={index} 
              className={`menu-item ${menu.active ? 'active' : ''}`}
              onClick={() => navigate(menu.path)}
            >
              {/* Link 태그로 감싸서 해당 path로 이동하게 만듭니다 */}
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
          ))}
        </ul>
      </nav>

      {/* 메뉴 하단 로봇 이미지 & 응원 문구 (이전과 동일) */}
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
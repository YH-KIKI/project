// src/Main/Sidebar.jsx (위치 수정 완료 버전)

import React from 'react';
import './Sidebar.css';

// 🌟 추가됨: src/images/ 폴더 안에 있는 메뉴 고양이와 로봇 이미지를 불러옵니다.
import catChefSidebarImg from '../images/냠냠이1.png';
import robotWinkSidebarImg from '../images/로봇1.png';

const Sidebar = ({ userName }) => {
  // 메뉴 데이터를 배열로 관리합니다. (텍스트 깨짐 해결 예시)
  const menuItems = [
    { name: '대시보드', icon: '🏠', active: true },
    { name: '식단 기록', icon: '📝', active: false },
    { name: 'AI 분석', icon: '✨', active: false },
    { name: '식단 추천', icon: '🥗', active: false },
    { name: '목표 관리', icon: '❤️', active: false },
    { name: '통계', icon: '📊', active: false },
    { name: '마이페이지', icon: '👤', active: false },
  ];

  return (
    <aside className="sidebar">
      
      {/* ★ 추가됨: 와이어프레임 위치 1-1: 메뉴 상단 고양이 이미지 ★ */}
      <div className="sidebar-cat-eating">
        <img src={catChefSidebarImg} alt="메뉴 고양이 밥먹는 모습" />
      </div>

      {/* 메뉴 리스트 영역 (기존 코드) */}
      <nav className="sidebar-menu">
        <ul>
          {menuItems.map((menu, index) => (
            <li 
              key={index} 
              className={`menu-item ${menu.active ? 'active' : ''}`}
            >
              <span className="menu-icon">{menu.icon}</span>
              <span className="menu-name">{menu.name}</span>
            </li>
          ))}
        </ul>
      </nav>

      {/* ★ 추가됨: 와이어프레임 위치 2-1: 메뉴 하단 로봇 이미지 ★ */}
      <div className="sidebar-robot-wink">
        <img src={robotWinkSidebarImg} alt="메뉴 하단 윙크 로봇" />
      </div>

      {/* 기존 하단 응원 영역 */}
      <div className="sidebar-footer">
        <div className="cheer-balloon-sm">
          오늘도<br/>
          건강한 한 끼<br/>
          함께해요! 💚
        </div>
      </div>
      
    </aside>
  );
};

export default Sidebar;
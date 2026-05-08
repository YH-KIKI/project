import React, { useState } from 'react';
import './Sidebar.css';
// 🌟 1. 중복된 import를 하나로 깔끔하게 합쳤습니다.
import { useNavigate, Link, useLocation } from 'react-router-dom';

import catChefSidebarImg from '../images/냠냠이1.png';
import robotWinkSidebarImg from '../images/로봇1.png';

const Sidebar = ({ userName }) => {
  const location = useLocation();
  // 🌟 2. 페이지 이동을 위한 navigate 함수를 다시 살려냈습니다!
  const navigate = useNavigate(); 

  const [openMenu, setOpenMenu] = useState(null);

  const menuItems = [
    { name: '대시보드', icon: '🏠', path: '/' },  
    { name: '식단 기록', icon: '📝', path: '/record' },
    { name: 'AI 분석', icon: '✨', path: '/analyze' },
    {
      name: 'AI 식단 추천',
      icon: '🥗',
      children: [
        { name: 'AI 추천 식단', path: '/recommend' },
        { name: '냉장고 추천', path: '/fridge-recommend' },
      ],
    },
    { name: '목표 관리', icon: '❤️', path: '/goal' },
    { name: '통계', icon: '📊', path: '/stats' },
    { name: '눈바디', icon: '📷', path: '/bodycheck' },
    { name: '마이페이지', icon: '👤', path: '/mypage' },
    { name: '커뮤니티', icon: '💬', active: false, path: '/community' },//게시판 메뉴 추가했다리
    { name: '마이페이지', icon: '👤', active: false, path: '/mypage' },
    { name: '식단즐찾(삭제예정)', icon: '👤', path: '/favorite' },
  ];

  const handleParentClick = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  return (
    <aside className="sidebar">
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
          {menuItems.map((menu) => {
            const hasChildren = !!menu.children;
            const isOpen = openMenu === menu.name;

            const isActive =
              menu.path === location.pathname ||
              menu.children?.some((child) => child.path === location.pathname);

            return (
              <li key={menu.name} className="menu-group">
                <div
                  className={`menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    if (hasChildren) {
                      handleParentClick(menu.name);
                    } else {
                      // 🌟 이제 여기서 에러 없이 정상적으로 페이지가 이동됩니다.
                      navigate(menu.path); 
                    }
                  }}
                >
                  <span className="menu-icon">{menu.icon}</span>
                  <span className="menu-name">{menu.name}</span>

                  {hasChildren && (
                    <span className={`menu-arrow ${isOpen ? 'open' : ''}`}>
                      ▾
                    </span>
                  )}
                </div>

                {hasChildren && isOpen && (
                  <ul className="submenu">
                    {menu.children.map((child) => (
                      <li
                        key={child.name}
                        className={`submenu-item ${
                          location.pathname === child.path ? 'active' : ''
                        }`}
                        onClick={() => navigate(child.path)}
                      >
                        {child.name}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

     <div className="sidebar-footer">
        {/* 🌟 1. 로봇과 말풍선을 함께 감싸는 새로운 묶음 박스를 만듭니다 */}
        <div className="sidebar-bot-group">
          
          {/* 말풍선 */}
          <div className="cheer-balloon-sm">
            오늘도<br />건강한 한 끼<br />함께해요! 💚
          </div>
          
          {/* 🌟 2. 밖에서 방황하던 로봇을 이 그룹 안, 말풍선 바로 밑으로 데려옵니다 */}
          <div className="sidebar-robot-wink">
            <img src={robotWinkSidebarImg} alt="메뉴 하단 윙크 로봇" />
          </div>

        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
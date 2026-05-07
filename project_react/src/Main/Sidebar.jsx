// src/Main/Sidebar.jsx

import React, {useState} from 'react';
import './Sidebar.css';
// 🌟 1. useNavigate 대신 현재 주소를 알려주는 useLocation을 가져옵니다.
import { Link, useLocation } from 'react-router-dom'; 
import { useNavigate, Link, useLocation } from 'react-router-dom';

import catChefSidebarImg from '../images/냠냠이1.png';
import robotWinkSidebarImg from '../images/로봇1.png';

const Sidebar = ({ userName }) => {

  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState(null);

  // 🌟 1. 각 메뉴마다 이동할 주소(path)를 추가해 줍니다.
  const menuItems = [
    { name: '대시보드', icon: '🏠', active: true, path: '/' },  
    { name: '식단 기록', icon: '📝', active: false, path: '/record' },
    { name: 'AI 분석', icon: '✨', active: false, path: '/analyze' },
    {
      name: 'AI 식단 추천',
      icon: '🥗',
      children: [
        { name: 'AI 추천 식단', path: '/recommend' },
        { name: '냉장고 추천', path: '/fridge-recommend' },
      ],
    },
    { name: '목표 관리', icon: '❤️', active: false, path: '/goal' },
    { name: '통계', icon: '📊', active: false, path: '/stats' },
    { name: '마이페이지', icon: '👤', active: false, path: '/mypage' },
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

        <div className="sidebar-robot-wink">
          <img src={robotWinkSidebarImg} alt="메뉴 하단 윙크 로봇" />
        </div>

        <div className="sidebar-footer">
          <div className="cheer-balloon-sm">
            오늘도<br />건강한 한 끼<br />함께해요! 💚
          </div>
        </div>
      </aside>
    );
  };

export default Sidebar;
import React, { useState, useEffect } from 'react';
import Sidebar from '../Main/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CharacterSection from './CharacterSection'; // 분리한 컴포넌트 임포트

const Mypage = () => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [charInfo, setCharInfo] = useState(null);

  const navigate = useNavigate();

  const handlefavoriteClick = () => {
    navigate('/favoritemeal');
  };

  const handleInformationClick = () => {
    navigate('/information');
  };

  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} ${days[today.getDay()]}요일`;

  // 데이터 로딩 함수 보정
  const fetchUserInfo = async () => {
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    
    if (!token) return;

    try {
      // 1. 유저 정보 가져오기
      const userResponse = await axios.get('http://localhost:8080/api/user/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = userResponse.data;
      setUsername(userData.username);

      // 2. 캐릭터 정보 가져오기 (데이터 존재 여부 확실히 체크)
      if (userData && userData.usernum) {
        const charResponse = await axios.get(`http://localhost:8080/api/character/info?userNum=${userData.usernum}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // 데이터를 state에 반영하여 CharacterSection이 리렌더링되게 함
        setCharInfo(charResponse.data);
      } else {
        console.error("유저 번호(usernum)를 찾을 수 없습니다.", userData);
      }

    } catch (error) {
      console.error("데이터 로딩 실패:", error);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    if (token) {
      setIsLoggedIn(true);
      fetchUserInfo();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('login_token');
    setIsLoggedIn(false);
    navigate('/');
  }

  return (
    <div className="page-background">
      <div className="app-wrapper">
        <Sidebar />

        <main style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          padding: '40px', 
          borderRadius: '20px', 
          textAlign: 'center',
          border: '2px solid #d1b8a0',
          position: 'relative',
          height: '800px', width: '62%', top: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <a href="/" style={{ 
            fontSize: '20px', position: 'absolute', top: '0', right: '80px', width: '20%', 
          }} onClick={handleLogout}>↪️ 로그아웃</a>
          
          <a href="/" style={{ 
            fontSize: '20px', position: 'absolute', top: '0', right: '30px', width: '10%', 
          }}>🔔</a>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontWeight: '600' }}>사용자: {username}</span>
            <span style={{ color: '#999' }}>{formattedDate}</span>
          </div>

          {/* --- 분리된 캐릭터 섹션 컴포넌트 적용 --- */}
          {/* onUpdate에 fetchUserInfo를 넘겨 변경 시 정보를 다시 읽어오게 함 */}
          <CharacterSection charInfo={charInfo} onUpdate={fetchUserInfo} />

          <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '18px' }}>
            {username}님, 오늘도 건강한 식단 관리 함께해요!
          </p>

          <div style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '30px',
          }}>
            <div style={menuItemStyle} onClick={handleInformationClick}>
              <div style={{ fontSize: '40px', marginBottom: '6px' }}>👤✏️</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>개인정보 수정</div>
              <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>이름, 연락처, 사진 관리</div>
            </div>

            <div style={menuItemStyle}>
              <div style={{ fontSize: '40px', marginBottom: '6px' }}>🏹🎯</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>목표 관리</div>
              <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>목표를 관리하세요</div>
            </div>

            <div style={menuItemStyle}>
              <div style={{ fontSize: '40px', marginBottom: '6px' }}>🏅</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>내 뱃지</div>
              <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>나의 영광 나의 뱃지</div>
            </div>

            <div style={menuItemStyle} onClick={handlefavoriteClick}>
              <div style={{ fontSize: '40px', marginBottom: '6px' }}>⭐</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>즐겨찾기</div>
              <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>뭐좀 맛있는거 있냥?</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const menuItemStyle = {
  border: '1px solid #FFDADA',
  borderRadius: '30px',
  padding: '24px',
  textAlign: 'center',
  cursor: 'pointer',
};

export default Mypage;
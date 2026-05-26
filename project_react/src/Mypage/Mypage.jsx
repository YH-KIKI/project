import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Main/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CharacterSection from './CharacterSection';
import CharacterInfo from './CharacterInfo';
import Badge from './Badge'; // 뱃지 모달 컴포넌트 추가
import './Mypage.css'; // 🌟 외부 분리된 CSS 불러오기

const Mypage = () => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [charInfo, setCharInfo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // 🛠️ 에러 수정: 누락된 모달 상태(State) 추가!
  const hasAlerted = useRef(false);

  const navigate = useNavigate();

  // 환경 변수 주소를 가져옵니다 (로컬은 localhost:8080 / 배포는 AWS 주소 자동 적용)
  const apiUrl = process.env.REACT_APP_API_URL || '';

  const handlefavoriteClick = () => {
    navigate('/favoritemeal');
  };

  const handleInformationClick = () => {
    navigate('/information');
  };

  const handleTargetClick = () => {
    navigate('/targetgoals');
  };

  // 모달 열기/닫기 제어 함수
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];

  const formattedDate =
    `${today.getFullYear()}.` +
    `${String(today.getMonth() + 1).padStart(2, '0')}.` +
    `${String(today.getDate()).padStart(2, '0')} ` +
    `${days[today.getDay()]}요일`;

  const fetchUserInfo = async () => {
    const token =
      localStorage.getItem('login_token') ||
      sessionStorage.getItem('login_token');

    if (!token) return;

    try {
      // [수정] 유저 정보 조회 API 주소에 환경 변수(apiUrl) 결합
      const userResponse = await axios.get(`${apiUrl}/api/user/info`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = userResponse.data;
      setUsername(userData.username);

      if (userData && userData.usernum) {
        // [수정] 캐릭터 정보 조회 API 주소에 환경 변수(apiUrl) 결합
        const charResponse = await axios.get(`${apiUrl}/api/character/info?userNum=${userData.usernum}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCharInfo(charResponse.data);
      } 
    } catch (error) {
      console.error("데이터 로딩 실패:", error);

      if (error.response && (error.response.status === 401 || error.response.status === 500)) {
        if (!hasAlerted.current) {
          alert("인증 시간이 만료되었습니다. 다시 로그인해주세요! 🏃‍♂️");
          hasAlerted.current = true;
          handleLogout(); 
        }
      }
    }
  };

  useEffect(() => {
    const token =
      localStorage.getItem('login_token') ||
      sessionStorage.getItem('login_token');

    if (token) {
      setIsLoggedIn(true);
      fetchUserInfo();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('login_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('login_token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  return (
    <>
      {/* 상단 회원 정보 및 날짜 */}
      <div className="mypage-header">
        <span className="user-name">사용자: {username}</span>
        <span className="today-date">{formattedDate}</span>
      </div>

      {/* 캐릭터 섹션 영역 */}
      <div className="character-container">
        <CharacterSection charInfo={charInfo} onUpdate={fetchUserInfo} />
        <CharacterInfo /> 
      </div>

      {/* 인사말 문구 */}
      <p className="welcome-text">
        {username}님, 오늘도 건강한 식단 관리 함께해요!
      </p>

      {/* 메뉴 그리드 (2x2) */}
      <div className="menu-grid">
        
        {/* 개인정보 수정 */}
        <div className="menu-card clickable" onClick={handleInformationClick}>
          <div className="card-icon">👤✏️</div>
          <div className="card-title">개인정보 수정</div>
          <div className="card-desc">이름, 연락처, 사진 관리</div>
        </div>

        {/* 목표 보기 */}
        <div className="menu-card clickable" onClick={handleTargetClick}>
          <div className="card-icon">🏹🎯</div>
          <div className="card-title">목표 보기</div>
          <div className="card-desc">오늘목표 달성도 보러가자!</div>
        </div>

        {/* 내 뱃지 (클릭 시 모달이 열리도록 변경) */}
        <div className="menu-card clickable" onClick={openModal}>
          <div className="card-icon">🏅</div>
          <div className="card-title">내 뱃지</div>
          <div className="card-desc">나의 영광 나의 뱃지</div>
        </div>

        {/* 즐겨찾기 */}
        <div className="menu-card clickable" onClick={handlefavoriteClick}>
          <div className="card-icon">⭐</div>
          <div className="card-title">즐겨찾기</div>
          <div className="card-desc">뭐좀 맛있는거 있냥?</div>
        </div>

      </div>

      {/* 🛠️ 모달 컴포넌트 연동: 상태가 true일 때만 화면에 Badge 모달이 표시되도록 처리 */}
      {isModalOpen && <Badge isOpen={isModalOpen} onClose={closeModal} />}
    </>
  );
};

export default Mypage;
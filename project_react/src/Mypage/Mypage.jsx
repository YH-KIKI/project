// import React, { useState, useEffect, useRef } from 'react';
// import Sidebar from '../Main/Sidebar';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import CharacterSection from './CharacterSection'; 
// import CharacterInfo from './CharacterInfo'; 

// const Mypage = () => {
//   const [username, setUsername] = useState('');
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [charInfo, setCharInfo] = useState(null);
//   const hasAlerted = useRef(false);

//   const navigate = useNavigate();

//   const handlefavoriteClick = () => {
//     navigate('/favoritemeal');
//   };

//   const handleInformationClick = () => {
//     navigate('/information');
//   };

//   const handleTargetClick = () => {
//     navigate('/targetgoals');
//   };

//   const today = new Date();
//   const days = ['일', '월', '화', '수', '목', '금', '토'];
//   const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} ${days[today.getDay()]}요일`;

//   const fetchUserInfo = async () => {
//     const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    
//     if (!token) return;

//     try {
//       const userResponse = await axios.get('/api/user/info', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const userData = userResponse.data;
//       setUsername(userData.username);

//       if (userData && userData.usernum) {
//         const charResponse = await axios.get(`/api/character/info?userNum=${userData.usernum}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setCharInfo(charResponse.data);
//       } 
//     }catch (error) {
//       //이 부분을 수정합니다!
//       console.error("데이터 로딩 실패:", error);

//       // 만약 서버에서 401(인증안됨) 혹은 500(서버에러-토큰파싱실패)이 오면 쫓아냅니다.
//       if (error.response && (error.response.status === 401 || error.response.status === 500)) {
//         if (!hasAlerted.current) {
//           alert("인증 시간이 만료되었습니다. 다시 로그인해주세요! 🏃‍♂️");
//           hasAlerted.current = true;
//           handleLogout(); // 👈 이미 만들어두신 로그아웃 함수 실행!
//         }
//     }
//   }
// }

//   useEffect(() => {
//     const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
//     if (token) {
//       setIsLoggedIn(true);
//       fetchUserInfo();
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('login_token');
//     localStorage.removeItem('refresh_token');
//     sessionStorage.removeItem('login_token');
//     setIsLoggedIn(false);
//     navigate('/login');
//   }

//   return (
//         <>
//           <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
//             <span style={{ fontWeight: '600' }}>사용자: {username}</span>
//             <span style={{ color: '#999' }}>{formattedDate}</span>
//           </div>

//           {/* --- 캐릭터 섹션 영역 (여기에 물음표와 도감 버튼이 배치됨) --- */}
//           <div style={{ width: '100%', position: 'relative' }}>
//             <CharacterSection charInfo={charInfo} onUpdate={fetchUserInfo} />
//             {/* 위치 보정된 CharacterInfo 호출 */}
//             <CharacterInfo /> 
//           </div>

//           <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '18px', marginTop: '40px' }}>
//             {username}님, 오늘도 건강한 식단 관리 함께해요!
//           </p>
//           <div
//             style={{
//               width: '100%',
//               display: 'grid',
//               gridTemplateColumns: '1fr 1fr',
//               gap: '20px',
//               marginBottom: '30px',
//             }}
//           >
//           <div style={{
//             border: '1px solid #FFDADA',
//             borderRadius: '30px',
//             padding: '24px',
//             textAlign: 'center',
//             cursor: 'pointer',
//           }}
//             onClick={handleInformationClick}>
//             <div style={{ fontSize: '40px', marginBottom: '6px' }}>👤✏️</div>
//             <div style={{ fontWeight: 'bold', fontSize: '16px' }}>개인정보 수정</div>
//             <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>
//               이름, 연락처, 사진 관리
//             </div>
//           </div>

//           <div style={{
//             border: '1px solid #FFDADA',
//             borderRadius: '30px',
//             padding: '24px',
//             textAlign: 'center',
//             cursor: 'pointer',
//           }}
//             onClick={handleTargetClick}>
//             <div style={{ fontSize: '40px', marginBottom: '6px' }}>🏹🎯</div>
//             <div style={{ fontWeight: 'bold', fontSize: '16px' }}>목표 보기</div>
//             <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>
//               오늘목표 달성도 보려가자!
//             </div>
//           </div>

//           <div style={{
//             border: '1px solid #FFDADA',
//             borderRadius: '30px',
//             padding: '24px',
//             textAlign: 'center',
//           }}>
//             <div style={{ fontSize: '40px', marginBottom: '6px' }}>🏅</div>
//             <div style={{ fontWeight: 'bold', fontSize: '16px' }}>내 뱃지</div>
//             <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>
//               나의 영광 나의 뱃지
//             </div>
//           </div>

//           <div style={{
//             border: '1px solid #FFDADA',
//             borderRadius: '30px',
//             padding: '24px',
//             textAlign: 'center',
//             cursor: 'pointer',
//           }}
//             onClick={handlefavoriteClick}>
//             <div style={{ fontSize: '40px', marginBottom: '6px' }}>⭐</div>
//             <div style={{ fontWeight: 'bold', fontSize: '16px' }}>즐겨찾기</div>
//             <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>
//               뭐좀 맛있는거 있냥?
//             </div>
//           </div>
//           </div>
//         </>
//   );
// };

// const menuItemStyle = {
//   border: '1px solid #FFDADA',
//   borderRadius: '30px',
//   padding: '24px',
//   textAlign: 'center',
//   cursor: 'pointer',
// };

// export default Mypage;

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Main/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CharacterSection from './CharacterSection'; 
import CharacterInfo from './CharacterInfo'; 
import './Mypage.css'; // 🌟 외부 분리된 CSS 불러오기

const Mypage = () => {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [charInfo, setCharInfo] = useState(null);
  const hasAlerted = useRef(false);

  const navigate = useNavigate();

  const handlefavoriteClick = () => {
    navigate('/favoritemeal');
  };

  const handleInformationClick = () => {
    navigate('/information');
  };

  const handleTargetClick = () => {
    navigate('/targetgoals');
  };

  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} ${days[today.getDay()]}요일`;

  const fetchUserInfo = async () => {
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    
    if (!token) return;

    try {
      const userResponse = await axios.get('/api/user/info', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = userResponse.data;
      setUsername(userData.username);

      if (userData && userData.usernum) {
        const charResponse = await axios.get(`/api/character/info?userNum=${userData.usernum}`, {
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
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
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

        {/* 내 뱃지 (클릭 이벤트 없음) */}
        <div className="menu-card">
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
    </>
  );
};

export default Mypage;
import React, { useState, useEffect } from 'react';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css'; // 🌟 배경 이미지가 들어있는 CSS를 가져옵니다!
import './LoginPage.css';        // 🌟 새롭게 분리한 로그인 페이지 전용 CSS를 가져옵니다!
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {

  // --- 여기부터 카카오톡 ---
  const KAKAO_REST_API_KEY = "진짜 API 키"; // 여기에 아까 복사한 진짜 키를 붙여넣으세요!
  const KAKAO_REDIRECT_URI = "http://localhost:3000/kakao-callback";
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;

  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL; // 버튼 누르면 카카오 로그인 창으로 날려주는 내비게이션 역할!
  };
  //------------------------------------------------------
  const [username, setUsername] = useState('');
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleProtectedFeature = async () => {
    // 1. 토큰 가져오기
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    
    if (!token) {
      alert("🛑 토큰이 없습니다. 로그인해주세요.");
      setIsLoggedIn(false);
      return;
    }

    try {
      // 2. 서버에 "이 토큰 아직 쓸 수 있어?"라고 물어보기 (가장 확실한 방법)
      await axios.get('/api/user/info', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. 서버가 200(OK)를 주면 그제야 기능 실행
      alert("✅ 실제 서버 인증 완료! 비밀 기능을 실행합니다.");
      
    } catch (error) {
      // 4. 서버가 401(만료)을 주면 여기서 걸러짐!
      if (error.response && error.response.status === 401) {
        alert("⏰ 인증 시간이 만료되었습니다. 자동으로 로그아웃됩니다.");
      } else {
        alert("❌ 인증에 실패했습니다.");
      }
      handleLogout(); // 👈 여기서 false로 바꿔야 화면이 로그인창으로 돌아감!
    }
  };

  const fetchUserInfo = async () => {
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token'); // 저장된 토큰 꺼내기
    if (!token) return;

    try {
      const response = await axios.get('/api/user/info', {
        headers: {
          Authorization: `Bearer ${token}` // 핵심: 헤더에 '나 토큰 가졌어!'라고 증명
        }
      });
      alert(`서버 응답: ${response.data.username}님, 환영합니다!`);
      navigate('/');
    } catch (error) {
      if (error.response && error.response.status === 401) {
          handleLogout(); // 👈 강제 로그아웃 함수 호출!
      } else {
          alert("인증 오류가 발생했습니다.");
          handleLogout();
      }
    }
  };
  
  // 페이지가 새로고침되어도 토큰이 있으면 로그인 유지
  useEffect(() => {
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      //axios.
      //status: 서버 응답 코드 (예: 200, 404)
      //headers: 서버가 보낸 헤더 정보
      //data: 서버가 진짜로 보내준 핵심 내용물 (JSON)
      //config: 요청 설정 정보
      const response = await axios.post('/api/login', {
        username: username,
        userid: userid,
        password: password
      });

      const { token, refreshToken, user } = response.data;
      
      if (rememberMe) {
        // 받은 토큰을 브라우저에 저장
        localStorage.setItem('login_token', token);
      } else {
        // 브라우저 끄면 바로 삭제!
        sessionStorage.setItem('login_token', token);
      }

      // [준성] refreshToken 추가
      localStorage.setItem('refresh_token', refreshToken);
      // 🌟🌟🌟 [박하] 커뮤니티 게시판에서 사용자 식별을 위해 서버에서 받은 사용자 정보를 'user' 키로 저장
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // [재근]눈바디(BodyCheck) 등에서 바로 꺼내 쓸 수 있도록 userNum만 따로 저장.
      localStorage.setItem('userNum', user.user_num);

      // 2. 로그인 상태를 '참'으로 변경
      setIsLoggedIn(true);
      alert("로그인 성공!");
      fetchUserInfo();
    } catch (error) {
      alert("로그인 실패! 아이디와 비밀번호를 확인하세요.");
    }
  };

  const handleLogout = () => {
    // 로그아웃 시 토큰 삭제 및 상태 변경
    localStorage.removeItem('login_token');

    // 🌟🌟🌟 [박하] 로그아웃 시 저장된 사용자 정보도 함께 삭제
    localStorage.removeItem('user');

    setIsLoggedIn(false);
  };

  const navigate = useNavigate();
  return (
    /* 🌟 page-background 클래스를 주면 전체 배경 이미지가 나타납니다! */
    <div className="page-background">
      <div className="app-wrapper">
        {/* 앱 내부의 왼쪽: 사이드바 */}
        <Sidebar />
        
        {/* 로그인 박스 (클래스 분리 완료) */}
        <div className="login-box">
          <h1>로그인</h1>
          <h2 className="login-subtitle">냠냠플래닛 로그인</h2>
          <p>맛있는 다이어트의 시작! 로그인 해주세요.</p>
          
          {/* 회원 전용 기능 테스트 영역 */}
          <div className="test-button-container">
            <button onClick={handleProtectedFeature}>회원 전용 기능 테스트</button>
            <button onClick={() => alert("누구나 누를 수 있는 버튼")}>일반 기능</button>
          </div>

          {/* 아이디/비밀번호 입력 폼 영역 */}
          <div>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="아이디" 
                className="login-input mb-10" 
                onChange={(e) => setUserid(e.target.value)}
              /><br/>
              <input 
                type="password" 
                placeholder="비밀번호" 
                className="login-input"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {/* 로그인 유지 체크박스 */}
            <div className="remember-me-container">
              <input 
                type="checkbox" 
                id="rememberMe" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <label htmlFor="rememberMe" className="remember-me-label">빠른 로그인 (로그인 유지)</label>
            </div>
            
            {/* 일반 로그인 버튼 */}
            <button onClick={handleLogin} className="btn-login">
              로그인
            </button>

            {/* 카카오 로그인 버튼 */}
            <div className="kakao-btn-container">
              <button onClick={handleKakaoLogin} className="btn-kakao">
                카카오로 시작하기
              </button>
            </div>
          </div>

          <hr />
          
          {/* 회원가입 링크 */}
          <div className="signup-link-container">
            <span>아직 회원이 아니신가요? </span>
            <a 
              href="/register" 
              className="link-signup"
              onClick={(e) => {
                e.preventDefault();
                // 회원가입 페이지로 이동
                navigate('/signup');
                alert('회원가입 페이지로 이동합니다.');
              }}
            >
              회원가입
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
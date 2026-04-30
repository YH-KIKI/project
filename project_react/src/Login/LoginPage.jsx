import React, { useState, useEffect } from 'react';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css'; // 🌟 배경 이미지가 들어있는 CSS를 가져옵니다!
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {

  const [username, setUsername] = useState('');
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleProtectedFeature = () => {
  // 방법 1: isLoggedIn 변수로 확인하기
  if (!isLoggedIn) {
    alert("🛑 로그인이 필요한 기능입니다. 먼저 로그인해 주세요!");
    return; // 여기서 함수를 끝내버림 (기능 실행 안 됨)
  }

  // 로그인 된 경우에만 아래 코드가 실행됨
  alert("✅ 회원 인증 성공! 비밀 기능을 실행합니다.");
  // 여기에 진짜 하고 싶은 기능(AI 상담 열기 등)을 넣으세요.
  };

    const fetchUserInfo = async () => {
    const token = localStorage.getItem('login_token'); // 저장된 토큰 꺼내기

    try {
      const response = await axios.get('http://localhost:8080/api/user/info', {
        headers: {
          Authorization: `Bearer ${token}` // 핵심: 헤더에 '나 토큰 가졌어!'라고 증명
        }
      });
      alert(`서버 응답: ${response.data.username}님, 환영합니다!`);
    } catch (error) {
      alert("인증에 실패했습니다. 다시 로그인하세요.");
    }
  };
  
    // 페이지가 새로고침되어도 토큰이 있으면 로그인 유지
    useEffect(() => {
      const token = localStorage.getItem('login_token');
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
        const response = await axios.post('http://localhost:8080/api/login', {
          // username: username,
          userid: userid,
          password: password
        });
  
        const token = response.data.token;
        
        // 1. 받은 토큰을 브라우저에 저장
        localStorage.setItem('login_token', token);
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
      setIsLoggedIn(false);
    };

  const navigate = useNavigate();
  return (
    /* 🌟 page-background 클래스를 주면 전체 배경 이미지가 나타납니다! */
    <div className="page-background">
      <div className="app-wrapper">
        {/* 앱 내부의 왼쪽: 사이드바 */}
        <Sidebar />
        {/* 로그인 박스 */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          padding: '40px', 
          borderRadius: '20px', 
          textAlign: 'center',
          border: '2px solid #d1b8a0',
          position: 'relative',
          height: '800px', width: '62%', top: '20px',
          
        }}>
        {/* <div style={{ display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
           height: '100vh' }}> */}
          <h1>로그인</h1>
          <h2 style={{ color: '#5d4037'}}>냠냠플래닛 로그인</h2>
          <p>맛있는 다이어트의 시작! 로그인 해주세요.</p>
          
          <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
            <button onClick={handleProtectedFeature}>회원 전용 기능 테스트</button>
            <button onClick={() => alert("누구나 누를 수 있는 버튼")}>일반 기능</button>
          </div>

          {isLoggedIn ? (
            // 로그인 성공 시 보여줄 화면
            <div>
              <h2>🎉 환영합니다! 로그인 상태입니다.</h2>
              <p>브라우저 LocalStorage에 토큰이 안전하게 저장되었습니다.</p>
              <button onClick={handleLogout} style={{ padding: '10px 20px' }}>로그아웃</button>
            </div>
          ) : (
        //실험
        <div>
          <div style={{ margin: '20px 20px' }}>
            <input type="text" placeholder="아이디" 
            style={{ padding: '10px', width: '200px', marginBottom: '10px' }} 
            onChange={(e) => setUserid(e.target.value)}
            /><br/>
            <input type="password" placeholder="비밀번호" 
            style={{ padding: '10px', width: '200px' }}
            onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button onClick={handleLogin} 
          style={{ 
            padding: '10px 30px', 
            backgroundColor: '#d1b8a0', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            로그인
          </button>
        </div>//실험
          )}

          <hr></hr>
          {/*회원가입 링크*/}
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#5d4037' }}>
            <span>아직 회원이 아니신가요? </span>
            <a 
              href="/register" 
              style={{ 
                color: '#d1b8a0', 
                fontWeight: 'bold', 
                textDecoration: 'none',
                marginLeft: '5px'
              }}
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
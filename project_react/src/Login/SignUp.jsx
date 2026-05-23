import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css'; // 🌟 배경 이미지가 들어있는 CSS를 가져옵니다!
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {

  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate(); // 페이지 이동 함수

  const handleSignup = async () => {

    if (!userid || !password || !passwordConfirm || !username || !email) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (password.length > 10) {
    alert("비밀번호는 10자 이하만 가능합니다.");
    return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    
    //이메일 형식 검사 (정규표현식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다! (예: test@naver.com)");
      return;
    }

    try {
      // 1. 먼저 회원가입 API를 정상적으로 호출합니다.
      await axios.post('/api/signup', {
        userId: userid,
        userPassWord: password,
        userName: username,
        userEmail: email,
      });

      // 2. 🌟 [여기서부터 치트키] 가입 성공 직후, 방금 가입한 아이디/비번으로 로그인 API를 연달아 강제 호출합니다!
      // (사용자님 LoginPage.jsx에 있던 보낼 데이터 규격과 완벽하게 맞췄습니다.)
      const loginResponse = await axios.post('/api/login', {
        username: username, // 혹시 자바가 username을 요구할까봐 닉네임도 같이 토스
        userid: userid,     // 로그인용 아이디
        password: password  // 로그인용 비밀번호
      });

      // 3. 로그인 API가 돌려준 진짜 완벽한 토큰과 유저 정보를 가로챕니다!
      const { token, refreshToken, user } = loginResponse.data;

      // 4. 브라우저 로컬스토리지에 영혼까지 끌어모아 완벽하게 구워버립니다.
      if (token) {
        localStorage.setItem('login_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }

      alert("회원가입 및 인증 완료! 개인정보 입력 페이지로 이동합니다. 🏃‍♂️");
      
      // 5. 이제 완벽한 진짜 토큰을 가진 상태이므로, 보안 필터에 안 튕기고 다이렉트로 통과합니다!
      navigate('/information'); 

    } catch (error) {
      console.error("가입 및 자동 로그인 실패 상세:", error);
      alert("가입 처리는 되었으나 인증 연동에 실패했습니다. 이미 존재하는 아이디인지 확인해주세요.");
    }
  };
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
          <h1>회원가입</h1>
          <h2 style={{ color: '#5d4037'}}>가입을 환영합니다!</h2>
          <p>식단 관리를 위한 회원가입.</p>
          
          <div style={{ margin: '20px 0' }}>
            <input type="text" placeholder="아이디" 
            style={{ padding: '10px', width: '200px', marginBottom: '10px' }} 
            onChange={(e) => setUserid(e.target.value)}
            /><br/>
            <input type="password" placeholder="비밀번호" 
            style={{ padding: '10px', width: '200px' }} 
            onChange={(e) => setPassword(e.target.value)}
            /><br/>
            <input type="password" placeholder="비밀번호확인" 
            style={{ padding: '10px', width: '200px' }} 
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            /><br/>
            <input type="text" placeholder="닉네임" 
            style={{ padding: '10px', width: '200px' }} 
            onChange={(e) => setUsername(e.target.value)}
            /><br/>
            <input type="email" placeholder="이메일" 
            style={{ padding: '10px', width: '200px' }} 
            onChange={(e) => setEmail(e.target.value)} 
            /><br/>
          </div>
          
          <button style={{ 
            padding: '10px 30px', 
            backgroundColor: 'red', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={handleSignup}>
            가입하기
          </button>
          <hr></hr>
          {/*로그인 링크*/}
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#5d4037' }}>
            <span>아미 회원이신가요? </span>
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
                // 로그인 페이지로 이동
                navigate('/login');
                alert('로그인 페이지로 이동합니다.');
              }}
            >
              로그인
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
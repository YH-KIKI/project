import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css'; 
import './SignUp.css'; // 🌟 새로 만든 CSS 임포트
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

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
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다! (예: test@naver.com)");
      return;
    }

    try {
      const res = await axios.get(`/api/check-duplicate?userid=${userid}&username=${username}&email=${email}`);
      
      if (res.data.isIdTaken) {
        alert("이미 사용 중인 아이디입니다.");
        return;
      }
      if (res.data.isNameTaken) {
        alert("이미 사용 중인 이름입니다.");
        return;
      }
      if (res.data.isEmailTaken) {
        alert("이미 사용 중인 이메일입니다.");
        return;
      }

      // 1. 회원가입 API 호출
      await axios.post('/api/signup', {
        userId: userid,
        userPassWord: password,
        userName: username,
        userEmail: email,
      });

      // 2. 자동 로그인 연동 호출
      const loginResponse = await axios.post('/api/login', {
        username: username, 
        userid: userid,     
        password: password  
      });

      const { token, refreshToken, user } = loginResponse.data;

      if (token) localStorage.setItem('login_token', token);
      if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
      if (user) localStorage.setItem('user', JSON.stringify(user));

      alert("회원가입 및 인증 완료! 개인정보 입력 페이지로 이동합니다. 🏃‍♂️");
      navigate('/information'); 

    } catch (error) {
      console.error("가입 및 자동 로그인 실패 상세:", error);
      alert("가입 처리는 되었으나 인증 연동에 실패했습니다. 이미 존재하는 아이디인지 확인해주세요.");
    }
  };

  return (
    <div className="page-background">
      <div className="app-wrapper">
        {/* 왼쪽: 사이드바 */}
        <Sidebar />
        
        {/* 우측 메인: 회원가입 박스 */}
        <div className="signup-box">
          <h1>회원가입</h1>
          <h2>가입을 환영합니다!</h2>
          <p>식단 관리를 위한 첫걸음을 시작해보세요.</p>
          
          {/* 정렬이 잡힌 입력 폼 그룹 */}
          <div className="input-form-group">
            <input 
              type="text" 
              placeholder="아이디" 
              className="signup-input"
              onChange={(e) => setUserid(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="비밀번호 (10자 이하)" 
              className="signup-input"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="비밀번호 확인" 
              className="signup-input"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="닉네임" 
              className="signup-input"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input 
              type="email" 
              placeholder="이메일 (example@domain.com)" 
              className="signup-input"
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          
          {/* 가입하기 버튼 */}
          <button className="btn-signup-submit" onClick={handleSignup}>
            가입하기
          </button>
          
          <hr className="signup-divider" />
          
          {/* 로그인 링크 */}
          <div className="login-link-text">
            <span>이미 회원이신가요?</span>
            <a 
              href="/login" 
              onClick={(e) => {
                e.preventDefault();
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
import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css'; // 🌟 배경 이미지가 들어있는 CSS를 가져옵니다!
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {

  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate(); // 페이지 이동 함수

  const handleSignup = async () => {

    if (password.length > 10) {
    alert("비밀번호는 10자 이하만 가능합니다.");
    return;
    }

    //이메일 형식 검사 (정규표현식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다! (예: test@naver.com)");
      return;
    }

    try {
      await axios.post('http://localhost:8080/api/signup', {
        Userid: userid,
        Password: password,
        Username: username,
        Email: email,
      });
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate('/login'); // 가입 성공하면 자동으로 로그인 페이지로 슝!
    } catch (error) {
      alert("가입 실패! 이미 있는 아이디일 수 있어요.");
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

export default LoginPage;
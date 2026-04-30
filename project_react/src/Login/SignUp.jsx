import React from 'react';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css'; // 🌟 배경 이미지가 들어있는 CSS를 가져옵니다!
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
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
          <h1>회원가입</h1>
          <h2 style={{ color: '#5d4037'}}>냠냠플래닛 로그인</h2>
          <p>맛있는 다이어트의 시작! 로그인 해주세요.</p>
          
          <div style={{ margin: '20px 0' }}>
            <input type="text" placeholder="아이디" style={{ padding: '10px', width: '200px', marginBottom: '10px' }} /><br/>
            <input type="password" placeholder="비밀번호" style={{ padding: '10px', width: '200px' }} /><br/>
            <input type="password" placeholder="비밀번호확인" style={{ padding: '10px', width: '200px' }} /><br/>
            <input type="password" placeholder="닉네임" style={{ padding: '10px', width: '200px' }} /><br/>
            <input type="password" placeholder="이메일" style={{ padding: '10px', width: '200px' }} /><br/>
          </div>
          
          <button style={{ 
            padding: '10px 30px', 
            backgroundColor: 'red', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}>
            로그인
          </button>
          <hr></hr>
          {/*회원가입 링크*/}
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
                // 회원가입 페이지로 이동
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
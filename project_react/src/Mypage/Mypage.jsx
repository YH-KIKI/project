import React, { useState, useEffect } from 'react';
import Sidebar from '../Main/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NyamNyamView from './NyamNyamView'; // *** [추가/박하] 테스트

const Mypage = () => {

	const [username, setUsername] = useState('');
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const navigate = useNavigate(); //이동 함수 생성

  const handlefavoriteClick = () => {
    navigate('/favoritemeal')
  }

  const handleInformationClick = () => {
    navigate('/information'); //로그인 페이지 경로로 이동
  };

  const handleTargetClick = () => {
    navigate('/targetgoals');
  };

	const today = new Date();
	const days = ['일', '월', '화', '수', '목', '금', '토'];
	const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')} ${days[today.getDay()]}요일`;

	const fetchUserInfo = async () => {
		const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
		try{
			const response = await axios.get('http://localhost:8080/api/user/info', {
				headers:{
					Authorization: `Bearer ${token}`
				}
			});
			setUsername(response.data.username)
		}catch(error){
			alert("인증에 실패했습니다. 다시 로그인하세요")
		}
	}

	// 페이지가 새로고침되어도 토큰이 있으면 로그인 유지
	useEffect(() => {
		const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
		if (token) {
			setIsLoggedIn(true);
			fetchUserInfo();
		}
	}, []);

	const handleLogout = () => {
		//로그아웃
		localStorage.removeItem('login_token');
		setIsLoggedIn(false);
	}

  return (
    <div className="page-background">
      <div className="app-wrapper">
        <Sidebar />

      {/* 2. 오른쪽 메인 콘텐츠 (남은 공간 모두 차지) */}
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
						<a href="/"
						style={{ 
							fontSize: '20px', 
							position: 'absolute', // 👈 패딩을 무시하게 만드는 마법
							top: '0',              // 부모의 가장 위쪽에 딱 붙임
							right: '80px',            // 부모의 가장 오른쪽에 딱 붙임
							width: '20%', 
						}}onClick={handleLogout}>↪️ 로그아웃</a>
            <a href="/"
						style={{ 
							fontSize: '20px', 
							position: 'absolute', // 👈 패딩을 무시하게 만드는 마법
							top: '0',              // 부모의 가장 위쪽에 딱 붙임
							right: '30px',            // 부모의 가장 오른쪽에 딱 붙임
							width: '10%', 
						}}>🔔</a>
        {/* 정보 텍스트 라인 */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <span style={{ fontWeight: '600' }}>사용자: {username}</span>
          <span style={{ color: '#999' }}>{formattedDate}</span>
        </div>

        {/* *** 추가/박하: 새로운 캐릭터 및 경험치 뷰 적용, 기존 프로필카드 주석처리 */}
        <NyamNyamView />

        <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '18px' }}>{username}님, 오늘도 건강한 식단 관리 함께해요!</p>

        <div
  style={{
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '30px',
  }}
>
  <div style={{
    border: '1px solid #FFDADA',
    borderRadius: '30px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
  }}
    onClick={handleInformationClick}>
    <div style={{ fontSize: '40px', marginBottom: '6px' }}>👤✏️</div>
    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>개인정보 수정</div>
    <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>
      이름, 연락처, 사진 관리
    </div>
  </div>

  <div style={{
    border: '1px solid #FFDADA',
    borderRadius: '30px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
  }}
    onClick={handleTargetClick}>
    <div style={{ fontSize: '40px', marginBottom: '6px' }}>🏹🎯</div>
    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>목표 보기</div>
    <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>
      오늘목표 달성도 보려가자!
    </div>
  </div>

  <div style={{
    border: '1px solid #FFDADA',
    borderRadius: '30px',
    padding: '24px',
    textAlign: 'center',
  }}>
    <div style={{ fontSize: '40px', marginBottom: '6px' }}>🏅</div>
    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>내 뱃지</div>
    <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>
      나의 영광 나의 뱃지
    </div>
  </div>

  <div style={{
    border: '1px solid #FFDADA',
    borderRadius: '30px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
  }}
    onClick={handlefavoriteClick}>
    <div style={{ fontSize: '40px', marginBottom: '6px' }}>⭐</div>
    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>즐겨찾기</div>
    <div style={{ color: '#888', marginTop: '4px', fontSize: '13px' }}>
      뭐좀 맛있는거 있냥?
    </div>
  </div>
</div>
      </main>
    </div>
		</div>
  );
};

export default Mypage;
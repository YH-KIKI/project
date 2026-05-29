import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './GreetingBanner.css';

//  src/images/ 폴더 안에 있는 배너 고양이 이미지를 불러옵니다.
import catChefBannerImg from '../images/냠냠이2.png';

const GreetingBanner = ({}) => {
  const [userName, setUserName] = useState('');

    useEffect(() => {
      const fetchUser = async () => {
        // 🚀 AWS 배포 환경의 호스트를 자동으로 감지합니다!
        const currentHost = window.location.hostname;
        const apiUrl = process.env.REACT_APP_API_URL || `http://${currentHost}:8080`;
        
        const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
        if (!token) return;

        try {
          const res = await axios.get(`${apiUrl}/api/user/info`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserName(res.data.username);
        } catch (err) {
          console.error("이름 로딩 실패", err);
        }
      };
      fetchUser();
    }, []);
    
  return (
    <section className="greeting-banner">
      
      <div className="text-area">
        <h1 className="title">
          {userName}님, 오늘도 화이팅! 🍀
        </h1>
        <p className="subtitle">
          오늘의 식단은 어땠나요?<br />
          AI가 분석해줄게요!
        </p>
      </div>

      {/* 와이어프레임 위치 1-2: 배너 우측 상단 고양이 이미지 ★ */}
      <div className="cat-chef-banner">
        <img src={catChefBannerImg} alt="배너 고양이" />
      </div>

    </section>
  );
};

export default GreetingBanner;
// src/Main/GreetingBanner.jsx (위치 수정 완료 버전)

import React from 'react';
import './GreetingBanner.css';

// 🌟 추가됨: src/images/ 폴더 안에 있는 배너 고양이 이미지를 불러옵니다.
import catChefBannerImg from '../images/냠냠이2.png';

const GreetingBanner = ({ userName }) => {
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

      {/* ★ 수정됨: 와이어프레임 위치 1-2: 배너 우측 상단 고양이 이미지 ★ */}
      <div className="cat-chef-banner">
        <img src={catChefBannerImg} alt="배너 고양이" />
      </div>

    </section>
  );
};

export default GreetingBanner;
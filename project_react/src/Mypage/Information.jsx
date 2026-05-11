import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css';
import { useNavigate } from 'react-router-dom';

const Information = () => {

	const [usernum, setUsernum] = useState('0');
	const [userid, setUserid] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setgender] = useState('');
  const [height, setheight] = useState('0.0');
  const [weight, setweight] = useState('0.0');
  const [targetweight, settargetweight] = useState('0.0');
  const [age, setage] = useState('0');
  const [act, setact] = useState('0');
  const [allergies, setallergies] = useState([]);

  const navigate = useNavigate(); // 페이지 이동 함수

  const handleUpdata = async () => {

    //이메일 형식 검사 (정규표현식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다! (예: test@naver.com)");
      return;
    }

    //키, 몸무게, 나이 범위 검사 추가
    if (height < 100 || height > 300) {
      alert("키는 100cm에서 300cm 사이여야 합니다!");
      return;
    }
    if (weight < 40 || weight > 150) {
      alert("몸무게는 40kg에서 150kg 사이여야 합니다!");
      return;
    }
    if (targetweight < 40 || targetweight > 150) {
      alert("목표몸무게는 40kg에서 150kg 사이여야 합니다!");
      return;
    }
    if (age < 18 || age > 100) {
      alert("나이는 18세에서 100세 사이여야 합니다!");
      return;
    }
    if (act === '0') {
      alert("활동량을 선택해 주세요!");
      return;
    }

    try {
      const token = localStorage.getItem('login_token');
      await axios.post('http://localhost:8080/api/information_updata', {
				Usernum: usernum,
				Userid: userid,
        Username: username,
        Email: email,
				Gender: gender,
				Height: height,
				Weight: weight,
				Targetweight: targetweight,
				Age: age,
				Act: act,
        Allergies: allergies
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(axios)
      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate('/login'); // 가입 성공하면 자동으로 로그인 페이지로 슝!
    } catch (error) {
      alert("가입 실패! 이미 있는 아이디일 수 있어요.");
    }
  };  

	//id가져오고
		const fetchUserInfo = async () => {
		const token = localStorage.getItem('login_token');
		try{
			const response = await axios.get('http://localhost:8080/api/information_select', {
				headers:{
					Authorization: `Bearer ${token}`
				}
			});
      setUsernum(response.data.Usernum);
			setUserid(response.data.Userid)
			setUsername(response.data.Username)
			setEmail(response.data.Email)
      setgender(response.data.Gender)
      setheight(response.data.Height)
      setweight(response.data.Weight)
      settargetweight(response.data.Targetweight)
      setage(response.data.Age)
      setact(response.data.Act)
      setallergies(response.data.Allergies)
		}catch(error){
			alert("인증에 실패했습니다. 다시 로그인하세요")
		}
	}
	// 페이지가 새로고침되어도 토큰이 있으면 로그인 유지
	useEffect(() => {
		const token = localStorage.getItem('login_token');
		if (token) {
			fetchUserInfo();
		}
	}, []);


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
          <h1>개인정보</h1>
          
          <div style={{ margin: '20px 0' }}>
            닉네임 : 
            <input type="text" placeholder="닉네임" value={username}
            style={{ padding: '10px', width: '200px', marginBottom: '10px' }} 
            onChange={(e) => setUsername(e.target.value)}
            /><br/>
            이메일 : 
            <input type="email" placeholder="이메일"  value={email}
            style={{ padding: '10px', width: '200px' }} 
            onChange={(e) => setEmail(e.target.value)} 
            /><br/>

						<div style={{ marginBottom: '20px' }}>
							<label>성별: </label>
              <input 
                type="checkbox" 
                checked={gender === 'M'} 
                onChange={() => setgender('M')} 
              /> 남성

              <input 
                type="checkbox" 
                checked={gender === 'F'} 
                onChange={() => setgender('F')} 
              /> 여성

              <input 
                type="checkbox" 
                checked={gender === '?'} 
                onChange={() => setgender('?')} 
              /> 비밀~
      			</div>

            키높이 : 
            <input type="text" placeholder="키" value={height}
            style={{ padding: '10px', width: '200px' }} 
            onChange={(e) => setheight(e.target.value)}
            /><br/>
            무게 : 
						<input type="text" placeholder="무게" value={weight}
            style={{ padding: '10px', width: '200px' }} 
            onChange={(e) => setweight(e.target.value)}
            /><br/>

						<input type="text" placeholder="목표무게" value={targetweight}
            style={{ padding: '10px', width: '200px' }} 
            onChange={(e) => settargetweight(e.target.value)}
            /><br/>
            나이 : 
						<input type="text" placeholder="나이" value={age}
            style={{ padding: '10px', width: '200px' }} 
            onChange={(e) => setage(e.target.value)}
            /><br/>
            활동량 : 
            <select 
              value={act} 
              onChange={(e) => setact(e.target.value)}
              style={{ padding: '10px', width: '220px', marginBottom: '10px' }}
            >
              <option value="0">활동량을 선택하세요</option>
              <option value="1.2">매우 낮음 (거의 활동 안 함)</option>
              <option value="1.375">낮음 (가벼운 운동 주 1~3회)</option>
              <option value="1.55">보통 (적당한 운동 주 3~5회)</option>
              <option value="1.725">높음 (격렬한 운동 주 6~7회)</option>
              <option value="1.9">매우 높음 (선수급, 육체노동)</option>
            </select>
            
            <div style={{ marginBottom: '20px' }}>
							<label>알레르기: </label>
              <input 
                type="checkbox" 
                checked={allergies.includes('우유류')} 
                onChange={(e) => {
                  if (e.target.checked) {
                    setallergies([...allergies, '우유류']);
                  } else {
                    setallergies(allergies.filter(v => v !== '우유류'));
                  }
                }}
              /> 우유류

              <input 
                type="checkbox" 
                checked={allergies.includes('달걀류')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setallergies([...allergies, '달걀류']);
                  } else {
                    setallergies(allergies.filter(v => v !== '달걀류'));
                  }
                }}
              /> 달걀류

              <input 
                type="checkbox" 
                checked={allergies.includes('견과류')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setallergies([...allergies, '견과류']);
                  } else {
                    setallergies(allergies.filter(v => v !== '견과류'));
                  }
                }}
              /> 견과류

              <input 
                type="checkbox" 
                checked={allergies.includes('생선류')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setallergies([...allergies, '생선류']);
                  } else {
                    setallergies(allergies.filter(v => v !== '생선류'));
                  }
                }}
              /> 생선류

              <input 
                type="checkbox" 
                checked={allergies.includes('대두류')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setallergies([...allergies, '대두류']);
                  } else {
                    setallergies(allergies.filter(v => v !== '대두류'));
                  }
                }}
              /> 대두류
      			</div>

          </div>
          
          <button style={{ 
            padding: '10px 30px', 
            backgroundColor: 'red', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
          onClick={handleUpdata}>
            수정하기
          </button>
          <hr></hr>
        </div>

      </div>
    </div>
  );
};

export default Information;
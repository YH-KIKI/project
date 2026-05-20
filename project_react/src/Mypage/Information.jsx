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
  const [model, setmodel] = useState('0');
  const [allergies, setallergies] = useState([]);

  const [favoriteFoods, setFavoriteFoods] = useState([]); // 좋아하는 음식 리스트
  const [dislikeFoods, setDislikeFoods] = useState([]);   // 싫어하는 음식 리스트

  // 검색용 임시 상태
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'favorite', 'dislike', null

  const navigate = useNavigate(); // 페이지 이동 함수

  // 음식 검색
  const handleSearchFood = async () => {
    if (!searchKeyword.trim()) return;
    try {
      const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
      const response = await axios.get(`/api/user/food/search?keyword=${searchKeyword}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data); // 백엔드에서 검색된 FoodDTO 리스트 반환
    } catch (error) {
      console.error("음식 검색 실패", error);
    }
  };

  // 음식 리스트에 추가하는 헬퍼
  const addFoodToList = (food, type) => {
    if (type === 'favorite') {
      if (favoriteFoods.some(f => f.foNum === food.foNum)) return;
      setFavoriteFoods([...favoriteFoods, food]);
    } else {
      if (dislikeFoods.some(f => f.foNum === food.foNum)) return;
      setDislikeFoods([...dislikeFoods, food]);
    }
  };

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
    if (model === '0') {
      alert("모드을 선택해 주세요!");
      return;
    }

    try {
      const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
      await axios.post('/api/information_updata', {
				userNum: usernum,
        userId: userid,
        userName: username,
        userEmail: email,
        userGender: gender,
        userHeight: height,
        userWeight: weight,
        userTargetweight: targetweight,
        userAge: age,
        userAct: act,
        userModel: model,
        userAllergies: allergies,
        favoriteFoods: favoriteFoods.map(f => f.foNum), 
        dislikeFoods: dislikeFoods.map(f => f.foNum)
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
		const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
		try{
			const response = await axios.get('/api/information_select', {
				headers:{
					Authorization: `Bearer ${token}`
				} 
			});
      setUsernum(response.data.userNum);
      setUserid(response.data.userId);
      setUsername(response.data.userName);
      setEmail(response.data.userEmail);

      setgender(response.data.userGender);
      setheight(response.data.userHeight);

      setweight(response.data.userWeight);
      settargetweight(response.data.userTargetweight);

      setage(response.data.userAge);
      setact(response.data.userAct);
      setmodel(response.data.userModel);

      setallergies(response.data.userAllergies || []);
      setFavoriteFoods(response.data.favoriteFoods || []);
      setDislikeFoods(response.data.dislikeFoods || []);
		}catch(error){
			alert("인증에 실패했습니다. 다시 로그인하세요")
		}
	}
	// 페이지가 새로고침되어도 토큰이 있으면 로그인 유지
	useEffect(() => {
		const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
		if (token) {
			fetchUserInfo();
		}
	}, []);


  return (
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          padding: '40px', 
          borderRadius: '20px', 
          textAlign: 'center',
          border: '2px solid #d1b8a0',
          position: 'relative',
          height: '100%', width: '85%',
          
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

            선택한 모드 : 
            <select 
              value={model} 
              onChange={(e) => setmodel(e.target.value)}
              style={{ padding: '10px', width: '220px', marginBottom: '10px' }}
            >
              <option value="0">원한 모드를 선택하세요</option>
              <option value="1">다이어트</option>
              <option value="2">건강유지</option>
              <option value="3">근육증량</option>
              <option value="4">저탄고지</option>
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
          
          <hr style={{ border: '0.5px solid #ddd', margin: '30px 0' }} />

          {/* [추가] 선호 음식 설정 UI 구역 */}
          <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', marginBottom: '30px' }}>
            {/* 좋아하는 음식 블록 */}
            <div style={{ flex: 1, textAlign: 'left', padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '15px' }}>
              <h3 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>❤️ 좋아하는 음식</h3>
              <button onClick={() => { setActiveModal('favorite'); setSearchResults([]); setSearchKeyword(''); }} style={{ marginBottom: '10px', padding: '5px 10px', cursor: 'pointer' }}>+ 음식 추가</button>
              <div>
                {favoriteFoods.map(f => (
                  <span key={f.foNum} style={{ display: 'inline-block', backgroundColor: '#fff', padding: '5px 10px', borderRadius: '20px', marginRight: '5px', marginBottom: '5px', fontSize: '14px', border: '1px solid #a5d6a7' }}>
                    {f.foName} <b style={{ color: 'red', cursor: 'pointer' }} onClick={() => setFavoriteFoods(favoriteFoods.filter(item => item.foNum !== f.foNum))}>x</b>
                  </span>
                ))}
              </div>
            </div>

            {/* 싫어하는 음식 블록 */}
            <div style={{ flex: 1, textAlign: 'left', padding: '20px', backgroundColor: '#ffebee', borderRadius: '15px' }}>
              <h3 style={{ color: '#c62828', margin: '0 0 10px 0' }}>🥦 싫어하는 음식</h3>
              <button onClick={() => { setActiveModal('dislike'); setSearchResults([]); setSearchKeyword(''); }} style={{ marginBottom: '10px', padding: '5px 10px', cursor: 'pointer' }}>+ 음식 추가</button>
              <div>
                {dislikeFoods.map(f => (
                  <span key={f.foNum} style={{ display: 'inline-block', backgroundColor: '#fff', padding: '5px 10px', borderRadius: '20px', marginRight: '5px', marginBottom: '5px', fontSize: '14px', border: '1px solid #ef9a9a' }}>
                    {f.foName} <b style={{ color: 'red', cursor: 'pointer' }} onClick={() => setDislikeFoods(dislikeFoods.filter(item => item.foNum !== f.foNum))}>x</b>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 음식 검색 모달 팝업 */}
          {activeModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
              <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '20px', width: '350px' }}>
                <h3>{activeModal === 'favorite' ? '좋아하는' : '싫어하는'} 음식 검색</h3>
                <input type="text" placeholder="음식명 입력" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} style={{ padding: '8px', width: '180px', marginRight: '5px' }} />
                <button onClick={handleSearchFood} style={{ padding: '8px 15px', cursor: 'pointer' }}>검색</button>
                
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '15px', border: '1px solid #eee', padding: '10px', textAlign: 'left' }}>
                  {searchResults.map(food => (
                    <div key={food.foNum} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <span>{food.foName}</span>
                      <button onClick={() => addFoodToList(food, activeModal)} style={{ padding: '2px 8px', backgroundColor: '#d1b8a0', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>추가</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveModal(null)} style={{ marginTop: '20px', width: '100%', padding: '10px', backgroundColor: '#eee', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>닫기</button>
              </div>
            </div>
          )}

          <button style={{ padding: '10px 30px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={handleUpdata}>
            수정하기
          </button>
        </div>
  );
};

export default Information;
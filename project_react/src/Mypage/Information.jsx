import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../Main/Sidebar';
import { useNavigate } from 'react-router-dom';
import './Information.css'; // 🌟 새로 파놓은 CSS 파일 링크 로드냥!

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

  const [favoriteFoods, setFavoriteFoods] = useState([]); 
  const [dislikeFoods, setDislikeFoods] = useState([]);   

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeModal, setActiveModal] = useState(null); 

  const navigate = useNavigate(); 

  // 음식 검색
  const handleSearchFood = async () => {
    if (!searchKeyword.trim()) return;
    try {
      const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
      const response = await axios.get(`/api/user/food/search?keyword=${searchKeyword}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data); 
    } catch (error) {
      console.error("음식 검색 실패", error);
    }
  };

  // 음식 리스트에 추가
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다! (예: test@naver.com)");
      return;
    }

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
      alert("모드를 선택해 주세요!");
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
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("회원 정보 수정 성공! 메인 화면으로 이동합니다.");
      navigate('/'); 
    } catch (error) {
      alert("정보 수정 실패! 데이터를 다시 확인해 주세요.");
    }
  };   

  const fetchUserInfo = async () => {
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    try{
      const response = await axios.get('/api/information_select', {
        headers:{ Authorization: `Bearer ${token}` } 
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
      console.log(response)
    }catch(error){
      alert("인증에 실패했습니다. 다시 로그인하세요");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    if (token) {
      fetchUserInfo();
    }
  }, []);

  return (
    <div className="info-container">
      <h2 className="info-title">👤 개인정보 관리</h2>
      <p className="info-subtitle">NyamNyam Planet이 맞춤 영양 분석을 제공하기 위한 기본 스펙 정보입니다냥.</p>
      
      {/* 2단 인풋 그리드 구역 */}
      <div className="info-grid">
        <div>
          <label className="info-label">닉네임</label>
          <input type="text" placeholder="닉네임" value={username} className="info-input" onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="info-label">이메일 주소</label>
          <input type="email" placeholder="이메일" value={email} className="info-input" onChange={(e) => setEmail(e.target.value)} />
        </div>
        
        {/* 성별 탭 메뉴 */}
        <div className="gender-group">
          <label className="info-label">성별</label>
          <div className="gender-btn-wrapper">
            {[
              { id: 'M', label: '🙋‍♂️ 남성' },
              { id: 'F', label: '🙋‍♀️ 여성' },
              { id: '?', label: '🔒 비밀' }
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setgender(g.id)}
                className={`gender-btn ${gender === g.id ? 'active' : ''}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="info-label">현재 키 (cm)</label>
          <input type="number" placeholder="키" value={height} className="info-input" onChange={(e) => setheight(e.target.value)} />
        </div>
        <div>
          <label className="info-label">현재 체중 (kg)</label>
          <input type="number" placeholder="무게" value={weight} className="info-input" onChange={(e) => setweight(e.target.value)} />
        </div>
        <div>
          <label className="info-label">목표 체중 (kg)</label>
          <input type="number" placeholder="목표무게" value={targetweight} className="info-input" onChange={(e) => settargetweight(e.target.value)} />
        </div>
        <div>
          <label className="info-label">만 나이 (세)</label>
          <input type="number" placeholder="나이" value={age} className="info-input" onChange={(e) => setage(e.target.value)} />
        </div>

        <div>
          <label className="info-label">평소 활동량 선택</label>
          <select value={act} onChange={(e) => setact(e.target.value)} className="info-input">
            <option value="0">활동량을 선택하세요</option>
            <option value="1.2">매우 낮음 (거의 활동 안 함)</option>
            <option value="1.375">낮음 (가벼운 운동 주 1~3회)</option>
            <option value="1.55">보통 (적당한 운동 주 3~5회)</option>
            <option value="1.725">높음 (격렬한 운동 주 6~7회)</option>
            <option value="1.9">매우 높음 (선수급, 육체노동)</option>
          </select>
        </div>
        <div>
          <label className="info-label">추구하는 다이어트 모드</label>
          <select value={model} onChange={(e) => setmodel(e.target.value)} className="info-input">
            <option value="0">원하는 모드를 선택하세요</option>
            <option value="1">다이어트</option>
            <option value="2">건강유지</option>
            <option value="3">근육증량</option>
            <option value="4">저탄고지</option>
          </select>
        </div>
      </div>

      {/* 알레르기 카드 */}
      <div className="allergy-section">
        <span className="allergy-title">🚫 보유 알레르기 체크</span>
        <div className="allergy-flex">
          {['우유류', '달걀류', '견과류', '생선류', '대두류'].map((item) => (
            <label key={item} className="allergy-item">
              <input 
                type="checkbox" 
                checked={allergies.includes(item)}
                className="allergy-checkbox"
                onChange={(e) => {
                  if (e.target.checked) {
                    setallergies([...allergies, item]);
                  } else {
                    setallergies(allergies.filter(v => v !== item));
                  }
                }}
              /> {item}
            </label>
          ))}
        </div>
      </div>

      <hr style={{ border: '0.5px solid #eee', margin: '30px 0' }} />

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* 좋아하는 음식 카드 */}
        <div style={{ flex: 1, width: '50%', textAllign: 'left', padding: '24px', backgroundColor: '#f1f8e9', borderRadius: '20px', border: '1px solid #d0e7b5', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', gap: '15px' }}>
          <div style={{ width: '100%', boxSizing: 'border-box', textAlign: 'left' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>❤️ 좋아하는 음식</h3>
          </div>
          
          <button 
            type="button" 
            onClick={() => { setActiveModal('favorite'); setSearchResults([]); setSearchKeyword(''); }} 
            style={{ display: 'block', width: '100%', padding: '12px', color: 'white', backgroundColor: '#2e7d32', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', boxSizing: 'border-box' }}
          >
            + 음식 추가하기
          </button>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '50px', width: '100%', boxSizing: 'border-box' }}>
            {favoriteFoods.length === 0 && <span style={{ color: '#aaa', fontSize: '14px', width: '100%', textAlign: 'left', display: 'block' }}>등록된 음식이 없다냥...</span>}
            {favoriteFoods.map(f => (
              <span key={f.foNum} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', padding: '6px 12px', borderRadius: '30px', fontSize: '13px', fontWeight: '500', border: '1px solid #c5e1a5', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                {f.foName} <b style={{ color: '#ff5252', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setFavoriteFoods(favoriteFoods.filter(item => item.foNum !== f.foNum))}>×</b>
              </span>
            ))}
          </div>
        </div>

        {/*싫어하는 음식 카드*/}
        <div style={{ flex: 1, width: '50%', textAllign: 'left', padding: '24px', backgroundColor: '#fbe9e7', borderRadius: '20px', border: '1px solid #ffccbc', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', gap: '15px' }}>
          <div style={{ width: '100%', boxSizing: 'border-box', textAlign: 'left' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#c62828' }}>🥦 싫어하는 음식</h3>
          </div>
          
          <button 
            type="button" 
            onClick={() => { setActiveModal('dislike'); setSearchResults([]); setSearchKeyword(''); }} 
            style={{ display: 'block', width: '100%', padding: '12px', color: 'white', backgroundColor: '#c62828', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'center', boxSizing: 'border-box' }}
          >
            + 음식 추가하기
          </button>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '50px', width: '100%', boxSizing: 'border-box' }}>
            {dislikeFoods.length === 0 && <span style={{ color: '#aaa', fontSize: '14px', width: '100%', textAlign: 'left', display: 'block' }}>등록된 음식이 없다냥...</span>}
            {dislikeFoods.map(f => (
              <span key={f.foNum} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', padding: '6px 12px', borderRadius: '30px', fontSize: '13px', fontWeight: '500', border: '1px solid #ffab91', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                {f.foName} <b style={{ color: '#ff5252', cursor: 'pointer', marginLeft: '4px' }} onClick={() => setDislikeFoods(dislikeFoods.filter(item => item.foNum !== f.foNum))}>×</b>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* 음식 검색 모달 */}
      {activeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">🔍 {activeModal === 'favorite' ? '좋아하는' : '싫어하는'} 음식 검색</h3>
            <div className="modal-search-box">
              <input type="text" placeholder="예: 치킨, 샐러드" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="info-input" onKeyDown={(e) => e.key === 'Enter' && handleSearchFood()} />
              <button type="button" onClick={handleSearchFood} className="modal-search-btn">검색</button>
            </div>
            
            <div className="modal-result-list">
              {searchResults.length === 0 && <div style={{textAlign:'center', color:'#aaa', padding:'20px', fontSize:'13px'}}>검색 결과가 없습니다냥.</div>}
              {searchResults.map(food => (
                <div key={food.foNum} className="modal-result-item">
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{food.foName}</span>
                  <button type="button" onClick={() => addFoodToList(food, activeModal)} className="modal-add-btn">추가</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setActiveModal(null)} className="modal-close-btn">창 닫기</button>
          </div>
        </div>
      )}

      {/* 최종 수정 버튼 */}
      <button type="button" onClick={handleUpdata} className="submit-btn">
        ✨ 회원 정보 수정 완료하기
      </button>
    </div>
  );
};

export default Information;
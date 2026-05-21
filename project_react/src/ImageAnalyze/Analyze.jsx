import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css';
import { useNavigate } from 'react-router-dom';

const Analyze = () => {
  const [selectedFile, setSelectedFile] = useState(null); // 실제 파일 객체
  const [previewUrl, setPreviewUrl] = useState(null);    // 미리보기 이미지 주소
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 로딩 상태
  const [aiResults, setAiResults] = useState([]);       // AI가 찾은 음식 후보들
  const [selectedFoods, setSelectedFoods] = useState([]); // 사용자가 클릭해서 선택한 음식들
  const [showModal, setShowModal] = useState(false); // 입력 팝업 노출 여부
  const [mealType, setMealType] = useState('아침');   // 아침, 점심, 저녁
  const [foodDetails, setFoodDetails] = useState({}); // { '제육볶음': 200, '냉면': 450 } 형식
  const [customFoodName, setCustomFoodName] = useState("");//입력한 인증실패음식이름

  const navigate = useNavigate(); //이동 함수 생성

  const handleReportFail = async () => {
    if (!customFoodName) {
        alert("음식 이름을 입력해주세요!");
        return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const data = {
        userNum: user.user_num,
        userInputName: customFoodName
    };
    formData.append('data', JSON.stringify(data));

    try {
        await axios.post('http://54.116.167.5:8000/api/report-fail', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("감사합니다! 입력하신 '" + customFoodName + "' 데이터가 수집되었습니다.");
        setCustomFoodName(""); // 입력창 초기화
    } catch (error) {
        alert("제보 전송 중 오류가 발생했습니다.");
    }
};

  //사진 선택 시 처리
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // 브라우저 임시 경로 생성
      setAiResults([]);       // 새 사진 올리면 이전 결과 초기화
      setSelectedFoods([]);   // 선택 상태도 초기화
    }
  };

  //AI 분석 시작 (Python 서버 호출)
  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("분석할 사진을 먼저 선택해주세요!");
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('http://54.116.167.5:8000/api/ai/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // 결과가 있으면 저장
      if (response.data.results) {
        setAiResults(response.data.results);
      }
    } catch (error) {
      console.error("AI 분석 에러:", error);
      alert("AI 서버 연결에 실패했습니다. (8000번 포트 확인)");
    } finally {
      setIsAnalyzing(false);
    }
  };

  //음식 선택/해제 토글 함수
  const toggleFoodSelection = (foodName) => {
    if (selectedFoods.includes(foodName)) {
      // 이미 선택됨 -> 제거
      setSelectedFoods(selectedFoods.filter(f => f !== foodName));
    } else {
      // 미선택 -> 추가
      setSelectedFoods([...selectedFoods, foodName]);
    }
  };

  //추천하기(DB 저장) 버튼 클릭
  const handleRecommend = () => {
    if (selectedFoods.length === 0) {
      alert("먹은 음식을 선택해주세요!");
      return;
    }

  //선택된 음식들의 초기 중량을 0으로 설정하여 세팅
  const initialDetails = {};
    selectedFoods.forEach(food => {
      initialDetails[food] = 0; 
    });
    setFoodDetails(initialDetails);
    
    setShowModal(true); // 입력 팝업 열기
  };

  const handleFinalSubmit = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile); // AI 분석에 썼던 원본 파일
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // 나머지 데이터를 JSON 객체로 묶어서 보냄
    const data = {
      userNum: user.user_num,
      mkMealType: mealType,
      foodDetails: foodDetails // { "제육볶음": 200, "냉면": 450 }
    };
    formData.append('data', JSON.stringify(data));

    try {
      const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');

      // 토큰이 없을 경우를 대비한 안전장치 (이게 있어야 튕기는 걸 막아요)
      if (!token) {
        alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요! 🏃‍♂️");
        navigate('/login');
        return;
      }

      const response = await axios.post('/api/record', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          // 수정된 부분: 저장된 위치가 어디든 토큰을 실어 보냅니다.
          'Authorization': `Bearer ${token}`
          }
      });
      alert("식단 기록중...");
      // 그 한 끼'의 데이터만 백엔드에 요청
      const nutritionRes = await axios.get(
        //Controller : UserInformation
        `/api/meal/current-nutrition?userNum=${user.user_num}&mealType=${mealType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("식단 기록 완료! 평가 리포트로 이동합니다. 📊");
      setShowModal(false);

      // 자바가 쿼리문으로 완벽하게 뽑아다 준 한 끼 데이터(nutritionRes.data)를 들고 이동
      navigate('/evaluation', { 
        state: { 
          mealResult: nutritionRes.data, // { kcal, carbs, protein, fat, sodium }
          mealType: mealType 
        } 
      });
    } catch (error) {
      console.error("기록 실패", error);
    // 중복식사 알림 등를 alert으로 띄웁니다.
    if (error.response && error.response.data) {
      alert(`🛑 등록 실패: ${error.response.data}`);
    } else {
      alert("❌ 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  }
};
  return (
        <div style={{ 
          backgroundColor: '#fffcf9', padding: '40px', borderRadius: '30px', 
          height: '100%', width: '85%', position: 'relative',
          overflowY: 'auto', border: '1px solid #eee'
        }}>
          <h2 style={{ color: '#5d4037', textAlign: 'left', marginBottom: '30px' }}>
            식단 사진 분석 (Vision AI)
          </h2>

          {/* 상단: 사진 업로드 & 상태창 */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
            
            {/* 사진 업로드 구역 */}
            <div style={{ flex: 1, backgroundColor: '#fbe9e7', borderRadius: '20px', padding: '20px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>사진 업로드</p>
              <label style={{ cursor: 'pointer' }}>
                <div style={{ 
                  width: '100%', height: '220px', backgroundColor: '#fff', borderRadius: '15px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  border: '2px dashed #d1b8a0'
                }}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#d1b8a0' }}>
                      <span style={{ fontSize: '50px' }}>📷</span>
                      <p>클릭하여 사진 추가</p>
                    </div>
                  )}
                </div>
                <input type="file" hidden onChange={handleFileChange} accept="image/*" />
              </label>
            </div>

            {/* AI 분석 상태창 */}
            <div style={{ 
              flex: 1, backgroundColor: '#fff', borderRadius: '20px', padding: '20px', 
              border: '1px solid #eee', display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center' 
            }}>
              <p style={{ fontWeight: 'bold' }}>{isAnalyzing ? "AI 분석 중..." : "AI 분석 완료"}</p>
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '50%', border: '8px solid #f0f0f0',
                borderTop: isAnalyzing ? '8px solid #ff8a80' : '8px solid #81c784',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '15px 0', transition: '0.3s',
                animation: isAnalyzing ? 'spin 2s linear infinite' : 'none'
              }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
                  {isAnalyzing ? "..." : (aiResults.length > 0 ? "OK" : "Ready")}
                </span>
              </div>
              {!isAnalyzing && (
                <button 
                  onClick={handleAnalyze}
                  style={{ 
                    padding: '8px 20px', backgroundColor: '#ff8a80', color: '#fff', 
                    border: 'none', borderRadius: '10px', cursor: 'pointer' 
                  }}
                >
                  분석 실행
                </button>
              )}
            </div>
          </div>

          <hr style={{ border: '0.5px solid #eee', marginBottom: '30px' }} />

          {/* 하단: 결과 리스트 */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '30px' }}>
              AI가 사진에서 분석한 결과입니다. 먹은 음식을 **모두** 클릭해주세요!
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              {aiResults.map((result, index) => {
                const isSelected = selectedFoods.includes(result.foodName);
                return (
                  <div 
                    key={index} 
                    onClick={() => toggleFoodSelection(result.foodName)}
                    style={{ 
                      textAlign: 'center', cursor: 'pointer', transition: '0.2s',
                      transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    <div style={{ 
                      width: '110px', height: '110px', backgroundColor: isSelected ? '#ff8a80' : '#eee', 
                      borderRadius: '50%', margin: '0 auto 10px', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', fontSize: '35px',
                      border: isSelected ? '4px solid #fbe9e7' : '4px solid transparent',
                      boxShadow: isSelected ? '0 5px 15px rgba(255,138,128,0.4)' : 'none'
                    }}>
                      🥗
                    </div>
                    <p style={{ fontWeight: 'bold', fontSize: '15px', color: isSelected ? '#ff8a80' : '#555' }}>
                      {result.foodName}
                    </p>
                    <p style={{ fontSize: '12px', color: '#bbb' }}>{result.confidence}% 일치</p>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff3e0', borderRadius: '15px' }}>
              <p style={{ fontWeight: 'bold' }}>🧐 찾는 음식이 결과에 없나요?</p>
              <input 
                type="text" 
                placeholder="음식 이름을 직접 입력해주세요"
                value={customFoodName}
                onChange={(e) => setCustomFoodName(e.target.value)}
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd', marginRight: '10px' }}
              />
              <button 
                onClick={handleReportFail}
                style={{ 
                padding: '10px 20px', backgroundColor: '#ff9800', color: 'white', 
                border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' 
            }}>
                정답 제보하기
              </button>
            </div>

            {selectedFoods.length > 0 && (
              <button 
                onClick={handleRecommend}
                style={{ 
                  marginTop: '50px', padding: '15px 80px', backgroundColor: '#c6465d', 
                  color: 'white', border: 'none', borderRadius: '35px', 
                  cursor: 'pointer', fontSize: '18px', fontWeight: 'bold',
                  boxShadow: '0 4px 10px rgba(198,70,93,0.3)'
                }}
              >
                {selectedFoods.length}개 선택됨 - 기록하기
              </button>
              
            )}
            {/* --- 중량 및 식사 종류 입력 모달 --- */}
            {showModal && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: '#fff', padding: '30px', borderRadius: '25px', width: '400px', textAlign: 'center'
                }}>
                  <h3 style={{ color: '#5d4037', marginBottom: '20px' }}>식단 상세 정보 입력</h3>
                  
                  {/* 식사 종류 선택 */}
                  <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    {['아침', '점심', '저녁'].map(type => (
                      <button 
                        key={type}
                        onClick={() => setMealType(type)}
                        style={{
                          padding: '8px 15px', borderRadius: '15px', border: '1px solid #eee',
                          backgroundColor: mealType === type ? '#ff8a80' : '#fff',
                          color: mealType === type ? '#fff' : '#888', cursor: 'pointer'
                        }}
                      >{type}</button>
                    ))}
                  </div>

                  {/* 음식별 중량 입력 */}
                  <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                    {selectedFoods.map(foodName => (
                      <div key={foodName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold' }}>{foodName}</span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input 
                            type="number" 
                            placeholder="0"
                            onChange={(e) => setFoodDetails({...foodDetails, [foodName]: e.target.value})}
                            style={{ width: '80px', padding: '5px', borderRadius: '5px', border: '1px solid #ddd', textAlign: 'right', marginRight: '5px' }}
                          /> <span>g</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 최종 저장 버튼 */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setShowModal(false)}
                      style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '15px', backgroundColor: '#eee', cursor: 'pointer' }}
                    >취소</button>
                    <button 
                      onClick={() => {
                        // 여기서 Spring Boot 서버로 (selectedFile, mealType, foodDetails)를 한꺼번에 보냅니다!
                        console.log("최종 전송 데이터:", { mealType, foodDetails });
                        alert("DB에 기록되었습니다!");
                        setShowModal(false);
                        handleFinalSubmit();
                      }}
                      style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '15px', backgroundColor: '#c6465d', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                    >최종 기록</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 로딩 애니메이션 CSS */}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>

  );
};

export default Analyze;

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

  const navigate = useNavigate(); //이동 함수 생성

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
      // 파이썬 FastAPI 서버 주소
      const response = await axios.post('http://localhost:8000/ai/predict', formData, {
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
  //   alert(`선택된 음식: ${selectedFoods.join(', ')}\nDB 저장을 시작합니다!`);
  //   // 여기에 Spring Boot로 selectedFoods를 보내는 axios 코드를 넣으면 됩니다.
  // };

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
    
    // 나머지 데이터를 JSON 객체로 묶어서 보냄
    const data = {
      usernum: Number(localStorage.getItem('user_num')),
      mealType: mealType,
      foodDetails: foodDetails // { "제육볶음": 200, "냉면": 450 }
    };
    formData.append('data', JSON.stringify(data));

    try {
      const response = await axios.post('http://localhost:8080/api/record', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('login_token')}`
        }
      });
      alert("식단 기록 완료!");
      console.log(response)
      setShowModal(false);
      navigate('/'); // 기록 후 메인 페이지로 이동
    } catch (error) {
      console.error("기록 실패", error);
    }
  };
  return (
    <div className="page-background">
      <div className="app-wrapper">
        <Sidebar />
        
        <div style={{ 
          backgroundColor: '#fffcf9', padding: '40px', borderRadius: '30px', 
          height: '850px', width: '62%', top: '20px', position: 'relative',
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
            <h3 style={{ color: '#5d4037' }}>찾으시는 게 없나요?</h3>
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
        </div>
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
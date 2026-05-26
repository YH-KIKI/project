import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../Main/Sidebar';
import '../Main/MainLayout.css';
import { useNavigate } from 'react-router-dom';

const Analyze = () => {
  const [selectedFile, setSelectedFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);    
  const [isAnalyzing, setIsAnalyzing] = useState(false); 
  const [aiResults, setAiResults] = useState([]);       
  const [selectedFoods, setSelectedFoods] = useState([]); 
  
  // 🌟 [추가된 필살기 상태창들냥!]
  const [showModal, setShowModal] = useState(false); 
  const [showVariantModal, setShowVariantModal] = useState(false); // 세부 음식 선택 모달 스위치
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0); // 여러 개 선택했을 때 순서대로 처리하기 위함
  const [foodVariants, setFoodVariants] = useState([]); // DB에서 LIKE로 찾은 세부 음식 리스트
  const [finalSelectedFoods, setFinalSelectedFoods] = useState([]); // 세부 종류까지 100% 확정된 최종 음식 리스트냥!

  const [mealType, setMealType] = useState('아침');   
  const [foodDetails, setFoodDetails] = useState({}); 
  const [customFoodName, setCustomFoodName] = useState("");

  const navigate = useNavigate(); 

  // 기존에 적혀있던 자동 주소 선택 스위치냥
  const SERVER_URL = process.env.REACT_APP_API_URL || window.location.origin;

  // 주소에서 자바 포트(:8080)를 싹 지우고, 파이썬 포트(:8000)를 붙인
  const AI_SERVER_URL = SERVER_URL.replace(':8080', '') + ':8000';

  const handleReportFail = async () => {
    if (!customFoodName) {
        alert("음식 이름을 입력해주세요!");
        return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const data = { userNum: user.user_num, userInputName: customFoodName };
    formData.append('data', JSON.stringify(data));

    try {
        // MealController
        await axios.post(`/api/report-fail`, formData, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        alert("감사합니다! 입력하신 '" + customFoodName + "' 데이터가 수집되었습니다.");
        setCustomFoodName(""); 
    } catch (error) {
        alert("제보 전송 중 오류가 발생했습니다.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setAiResults([]);       
      setSelectedFoods([]);   
      setFinalSelectedFoods([]); // 초기화냥
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("분석할 사진을 먼저 선택해주세요!");
      return;
    }
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`/api/ai/predict`, formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
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

  const toggleFoodSelection = (foodName) => {
    if (selectedFoods.includes(foodName)) {
      setSelectedFoods(selectedFoods.filter(f => f !== foodName));
    } else {
      setSelectedFoods([...selectedFoods, foodName]);
    }
  };

  // 기록하기 누르면 먼저 LIKE '%음식이름%' 조회하러 출발냥!
  const handleRecommend = async () => {
    if (selectedFoods.length === 0) {
      alert("먹은 음식을 선택해주세요!");
      return;
    }

    // 최종 확정 상자 초기화하고 첫 번째 선택 음식부터 탐색 시작냥
    setFinalSelectedFoods([]);
    fetchVariantsForFood(0, selectedFoods[0]);
  };

  // 특정 음식의 세부 종류를 DB에서 받아와 모달을 열어줍니다냥!
  const fetchVariantsForFood = async (index, foodName) => {
    try {
      const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
      const res = await axios.get(`/api/food/search-variants?foodName=${foodName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.length > 0) {
        setFoodVariants(res.data); // DB에서 찾은 후라이드치킨, 양념치킨 상자 세팅냥!
        setCurrentSearchIndex(index);
        setShowVariantModal(true);  // 세부 선택창 
      } else {
        // 만약 DB에 LIKE로 걸리는 세부 종류가 전혀 없다면 그냥 AI 이름을 최종 이름으로 간주냥!
        alert(`🚨 DB에 '${foodName}'과 일치하는 상세 종류가 없어 기본 이름으로 진행합니다냥.`);
        // const nextFoods = [...finalSelectedFoods, foodName];
        // setFinalSelectedFoods(nextFoods);
        // checkNextOrMoveToWeight(index, nextFoods);
        return
      }
    } catch (error) {
      console.error("세부 음식 조회 실패", error);
      alert("음식 상세 정보를 가져오는 중 오류가 발생했습니다.");
    }
  };

  // 다음 고를 음식이 또 있는지 검사하거나 최종 중량 모달로 토스냥!
  const checkNextOrMoveToWeight = (currentIndex, currentFinalList) => {
    if (currentIndex + 1 < selectedFoods.length) {
      // 아직 세부 선택을 완료해야 할 음식이 더 남았다면 다음 녀석 조회냥!
      fetchVariantsForFood(currentIndex + 1, selectedFoods[currentIndex + 1]);
    } else {
      // 모든 음식의 세부 종류 확정이 끝났다면 대망의 중량 입력 모달 오픈!!!
      const initialDetails = {};
      currentFinalList.forEach(food => {
        initialDetails[food] = 0; 
      });
      setFoodDetails(initialDetails);
      setShowModal(true); // 중량 및 식사종류 모달창 오픈냥!
    }
  };

  // 세부 모달에서 특정 음식 딱 클릭했을 때 처리 로직냥!
  const handleSelectVariant = (exactFoodName) => {
    const nextFoods = [...finalSelectedFoods, exactFoodName];
    setFinalSelectedFoods(nextFoods);
    setShowVariantModal(false); // 세부 선택창 닫기
    
    // 다음 스텝으로 진행냥
    checkNextOrMoveToWeight(currentSearchIndex, nextFoods);
  };


  const handleFinalSubmit = async () => {
    const formData = new FormData();
    formData.append('file', selectedFile); 
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const data = {
      userNum: user.user_num,
      mkMealType: mealType,
      foodDetails: foodDetails // 확정된 세부음식이름과 중량이 정상적으로 전달된다냥!
    };
    formData.append('data', JSON.stringify(data));

    try {
      const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
      if (!token) {
        alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요! 🏃‍♂️");
        navigate('/login');
        return;
      }

      await axios.post('/api/record', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      
      alert("식단 기록중...");
      const nutritionRes = await axios.get(
        `/api/meal/current-nutrition?userNum=${user.user_num}&mealType=${mealType}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (nutritionRes.data.status === "NOT_FOUND") {
        alert("🛑 죄송합니다. 이 음식의 정보가 없습니다.\n하단의 '정답 제보하기'를 통해 음식의 이름을 알려주시면 빠르게 이 음식정보를 추가하겠습니다");
        setShowModal(false);
        return;
      }
      
      alert("식단 기록 완료! 평가 리포트로 이동합니다. 📊");
      setShowModal(false);

      navigate('/evaluation', { 
        state: { mealResult: nutritionRes.data, mealType: mealType } 
      });
    } catch (error) {
      console.error("기록 실패", error);
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
                {selectedFoods.length}개 선택됨 - 상세 종류 고르기
              </button>
            )}

            {/* 🌟 1차 모달: [신규 생성] LIKE '%음식이름%' 세부 음식 선택 모달창냥! */}
            {showVariantModal && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001
              }}>
                <div style={{
                  backgroundColor: '#fff', padding: '30px', borderRadius: '25px', width: '450px', textAlign: 'center',
                  maxHeight: '70vh', overflowY: 'auto'
                }}>
                  <h3 style={{ color: '#5d4037', marginBottom: '10px' }}>🔍 세부 종류 선택</h3>
                  <p style={{ fontSize: '14px', color: '#e65100', marginBottom: '20px' }}>
                    원래 고르신 <b>'{selectedFoods[currentSearchIndex]}'</b>의 세부 종류가 여러 개 발견되었다냥!<br/>가장 가까운 음식을 골라달라냥 🐾
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {foodVariants.map((food, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectVariant(food.foName || food.fo_name || food)} 
                        style={{
                          padding: '12px', borderRadius: '15px', border: '1px solid #ddd',
                          backgroundColor: '#fffcf9', cursor: 'pointer', fontWeight: 'bold',
                          textAlign: 'left', fontSize: '15px', color: '#5d4037', transition: '0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fbe9e7'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fffcf9'}
                      >
                        🍗 {food.foName || food.fo_name || food}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setShowVariantModal(false)}
                    style={{ padding: '10px 30px', border: 'none', borderRadius: '15px', backgroundColor: '#eee', cursor: 'pointer' }}
                  >
                    창 닫기
                  </button>
                </div>
              </div>
            )}

            {/* 2차 모달: 기존의 [중량 및 식사 종류 입력] 모달창냥! */}
            {showModal && (
              <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
              }}>
                <div style={{
                  backgroundColor: '#fff', padding: '30px', borderRadius: '25px', width: '400px', textAlign: 'center'
                }}>
                  <h3 style={{ color: '#5d4037', marginBottom: '20px' }}>식단 상세 정보 입력</h3>
                  
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

                  {/* 🌟 [수정 구역] AI 이름이 아닌, 완벽히 확정된 세부 음식이름 리스트로 중량을 입력받는다냥! */}
                  <div style={{ textAlign: 'left', marginBottom: '25px' }}>
                    {finalSelectedFoods.map(foodName => (
                      <div key={foodName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: '#e65100' }}>✨ {foodName}</span>
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

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => setShowModal(false)}
                      style={{ flex: 1, padding: '12px', border: 'none', borderRadius: '15px', backgroundColor: '#eee', cursor: 'pointer' }}
                    >취소</button>
                    <button 
                      onClick={() => {
                        console.log("최종 전송 데이터:", { mealType, foodDetails });
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
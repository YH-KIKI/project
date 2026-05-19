import axios from 'axios';

const API_BASE_URL = '/api/diet';

// 1. AI 식단 추천 통신 함수 (모든 탭에서 진짜 데이터를 받아옵니다!)
export const fetchAiRecommendations = async (tabName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/recommend`, {
      params: {
        userNum: 1, 
        type: tabName 
      },
      withCredentials: true 
    });

    console.log(`🔥 [${tabName}] 탭 응답 성공! 데이터:`, response.data);
    const realData = response.data[0] || response.data; 

    // 하드코딩된 'AI 맞춤 분석 식단' 글자 대신 파이썬이 보내준 진짜 메뉴를 렌더링합니다!
    return [
      { 
        id: realData?.id || 999, 
        menu: realData?.menu || '메뉴 로딩 실패', 
        kcal: realData?.kcal || 0, 
        carbs: realData?.carbs || 0,     
        protein: realData?.protein || 0, 
        fat: realData?.fat || 0,         
        sodium: realData?.sodium || 0,   
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150',
        tags: realData?.tags || [] 
      }
    ];

  } catch (error) {
    console.error("🔥 통신 에러 발생:", error);
    alert("식단 데이터를 가져오는데 실패했습니다.");
    return []; 
  }
};

// 2. 파이썬 서버로 사진 보내는 통신 함수
export const testUploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile); 
  formData.append('message', '로로야 이 식단 사진 좀 분석해줘!');

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
    });
    
    console.log("🚀 최종 응답 결과 (Python -> Spring Boot -> React):", response.data);
    alert("사진 전송 완료! 콘솔창을 확인해보세요.");
    return response.data;
  } catch (error) {
    console.error("사진 전송 실패:", error);
    alert("사진 전송에 실패했습니다. 백엔드와 파이썬 서버가 켜져 있는지 확인해주세요.");
  }
};
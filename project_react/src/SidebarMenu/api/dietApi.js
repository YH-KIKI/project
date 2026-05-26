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
    
    // 🔥 1개만 자르던 하드코딩 껍데기를 지우고, 스프링이 준 5개 원본 배열을 통째로 리턴합니다!
    return response.data;

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

// 3. 사용자가 선택한 식단을 DB에 기록하는 통신 함수
export const saveDietRecord = async (payload) => {
  try {
    const formData = new FormData();
    
    // 🌟 핵심: 스프링부트의 @RequestPart("mealData") 규격에 맞게 JSON을 Blob으로 감싸서 보냅니다!
    formData.append("mealData", new Blob([JSON.stringify(payload)], {
      type: "application/json"
    }));
    
    // 사진은 없으므로 mealImageFile은 생략합니다. (Controller에서 required=false 처리되어 있어 문제없음)

    // 기존에 만들어두신 완벽한 API 주소인 /api/meal/record 로 전송!
    const response = await axios.post('/api/meal/record', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error("🔥 식단 기록 저장 실패:", error);
    throw error;
  }
};
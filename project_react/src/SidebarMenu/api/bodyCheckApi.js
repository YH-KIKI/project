import axios from 'axios';

// 스프링부트 주소 (포트 8080)
const API_BASE_URL = '/api/bodycheck';

// 스프링부트로 눈바디 사진과 분석 타입을 쏘는 함수
export const uploadBodyCheckImage = async (imageFile, analyzeType) => {
  const formData = new FormData();
  formData.append('file', imageFile); 
  formData.append('analyzeType', analyzeType); // 'pose', 'outline', 또는 '원본'
  // 유저 번호는 현재 테스트용으로 1번 고정
  formData.append('userNum', 1);

  try {
    const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });
    // 파이썬을 거쳐 스프링부트가 넘겨준 결과 데이터 반환
    return response.data;
  } catch (error) { 
    console.error("🔥 눈바디 업로드 통신 에러:", error); 
    throw error;
  }
};
import axios from 'axios';

// 스프링부트 주소 (포트 8080)
const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/bodycheck`;

// 스프링부트로 눈바디 사진과 분석 타입을 쏘는 함수
export const uploadBodyCheckImage = async (imageFile, analyzeType, userNum) => {
  const formData = new FormData();
  formData.append('file', imageFile); 
  formData.append('analyzeType', analyzeType); 
  formData.append('userNum', userNum); // 이제 고정된 1이 아니라, 컴포넌트에서 넘겨준 진짜 번호를 씁니다!

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
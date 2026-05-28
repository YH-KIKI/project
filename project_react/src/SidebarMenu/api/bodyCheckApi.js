import axios from 'axios';

// 🌟 스프링부트 서버 주소 설정 (.env 파일에 맞춰서 자동 적용됩니다)
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

/**
 * 눈바디 이미지를 스프링 부트 서버로 전송하고 AI 분석 결과를 받아오는 통신 함수
 * @param {File} imageFile - 크롭 및 변환이 완료된 이미지 파일
 * @param {string} analyzeType - 분석 타입 ('원본', 'pose', 'outline')
 * @param {number} userNum - 현재 로그인한 유저의 번호
 * @returns {Promise<Object>} - 백엔드(파이썬)에서 처리된 결과 데이터 { image_base64, score_data }
 */
export const uploadBodyCheckImage = async (imageFile, analyzeType, userNum) => {
  try {
    const formData = new FormData();
    
    // 🌟 스프링부트 컨트롤러의 @RequestParam 명칭과 완벽 매칭!
    formData.append('file', imageFile);
    formData.append('analyzeType', analyzeType); // 👈 이 부분이 'type'이 아니라 'analyzeType'이어야 합니다!
    formData.append('userNum', userNum);

    const response = await axios.post(`${API_BASE_URL}/api/bodycheck/analyze`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    console.error("통신 실패:", error);
    throw error;
  }
};
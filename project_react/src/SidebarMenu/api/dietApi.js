import axios from 'axios';

// 🌟 주소를 백엔드 컨트롤러와 완벽히 맞췄습니다.
const API_BASE_URL = 'http://localhost:8080/api/v1/diet';

export const fetchAiRecommendations = async (tabName) => {
  try {
    if (tabName === '맞춤 식단') {
      
      // 🌟 변경 포인트 1: axios.post -> axios.get 으로 변경!
      // 🌟 변경 포인트 2: params 객체를 사용하여 쿼리스트링(?type=맞춤 식단&userNum=1) 형태로 보냅니다.
      const response = await axios.get(`${API_BASE_URL}/recommend`, {
        params: {
          userNum: 1, 
          type: tabName // 'dietType'이 아니라 컨트롤러에 적힌 'type'으로 맞춥니다.
        },
        withCredentials: true 
      });

      console.log("🔥 백엔드 응답 성공! 데이터:", response.data);

      // 백엔드에서 온 데이터가 배열(List) 형태라면 첫 번째 항목을 꺼내서 사용합니다.
      // (혹시 response.data 구조가 다르면 콘솔을 보고 이 부분을 살짝 고쳐주세요!)
      const realData = response.data[0] || response.data; 

      return [
        { 
          id: 999, 
          menu: 'AI 맞춤 분석 식단', 
          kcal: realData.targetCalorie || 0, // DTO 변수명 확인
          imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150',
          tags: [
            `키: ${realData.height}cm`, 
            `몸무게: ${realData.weight}kg`, 
            '개인맞춤'
          ] 
        }
      ];
    } 
    
    // 다른 탭들은 기존 가짜 데이터 사용
    else {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockDb = {
            '다이어트': [
              { id: 1, menu: '오트밀 베리 샐러드와 삶은 달걀', kcal: 320, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150', tags: ['고단백', '포만감'] },
              { id: 2, menu: '닭가슴살 큐브와 고구마 샐러드', kcal: 380, imageUrl: '', tags: ['저지방'] },
            ],
            '건강유지': [
              { id: 3, menu: '그릭요거트와 제철 과일 볼', kcal: 280, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=150', tags: ['비타민', '유산균'] },
            ],
            '근육증가': [
              { id: 5, menu: '소고기 부채살 스테이크 (250g)', kcal: 650, imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=150', tags: ['근손실방지', '고단백'] },
            ],
            '저탄고지': [
              { id: 7, menu: '버터 듬뿍 스크램블 에그와 베이컨', kcal: 550, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=150', tags: ['키토제닉'] },
            ]
          };
          resolve(mockDb[tabName] || []);
        }, 500); 
      });
    }

  } catch (error) {
    console.error("🔥 통신 에러 발생:", error);
    alert("식단 데이터를 가져오는데 실패했습니다.");
    return []; 
  }
};
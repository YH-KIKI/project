export const fetchAiRecommendations = async (tabName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      
      const mockDb = {
        // 🌟 새롭게 추가된 '맞춤 식단' 데이터 
        // 나중에 백엔드 연결 시, 유저의 설정(DB)에 따라 AI가 이곳에 데이터를 채워줍니다!
        '맞춤 식단': [
          { id: 101, menu: '회원님을 위한 저탄수화물 연어 포케', kcal: 410, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150', tags: ['개인맞춤', '저탄수'] },
          { id: 102, menu: '목표 달성을 위한 닭가슴살 야채 오븐구이', kcal: 350, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150', tags: ['단백질가득'] },
        ],
        '다이어트': [
          { id: 1, menu: '오트밀 베리 샐러드와 삶은 달걀', kcal: 320, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150', tags: ['고단백', '포만감'] },
          { id: 2, menu: '닭가슴살 큐브와 고구마 샐러드', kcal: 380, imageUrl: '', tags: ['저지방'] },
        ],
        '건강유지': [
          { id: 3, menu: '그릭요거트와 제철 과일 볼', kcal: 280, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=150', tags: ['비타민', '유산균'] },
          { id: 4, menu: '소고기 우둔살 비빔밥 (밥 반공기)', kcal: 450, imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=150', tags: ['든든함'] },
        ],
        '근육증가': [
          { id: 5, menu: '소고기 부채살 스테이크 (250g)', kcal: 650, imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=150', tags: ['근손실방지', '고단백'] },
          { id: 6, menu: '닭가슴살 통밀 파스타', kcal: 600, imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=150', tags: ['탄수화물'] },
        ],
        '저탄고지': [
          { id: 7, menu: '버터 듬뿍 스크램블 에그와 베이컨', kcal: 550, imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=150', tags: ['키토제닉'] },
          { id: 8, menu: '아보카도 참치 마요네즈 무침', kcal: 480, imageUrl: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=150', tags: ['건강한지방'] },
        ]
      };
      
      resolve(mockDb[tabName] || []);
      
    }, 800); 
  });
};
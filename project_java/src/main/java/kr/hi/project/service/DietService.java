package kr.hi.project.service; // 🌟 패키지명 일치

import kr.hi.project.dao.UserPrivacyDao;
import kr.hi.project.dto.UserPrivacyDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DietService {

    // 🌟 변경됨: Mapper 대신 Dao를 주입받습니다.
    private final UserPrivacyDao userPrivacyDao;

    public List<Map<String, Object>> getDietRecommendations(Long userNum, String dietType) {
        
        UserPrivacyDTO user = userPrivacyDao.findUserByNum(userNum);
        
        if (user == null) {
            throw new IllegalArgumentException("해당 유저를 찾을 수 없습니다: " + userNum);
        }

        System.out.println("✅ MyBatis DB 조회 성공 - 유저 번호: " + user.getUserNum() + ", 목표 칼로리: " + user.getTargetCalorie());

        // 임시 반환 데이터
        return getMockDataForReact(dietType);
    }

    private List<Map<String, Object>> getMockDataForReact(String type) {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> menu1 = new HashMap<>();
        
        if ("맞춤 식단".equals(type)) {
            menu1.put("id", 101);
            menu1.put("menu", "[MyBatis 백엔드] 회원님을 위한 연어 포케");
            menu1.put("kcal", 410);
            menu1.put("imageUrl", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150");
            menu1.put("tags", Arrays.asList("개인맞춤", "저탄수"));
            list.add(menu1);
        } else if ("다이어트".equals(type)) {
            menu1.put("id", 1);
            menu1.put("menu", "[MyBatis 백엔드] 오트밀 베리 샐러드");
            menu1.put("kcal", 320);
            menu1.put("imageUrl", "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150");
            menu1.put("tags", Arrays.asList("고단백", "포만감"));
            list.add(menu1);
        }
        return list;
    }
}
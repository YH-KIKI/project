package kr.hi.project.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.hi.project.dao.CharacterDao;
import kr.hi.project.dto.CharacterDTO;

@Service
public class CharacterService {

    @Autowired
    private CharacterDao characterDao;

    // 1. 캐릭터 정보 조회
    @Transactional
    public CharacterDTO getCharacterStatus(int userNum) {
        return characterDao.getCharacterInfo(userNum);
    }

    // 2. 캐릭터 타입 변경
    public void updateCharacterType(int userNum, int type) {
        characterDao.updateCharacterType(userNum, type);
    }

    /**
     * [공통 로직] 경험치 추가 및 레벨업 처리
     */
    @Transactional
    public void addExperience(int userNum, int expAmount, String source) {
        CharacterDTO character = characterDao.getCharacterInfo(userNum);
        if (character == null) return;

        int oldLevel = character.getChLevel();
        int newExp = character.getChExp() + expAmount;
        int currentLevel = oldLevel;

        // 만렙(99레벨) 누적 6만 XP 제한 반영
        if (newExp > 60000) {
            newExp = 60000;
        }

        // 레벨업 구간 반복 판정
        while (currentLevel < 99) {
            Integer nextLevelTotalExp = characterDao.getNextLevelRequiredExp(currentLevel);
            if (nextLevelTotalExp == null || newExp < nextLevelTotalExp) {
                break;
            }
            currentLevel++;
        }

        // 외형 번호 계산
        int newCgNum = calculateCgNum(character.getCgNum(), currentLevel);
        boolean isLevelUp = currentLevel > oldLevel;

        // 캐릭터 상태 업데이트
        Map<String, Object> updateParams = new HashMap<>();
        updateParams.put("userNum", userNum);
        updateParams.put("chExp", newExp);
        updateParams.put("chLevel", currentLevel);
        updateParams.put("cgNum", newCgNum);

        characterDao.updateCharacterExpAndLevel(updateParams);
        
        // 경험치 획득 이력 저장
        Map<String, Object> historyParams = new HashMap<>();
        historyParams.put("userNum", userNum);
        historyParams.put("exp", expAmount);
        historyParams.put("source", source); 
        historyParams.put("isLevelUp", isLevelUp ? 1 : 0);
        historyParams.put("currentLv", currentLevel); 

        characterDao.insertExpHistory(historyParams);
    }

    /**
     * 🏃 [활동 보너스 1] 로그인 보상 연산 로직 반영 (하루 1회 제한 추가 🛠️)
     */
    @Transactional
    public void processLoginReward(int userNum, int streakCount) {
        // [중복 체크] 오늘 이미 '로그인'으로 경험치를 가져간 적이 있는지 확인
        Map<String, Object> checkParams = new HashMap<>();
        checkParams.put("userNum", userNum);
        checkParams.put("source", "로그인");
        
        int alreadyGained = characterDao.checkTodayExpHistory(checkParams);
        
        if (alreadyGained > 0) {
            System.out.println("⚠️ [경험치 차단] 유저 " + userNum + "번은 오늘 이미 로그인 보상을 받았습니다.");
            return; // 중복 획득 차단 후 로직 조기 종료
        }

        int xp = 5; // 기본 매일 로그인 5 XP
        
        if (streakCount == 3) {
            xp = 5 + 5;   // 3일 연속 + 5 XP (총 10 XP)
        } else if (streakCount >= 7) {
            xp = 5 + 10;  // 7일 연속 + 10 XP (총 15 XP)
        }
        
        addExperience(userNum, xp, "로그인");
    }

    /**
     * 🏃 [활동 보너스 2] 게시글 작성 보상 추가 (하루 1회 제한 추가 🛠️)
     */
    @Transactional
    public void processPostReward(int userNum) {
        // [중복 체크] 오늘 이미 '게시글작성'으로 경험치를 1회 획득했는지 확인
        Map<String, Object> checkParams = new HashMap<>();
        checkParams.put("userNum", userNum);
        checkParams.put("source", "게시글작성");
        
        int alreadyGained = characterDao.checkTodayExpHistory(checkParams);
        
        if (alreadyGained > 0) {
            System.out.println("⚠️ [경험치 차단] 유저 " + userNum + "번은 오늘 이미 게시글 작성 보상을 1회 받았습니다.");
            return; // 중복 획득 차단 후 로직 조기 종료
        }

        addExperience(userNum, 5, "게시글작성"); // 게시글 작성 5 XP
    }

    /**
     * 🍎 [식단 보상] 일간/주간/월간 등급별 보상 처리 로직 추가
     * @param type  "일간", "주간", "월간" 중 하나
     * @param grade "A", "B", "C", "D" 중 하나
     */
    @Transactional
    public void processMealReward(int userNum, String type, String grade) {
        int xp = 0;
        
        if ("일간".equals(type)) {
            switch (grade) {
                case "A": xp = 50; break;
                case "B": xp = 30; break;
                case "C": xp = 15; break;
                case "D": xp = 5; break;
            }
        } else if ("주간".equals(type)) {
            switch (grade) {
                case "A": xp = 200; break;
                case "B": xp = 100; break;
                case "C": xp = 50; break;
                case "D": xp = 0; break;
            }
        } else if ("월간".equals(type)) {
            switch (grade) {
                case "A": xp = 1000; break;
                case "B": xp = 500; break;
                case "C": xp = 200; break;
                case "D": xp = 0; break;
            }
        }

        if (xp > 0) {
            // 히스토리에 '식단평가A', '주간보상' 등으로 깔끔하게 들어가도록 이름 포맷팅
            String sourceName = "일간".equals(type) ? "식단평가" + grade : type + "보상";
            addExperience(userNum, xp, sourceName);
        }
    }

    /**
     * 캐릭터 레벨 구간별 외형 번호(cg_num) 계산 로직
     */
    private int calculateCgNum(int currentCgNum, int level) {
        int baseType = ((currentCgNum - 1) / 6) * 6; 
        int step;

        if (level >= 99) step = 6;      // 🌟 전설 (Lv 99)
        else if (level >= 91) step = 5; // 👑 다이어트 신 (Lv 91 ~ 98)
        else if (level >= 61) step = 4; // 🏋️ 건강 마스터 (Lv 61 ~ 90)
        else if (level >= 31) step = 3; // 🍎 프로 식단러 (Lv 31 ~ 60)
        else if (level >= 11) step = 2; // 🌱 쑥쑥 자라요 (Lv 11 ~ 30)
        else step = 1;                  // 🐣 식단 병아리 (Lv 1 ~ 10)

        return baseType + step;
    }
}
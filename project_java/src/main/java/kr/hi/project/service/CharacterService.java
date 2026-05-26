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

    // 1. 기존 캐릭터 정보 조회 (방어 코드 추가)
    @Transactional
    public CharacterDTO getCharacterStatus(int userNum) {
        CharacterDTO character = characterDao.getCharacterInfo(userNum);
        
        // [방어 코드] 만약 DB 트리거 누락 등으로 캐릭터가 없다면 여기서 최초 1회 생성해줌
        if (character == null) {
            Map<String, Object> initParams = new HashMap<>();
            initParams.put("userNum", userNum);
            // MyBatis 마퍼에 해당 유저의 기본 캐릭터(레벨1, 경험치0, cg_num=1)를 인서트하는 메서드가 있다고 가정
            // characterDao.insertDefaultCharacter(userNum); 
            // character = characterDao.getCharacterInfo(userNum);
        }
        return character;
    }

    // 2. 캐릭터 타입 변경 (수동 변경용)
    public void updateCharacterType(int userNum, int type) {
        characterDao.updateCharacterType(userNum, type);
    }

    /**
     * [핵심 로직] 경험치 추가 및 레벨업 처리
     */
    @Transactional
    public void addExperience(int userNum, int expAmount, String source) {
        // 1) 현재 캐릭터 정보 가져오기
        CharacterDTO character = characterDao.getCharacterInfo(userNum);
        if (character == null) return;

        int oldLevel = character.getChLevel();
        int newExp = character.getChExp() + expAmount;
        int currentLevel = oldLevel;

        // 2) 레벨업 로직 (누적 경험치 기반)
        while (currentLevel < 99) {
            Integer nextLevelTotalExp = characterDao.getNextLevelRequiredExp(currentLevel);
            
            // 다음 레벨 요구치 데이터가 없거나, 현재 내 누적 경험치가 요구치보다 적으면 중단
            if (nextLevelTotalExp == null || newExp < nextLevelTotalExp) {
                break;
            }
            currentLevel++;
        }

        // 3) 레벨 구간별 외형 번호 계산
        int newCgNum = calculateCgNum(character.getCgNum(), currentLevel);
        boolean isLevelUp = currentLevel > oldLevel;

        // 4) DB 업데이트 (캐릭터 상태)
        Map<String, Object> updateParams = new HashMap<>();
        updateParams.put("userNum", userNum);
        updateParams.put("chExp", newExp);
        updateParams.put("chLevel", currentLevel);
        updateParams.put("cgNum", newCgNum);

        characterDao.updateCharacterExpAndLevel(updateParams);
        
        // 5) 경험치 획득 이력 저장
        Map<String, Object> historyParams = new HashMap<>();
        historyParams.put("userNum", userNum);
        historyParams.put("exp", expAmount);
        historyParams.put("source", source); // DB에 한글('로그인', '식단평가A')로 들어가므로 한글 값이 와야 함
        historyParams.put("isLevelUp", isLevelUp ? 1 : 0);
        historyParams.put("currentLv", currentLevel); 

        characterDao.insertExpHistory(historyParams);
    }

    /**
     * 로그인 보상 로직 연산
     */
    public void processLoginReward(int userNum, int streakCount) {
        int xp = 5; 
        // 🛠️ DB의 exp_details 테이블 ed_type 값인 '로그인'과 일치하도록 한글로 수정 완료
        String sourceKey = "로그인"; 

        if (streakCount == 3) {
            xp = 10; 
        } else if (streakCount >= 7) {
            xp = 15; 
        }
        
        addExperience(userNum, xp, sourceKey);
    }

    /**
     * 캐릭터 레벨 구간별 외형 번호 계산
     */
    private int calculateCgNum(int currentCgNum, int level) {
        int baseType = ((currentCgNum - 1) / 6) * 6; 
        int step;

        if (level >= 99) step = 6;      // 전설 (99)
        else if (level >= 91) step = 5; // 다이어트 신 (91~98)
        else if (level >= 61) step = 4; // 건강 마스터 (61~90)
        else if (level >= 31) step = 3; // 프로 식단러 (31~60)
        else if (level >= 11) step = 2; // 쑥쑥 자라요 (11~30)
        else step = 1;                  // 식단 병아리 (1~10)

        return baseType + step;
    }
}
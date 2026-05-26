package kr.hi.project.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.hi.project.dao.CharacterDao;
import kr.hi.project.dto.CharacterDTO;

@Service
public class CharacterService {

    @Autowired
    private CharacterDao characterDao;

    // 1. 기존 캐릭터 정보 조회
    public CharacterDTO getCharacterStatus(int userNum) {
        return characterDao.getCharacterInfo(userNum);
    }

    // 2. 캐릭터 타입 변경 로직 수정
    public void updateCharacterType(int userNum, int type) {
        // DB 설계상 character 테이블의 cg_num만 바꾸면 
        // JOIN을 통해 cgName과 cgImg가 자동으로 결정됩니다.
        // 수정된 Dao의 메서드를 호출합니다.
        characterDao.updateCharacterType(userNum, type);
    }
    
    public int getRequiredExp(int level) {
        if (level >= 91) return 1000;
        if (level >= 61) return 750;
        if (level >= 31) return 500;
        if (level >= 11) return 250;
        return 100;
    }

    public void addExperience(int userNum, int edNum, int expAmount, String reason) {
        
        // 오늘 영수증이 있는지 검사
        if (edNum == 10) {
            int alreadyGot = characterDao.checkTodayExpHistory(userNum, edNum);
            if (alreadyGot > 0) {
                System.out.println("❌ 오늘 이미 로그인 출석 보상을 받으셨다냥!");
                return;
            }
        }
        
        // 게시글 작성 보상(8번) 하루 최대 3번만
        if (edNum == 8) {
            int alreadyGot = characterDao.checkTodayExpHistory(userNum, edNum);
            if (alreadyGot >= 3) { // 오늘 쓴 글 영수증이 3개 이상 쌓였다면
                System.out.println("❌ 오늘 게시글 작성 보상(3회)을 모두 채우셨다냥! 글은 써지지만 경험치는 안 준다냥!");
                return; // 경험치 안 주고 여기서 튕겨내기
            }
        }

        CharacterDTO character = characterDao.getCharacterInfo(userNum);
        if (character == null) return;

        // 레벨업 판정 while 루프 구역은 그대로 유지
        int currentLevel = character.getChLevel();
        int currentExp = character.getChExp() + expAmount;
        while (currentExp >= getRequiredExp(currentLevel)) {
            currentExp -= getRequiredExp(currentLevel);
            currentLevel++;
        }

        // 캐릭터 실시간 점수 업데이트
        Map<String, Object> updateParams = new HashMap<>();
        updateParams.put("userNum", userNum);
        updateParams.put("chLevel", currentLevel);
        updateParams.put("chExp", currentExp);
        characterDao.updateCharacterExpAndLevel(updateParams);

        // 영수증 박기 (ch_num 자리에 0 안 꽂히게 확실하게 묶기)
        Map<String, Object> historyParams = new HashMap<>();
        
        historyParams.put("chNum", character.getChNum() == 0 ? userNum : character.getChNum()); 
        
        historyParams.put("edNum", edNum);
        historyParams.put("ehExp", expAmount);
        historyParams.put("ehTypeName", reason);           
        
        characterDao.insertExpHistory(historyParams); 
        System.out.println("💾 영수증에 진짜 번호 쾅 박기 대성공이다냥!");
    }
}
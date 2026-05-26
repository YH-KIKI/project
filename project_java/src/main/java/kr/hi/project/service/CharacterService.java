package kr.hi.project.service;

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
}
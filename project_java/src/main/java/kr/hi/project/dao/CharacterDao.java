package kr.hi.project.dao;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import kr.hi.project.dto.CharacterDTO;
import java.util.HashMap;
import java.util.Map;

@Repository
public class CharacterDao {

    @Autowired
    private SqlSession sqlSession;

    // 1. 마이페이지 캐릭터 정보 조회
    public CharacterDTO getCharacterInfo(int userNum) {
        return sqlSession.selectOne("kr.hi.project.dao.CharacterDao.getCharacterInfo", userNum);
    }

    // 2. 캐릭터 타입 변경 업데이트 메서드 추가
    public void updateCharacterType(int userNum, int type) {
        // 파라미터가 2개 이상일 때는 Map에 담아서 전달해야 매퍼(XML)에서 인식할 수 있습니다.
        Map<String, Object> params = new HashMap<>();
        params.put("userNum", userNum);
        params.put("type", type);

        sqlSession.update("kr.hi.project.dao.CharacterDao.updateCharacterType", params);
    }

    // 게시글 등록 성공 로직 바로 밑이나 식단 분석 성공 로직 밑에
    // 5XP 누적 + 자동 레벨업 작동
    // characterService.addExperience(userNum, 5);
    public void updateCharacterExpAndLevel(Map<String, Object> params) {
        sqlSession.update("kr.hi.project.dao.CharacterDao.updateCharacterExpAndLevel", params);
    }
    
    // 오늘출석검사
    public int checkTodayExpHistory(int userNum, int edNum) {
        Map<String, Object> params = new HashMap<>();
        params.put("userNum", userNum);
        params.put("edNum", edNum);
        return sqlSession.selectOne("kr.hi.project.dao.CharacterDao.checkTodayExpHistory", params);
    }

    public void insertExpHistory(Map<String, Object> params) {
        sqlSession.insert("kr.hi.project.dao.CharacterDao.insertExpHistory", params);
    }
}
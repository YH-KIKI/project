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

    // 2. 캐릭터 타입(외형) 수동 변경
    public void updateCharacterType(int userNum, int type) {
        Map<String, Object> params = new HashMap<>();
        params.put("userNum", userNum);
        params.put("type", type);
        sqlSession.update("kr.hi.project.dao.CharacterDao.updateCharacterType", params);
    }

    /**
     * 3. 다음 레벨업에 필요한 누적 경험치 조회
     */
    public Integer getNextLevelRequiredExp(int currentLevel) {
        return sqlSession.selectOne("kr.hi.project.dao.CharacterDao.getNextLevelRequiredExp", currentLevel);
    }

    /**
     * 4. 경험치, 레벨, 외형(성장단계) 일괄 업데이트
     */
    public void updateCharacterExpAndLevel(Map<String, Object> params) {
        sqlSession.update("kr.hi.project.dao.CharacterDao.updateCharacterExpAndLevel", params);
    }

    /**
     * 5. 경험치 획득 이력(History) 저장
     * Service에서 넘겨준 Map(userNum, exp, source, isLevelUp)을 그대로 Mapper에 전달합니다.
     */
    public void insertExpHistory(Map<String, Object> params) {
        sqlSession.insert("kr.hi.project.dao.CharacterDao.insertExpHistory", params);
    }

    /**
     * 🛠️ 6. [추가] 오늘 특정 활동으로 경험치를 획득했는지 카운트 체크 (하루 1회 제한용)
     * Service에서 넘겨준 Map(userNum, source)을 받아 Mapper의 중복 체크 쿼리를 호출합니다.
     */
    public int checkTodayExpHistory(Map<String, Object> params) {
        return sqlSession.selectOne("kr.hi.project.dao.CharacterDao.checkTodayExpHistory", params);
    }
}
package kr.hi.project.dao;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import kr.hi.project.dto.ExpHistoryDTO;

@Repository
public class ExpHistoryDao {

    @Autowired
    private SqlSession sqlSession;

    // 🚀 XML 파일의 <mapper namespace="..."> 태그 값과 정확히 일치해야 하는 경로 상술입니다.
    private static final String NAMESPACE = "kr.hi.project.mapper.ExpHistoryMapper";

    /**
     * 🌟 유저 아이디를 통해 유저 고유 번호(user_num)를 조회합니다.
     */
    public Integer findUserNumByUserId(String userId) {
        return sqlSession.selectOne(NAMESPACE + ".findUserNumByUserId", userId);
    }

    /**
     * 📊 특정 유저의 캐릭터 경험치 히스토리 목록을 페이징 맵 파라미터로 조회합니다.
     */
    public List<ExpHistoryDTO> getHistoryList(int userNum, int offset, int limit) {
        Map<String, Object> params = new HashMap<>();
        params.put("userNum", userNum);
        params.put("offset", offset);
        params.put("limit", limit);
        
        return sqlSession.selectList(NAMESPACE + ".getHistoryList", params);
    }

    /**
     * 🔢 해당 유저의 전체 히스토리 데이터 개수를 카운트합니다.
     */
    public int getTotalCount(int userNum) {
        return sqlSession.selectOne(NAMESPACE + ".getTotalCount", userNum);
    }
}
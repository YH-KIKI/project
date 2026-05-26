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

    private static final String NAMESPACE = "kr.hi.project.mapper.ExpHistoryMapper";

    /**
     * 🌟 [추가] 유저 아이디를 통해 유저 고유 번호(user_num)를 조회합니다.
     */
    public Integer findUserNumByUserId(String userId) {
        return sqlSession.selectOne(NAMESPACE + ".findUserNumByUserId", userId);
    }

    public List<ExpHistoryDTO> getHistoryList(int userNum, int offset, int limit) {
        Map<String, Object> params = new HashMap<>();
        params.put("userNum", userNum);
        params.put("offset", offset);
        params.put("limit", limit);
        
        return sqlSession.selectList(NAMESPACE + ".getHistoryList", params);
    }

    public int getTotalCount(int userNum) {
        return sqlSession.selectOne(NAMESPACE + ".getTotalCount", userNum);
    }
}
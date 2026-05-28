package kr.hi.project.dao;

import kr.hi.project.dto.BadgeDTO;
import org.apache.ibatis.session.SqlSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class BadgeDao {

    @Autowired
    private SqlSession sqlSession;

    private static final String NAMESPACE =
            "kr.hi.project.mapper.BadgeMapper.";

    // =========================
    // 전체 뱃지 조회
    // =========================
    public List<BadgeDTO> getUserBadges(int userNum) {
        return sqlSession.selectList(NAMESPACE + "getUserBadges", userNum);
    }

    // =========================
    // 진행도 업데이트
    // =========================
    public int updateBadgeProgress(String badgeId, int userNum, int value) {

        Map<String, Object> map = new HashMap<>();
        map.put("badgeId", badgeId);
        map.put("userNum", userNum);
        map.put("value", value);

        return sqlSession.update(NAMESPACE + "updateBadgeProgress", map);
    }

    // =========================
    // 레벨업
    // =========================
    public int levelUpBadge(String badgeId, int userNum, int maxLevel) {

        Map<String, Object> map = new HashMap<>();
        map.put("badgeId", badgeId);
        map.put("userNum", userNum);
        map.put("maxLevel", maxLevel);

        return sqlSession.update(NAMESPACE + "levelUpBadge", map);
    }

    // =========================
    // 대표 뱃지 설정
    // =========================
    public int setEquippedBadge(String badgeId, int userNum) {

        Map<String, Object> map = new HashMap<>();
        map.put("badgeId", badgeId);
        map.put("userNum", userNum);

        return sqlSession.update(NAMESPACE + "setEquippedBadge", map);
    }

    // =========================
    // 조건 조회
    // =========================
    public BadgeDTO getBadgeCondition(String badgeId, int level) {

        Map<String, Object> map = new HashMap<>();
        map.put("badgeId", badgeId);
        map.put("level", level);

        return sqlSession.selectOne(NAMESPACE + "getBadgeCondition", map);
    }

    // =========================
    // ❌ 삭제해야 정상 (Mapper 없음)
    // getEventCount → 지금 구조에서는 사용 불가
    // =========================
}
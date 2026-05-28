package kr.hi.project.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DietAnalysisDao {
    
    // 1. 특정 사용자의 특정 날짜(mk_created_at 기준) 총 섭취량 계산
    Map<String, Object> selectDailyTotalNutrients(@Param("userNum") Long userNum, @Param("date") String date);
    
    // 2. 사용자의 목표 칼로리 가져오기 (user_privacy)
    Integer selectUserTargetKcal(@Param("userNum") Long userNum);
    
    // 사용자의 식단 목표 타입(다이어트, 근육증가 등) 가져오기
    String selectUserDietType(@Param("userNum") Long userNum);
    
    // 3. 경험치 업데이트 (character 테이블의 ch_exp)
    void updateCharacterExp(@Param("userNum") Long userNum, @Param("earnedXp") int earnedXp);
    
    List<String> selectRecordedDates(@Param("userNum") Long userNum);
    
    // 특정 기간 동안의 일별 통계 데이터 조회
    List<Map<String, Object>> selectStatsByPeriod(
        @Param("userNum") Long userNum, 
        @Param("startDate") String startDate, 
        @Param("endDate") String endDate
    );
    
 	
}
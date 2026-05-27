package kr.hi.project.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DietDao {
    // 오늘 추천 호출 여부 체크
    int checkTodayRecommendCount(@Param("userNum") Long userNum, @Param("today") String today);

    // 식단 추천 로그 기록
    void insertRecommendLog(@Param("userNum") Long userNum, @Param("today") String today);
    

}
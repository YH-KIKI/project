package kr.hi.project.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.domain.FoodDTO;
import kr.hi.project.domain.MealDayDTO;
import kr.hi.project.domain.MealDetailDTO;
import kr.hi.project.domain.MealLogDTO;
import kr.hi.project.domain.MealMonthDTO;
import kr.hi.project.domain.MealWeekDTO;

@Mapper
public interface MealDao {
    //식단 로그 저장
    void insertMealLog(MealLogDTO log);

    //식단 상세 정보 저장
    void insertMealDetail(MealDetailDTO detail);

    //음식 이름으로 영양 정보 가져오기
    FoodDTO findFoodByName(String foName);
    
    // 오늘 날짜와 유저번호로 mday_num이 있는지 확인
    Integer findMdayNumByToday(@Param("usernum") int usernum);

    // 새로운 meal_day 생성
    void insertMealDay(MealDayDTO mday);

    Integer findMonthNum(
    	    @Param("userNum") int userNum, 
    	    @Param("year") int year, 
    	    @Param("month") int month
    	);

    Integer findWeekNum(
    	    @Param("mmNum") Integer mmNum, 
    	    @Param("year") int year, 
    	    @Param("month") int month, 
    	    @Param("week") int week
    	);

    Integer findDayNum(
    	    @Param("mwNum") Integer mwNum, 
    	    @Param("day") int day
    	);

	void insertMonth(MealMonthDTO mm);

	void insertWeek(MealWeekDTO mw);

	void insertDay(MealDayDTO md);

	void updateDailyKcal(@Param("mdayNum") Integer mdayNum);
}
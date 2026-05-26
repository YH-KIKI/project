package kr.hi.project.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.FoodDTO;
import kr.hi.project.dto.MealDayDTO;
import kr.hi.project.dto.MealDetailDTO;
import kr.hi.project.dto.MealLogDTO;
import kr.hi.project.dto.MealMonthDTO;
import kr.hi.project.dto.MealWeekDTO;

@Mapper
public interface MealRecordDao {

    int insertMealLog(MealLogDTO mealLog);

    FoodDTO findFoodByName(@Param("foName") String foName);
    
	//레시피 등록을 위한 가짜 food 필드만들기
	void insertRecipeAsFood(FoodDTO food);

    int insertMealDetail(MealDetailDTO detail);

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

    int insertMonth(MealMonthDTO monthDTO);

    int insertWeek(MealWeekDTO weekDTO);

    int insertDay(MealDayDTO dayDTO);

    int updateDailyKcal(@Param("mdayNum") Integer mdayNum);

	List<MealDetailDTO> getTodayMealRecord(@Param("userNum") int userNum, @Param("date") String date);
	
	List<String> findRecordedDates(@Param("userNum") int userNum);
	
	void deleteMealDetails(@Param("mkNum") int mkNum);

	void deleteMealLog(@Param("mkNum") int mkNum);
	
	List<Integer> findMealLogNumsForUpdate(@Param("userNum") int userNum, @Param("mkMealType") String mkMealType, @Param("mdayNum") int mdayNum);

	void deleteMealDetailsByMkNums(List<Integer> mkNums);

	void deleteMealLogsByMkNums(List<Integer> mkNums);
	

}
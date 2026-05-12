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

	List<MealDetailDTO> getTodayMealRecord(@Param("userNum") int userNum);
}
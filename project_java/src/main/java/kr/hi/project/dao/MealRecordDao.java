package kr.hi.project.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.FoodDTO;
import kr.hi.project.dto.MealDetailDTO;
import kr.hi.project.dto.MealLogDTO;

@Mapper
public interface MealRecordDao {

    // meal_log 저장
    int insertMealLog(MealLogDTO mealLog);

    // 음식 이름으로 조회
    FoodDTO findFoodByName(@Param("foName") String foName);

    // meal_detail 저장
    int insertMealDetail(MealDetailDTO detail);
}
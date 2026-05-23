package kr.hi.project.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.FoodDTO;

@Mapper
public interface FoodDao {

    // 전체 음식 조회
    List<FoodDTO> getFoodList();

    // 음식명 검색
    List<FoodDTO> searchFood(@Param("keyword") String keyword);

    // 음식 번호로 조회
    FoodDTO getFoodByNum(@Param("foNum") int foNum);
}
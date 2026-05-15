package kr.hi.project.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.MealDetailDTO;
import kr.hi.project.dto.MealFavoritesDTO;

@Mapper
public interface MealFavoritesDao {

    List<MealFavoritesDTO> getMealFavorites(@Param("userNum") int userNum);

    int insertMealFavorite(MealFavoritesDTO dto);

    int deleteMealFavorite(
            @Param("userNum") int userNum,
            @Param("mfNum") int mfNum
    );

    int existsMealFavorite(
            @Param("userNum") int userNum,
            @Param("mkNum") int mkNum
    );
    
    
    MealFavoritesDTO getMealFavoriteDetail(@Param("userNum") int userNum,  @Param("mfNum") int mfNum);

    List<MealDetailDTO> getMealFavoriteFoods(@Param("mkNum") int mkNum);

    void updateMealFavoriteMemo(MealFavoritesDTO dto);
    
    void updateMealFavoriteName(MealFavoritesDTO dto);
}
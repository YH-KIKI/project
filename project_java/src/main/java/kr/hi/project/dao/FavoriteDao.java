package kr.hi.project.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.MealFavoritesDTO;

@Mapper
public interface FavoriteDao {

	List<Map<String, Object>> getMealLogsWithFav(@Param("userNum") int userNum);

    List<MealFavoritesDTO> getFavoriteList(@Param("userNum") int userNum);

    void addFavorite(@Param("userNum") int userNum, @Param("mkNum") int mkNum);

	void deleteFavorite(@Param("mfNum") int mfNum);

	List<Map<String, Object>> getDetailsByMkNum(@Param("mkNum") int oldMkNum);

	String findImageUrlByMkNum(@Param("mkNum") int oldMkNum);

}

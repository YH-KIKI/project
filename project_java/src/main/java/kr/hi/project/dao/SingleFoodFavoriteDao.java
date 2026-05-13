package kr.hi.project.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.SingleFoodFavoriteDTO;

@Mapper
public interface SingleFoodFavoriteDao {

    List<SingleFoodFavoriteDTO> getSingleFoodFavorites(
            @Param("userNum") int userNum
    );

    int existsSingleFoodFavorite(
            @Param("userNum") int userNum,
            @Param("foNum") int foNum
    );

    int insertSingleFoodFavorite(SingleFoodFavoriteDTO dto);

    int deleteSingleFoodFavorite(
            @Param("userNum") int userNum,
            @Param("sfNum") int sfNum
    );
}
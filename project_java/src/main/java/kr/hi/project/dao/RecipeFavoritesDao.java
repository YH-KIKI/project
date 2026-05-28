package kr.hi.project.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.RecipeFavoritesDTO;

@Mapper
public interface RecipeFavoritesDao {

    List<RecipeFavoritesDTO> getRecipeFavorites(int userNum);

    void insertRecipeFavorite(RecipeFavoritesDTO dto);

    void deleteRecipeFavorite(
            @Param("userNum") int userNum,
            @Param("rcpNum") int rcpNum
    );
}
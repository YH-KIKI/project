package kr.hi.project.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.FridgeRecipeDTO;
import kr.hi.project.dto.FridgeRecipeStepDTO;
import kr.hi.project.dto.FridgeSummaryDTO;

@Mapper
public interface FridgeDao {

    FridgeSummaryDTO getFridgeSummary(
        @Param("userNum") int userNum
    );
    
    
    List<FridgeRecipeDTO> findRecipesByIngredients(
    		 @Param("ingredients") List<String> ingredients
    );


	List<FridgeRecipeStepDTO> getRecipeSteps(@Param("rcpNum") int rcpNum);
	
}
package kr.hi.project.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.FridgeSummaryDTO;

@Mapper
public interface FridgeDao {

    FridgeSummaryDTO getFridgeSummary(
        @Param("userNum") int userNum
    );
}
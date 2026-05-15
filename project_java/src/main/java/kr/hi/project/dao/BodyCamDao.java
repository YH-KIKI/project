package kr.hi.project.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import kr.hi.project.dto.BodyCamDTO;

@Mapper
public interface BodyCamDao {
    // 눈바디 기록 DB에 저장하기
    void insertBodyCamRecord(BodyCamDTO dto);
    
    List<BodyCamDTO> selectBodyCamList(int userNum);
    // 눈바디 기록 삭제
    void deleteBodyCamRecord(int bcNum);
}
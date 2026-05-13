package kr.hi.project.dao;

import kr.hi.project.dto.BodyCamDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface BodyCamDao {
    // 눈바디 기록 DB에 저장하기
    void insertBodyCamRecord(BodyCamDTO dto);
}
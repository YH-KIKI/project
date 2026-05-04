package kr.hi.project.dao; // 🌟 패키지명 일치

import kr.hi.project.dto.DietUserDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserPrivacyDao {
    // 유저 번호로 정보를 조회
    DietUserDTO findUserByNum(@Param("userNum") Long userNum);
}
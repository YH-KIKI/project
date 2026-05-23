package kr.hi.project.dao; // 🌟 패키지명 일치

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.DietUserDTO;
import kr.hi.project.dto.UserPrivacyDTO;

@Mapper
public interface UserPrivacyDao {
    // 유저 번호로 정보를 조회
    DietUserDTO findUserByNum(@Param("userNum") Long userNum);
    
    
    // 유저 프라이버시 정보를 조회 [대빵]
	UserPrivacyDTO findNutritionTargetByUserNum(@Param("userNum") int userNum);
	
	
}
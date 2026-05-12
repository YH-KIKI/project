package kr.hi.project.dao;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.UserDTO;
import kr.hi.project.dto.UserPrivacyDTO;

@Mapper
public interface UserDao {
    Map<String, String> findByUserid(@Param("userId") String userid);

	void insertUser(UserDTO user);

	String findUsernameByUserid(String userid);

	String findEmailByUserid(String userid);

	int findUsernumByUserid(String userid);

	void informationUpdata(UserPrivacyDTO userPrivacyDTO);

	UserPrivacyDTO getUserInfo(int usernum);

	List<String> findUserAllergies(int usernum);

	void deleteUserAllergies(int usernum);

	void insertUserAllergy(@Param("userNum") int userNum, @Param("alName") String alName);
	
	// [재근/추가] 눈바디 암호화를 위해 추가
	String findPasswordByUserNum(Long userNum);
	// [준성/추가] 목표보기 결과가 여러 영양소(kcal, carbs 등)이므로 Map으로 받습.
	Map<String, Object> getTodayTotalNutrition(@Param("userNum") int userNum);
}
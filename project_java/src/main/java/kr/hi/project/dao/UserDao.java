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
	
	//--------------카카오톡----------------
	// 1. 카카오 고유 ID로 연동된 유저 번호가 있는지 찾기
	Integer findUserNumByKakaoId(String kakaoId);

	// 2. 카카오 유저용 기본 회원 정보 삽입 (소셜 회원 플래그 1로 세팅)
	void insertSocialUser(kr.hi.project.dto.UserDTO userDTO);

	// 3. 소셜 계정 연동 테이블에 카카오 아이디 매핑 정보 저장
	void insertSocialAccount(Map<String, Object> socialData);
	
	int findUserByEmail(String userEmail);
	
	void insertSocialUserWithEmail(UserDTO userDTO);
	//--------------------------------------
}
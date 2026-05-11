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

	void insertUserAllergy(@Param("usernum") int usernum, @Param("alName") String alName);
}
package kr.hi.project.dao;

import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.domain.UserDTO;

@Mapper
public interface UserDao {
    Map<String, String> findByUserid(@Param("userid") String userid);

	void insertUser(UserDTO user);

	String findUsernameByUserid(String userid);
}
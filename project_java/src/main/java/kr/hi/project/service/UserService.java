package kr.hi.project.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import kr.hi.project.dao.UserDao;
import kr.hi.project.domain.UserDTO;
import kr.hi.project.domain.UserPrivacyDTO;

@Service
public class UserService {
    @Autowired
    private UserDao userDAO; // XML

    public Map<String, String> authenticate(String userid, String password) {
        // XML
        Map<String, String> user = userDAO.findByUserid(userid);

        if (user != null &&passwordEncoder.matches(password, user.get("user_password"))) {
            return user;
        }
        return null;
    }
    
    @Autowired
    private PasswordEncoder passwordEncoder;//SecurityConfig에서 만든 암호화 도구
    
    public void register(UserDTO user) {
        if (user.getPassword().length() > 10) {
            throw new RuntimeException("비밀번호가 너무 깁니다. (최대 10자)");
        }
    	
    	//암호화
    	String encodedPassword = passwordEncoder.encode(user.getPassword());
    	
    	//암호화된 비밀번호를 DB에 저장합니다.
    	user.setPassword(encodedPassword);
    	userDAO.insertUser(user);
    }

	public String findUsernameByUserid(String userid) {
		String username = userDAO.findUsernameByUserid(userid);
		return username;
	}

	public String findEmailByUserid(String userid) {
		String email = userDAO.findEmailByUserid(userid);
		return email;
	}

	public int findUsernumByUserid(String userid) {
		int usernum = userDAO.findUsernumByUserid(userid);
		return usernum;
	}

	public void informationUpdata(UserPrivacyDTO userPrivacyDTO) {
		userDAO.informationUpdata(userPrivacyDTO);
		
	}

	public UserPrivacyDTO getUserInfo(int usernum) {
		return userDAO.getUserInfo(usernum);
	}
    
}
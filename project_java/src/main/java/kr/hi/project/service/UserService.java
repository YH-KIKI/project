package kr.hi.project.service;

import java.util.List;
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

	public void informationUpdata(UserPrivacyDTO dto) {
        calculateAndSetGoals(dto);
        //계산된 결과가 포함된 DTO를 DB에 업데이트합니다.
        userDAO.informationUpdata(dto);
        //추가로 알레르기 정보가 있다면 여기서 처리
    }

    //영양소 계산 전용 내부 메서드
    private void calculateAndSetGoals(UserPrivacyDTO dto) {
        //기초대사량(BMR) 계산
        double bmr;
        if ("M".equals(dto.getGender())) {
            bmr = (10 * dto.getWeight()) + (6.25 * dto.getHeight()) - (5 * dto.getAge()) + 5;
        } else {
            bmr = (10 * dto.getWeight()) + (6.25 * dto.getHeight()) - (5 * dto.getAge()) - 161;
        }

        //유지 칼로리(TDEE) 계산 (활동지수 Act 곱하기)
        double tdee = bmr * dto.getAct();

        //목표 칼로리 설정 (감량/유지/증량 판단 로직)
        int calorieAdjustment = 0;
        if (dto.getWeight() > dto.getTargetweight()) {
            calorieAdjustment = -500; // 다이어트
        } else if (dto.getWeight() < dto.getTargetweight()) {
            calorieAdjustment = 300;  // 뚱뚱해지고 싶다
        }
        
        int targetKcal = (int) Math.round(tdee + calorieAdjustment);

        //영양소 배분 (탄 5 : 단 3 : 지 2) 후 DTO에 저장
        dto.setDailykcal(targetKcal);
        dto.setDailycarbs((int) Math.round((targetKcal * 0.5) / 4));
        dto.setDailyprotein((int) Math.round((targetKcal * 0.3) / 4));
        dto.setDailyfat((int) Math.round((targetKcal * 0.2) / 9));
        dto.setDailynatrium(2000); // 고정값
    }

	public UserPrivacyDTO getUserInfo(int usernum) {
		return userDAO.getUserInfo(usernum);
	}

	public List<String> findUserAllergies(int usernum) {
	    return userDAO.findUserAllergies(usernum);
	}
    
}
package kr.hi.project.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import kr.hi.project.dao.UserDao;
import kr.hi.project.dto.UserDTO;
import kr.hi.project.dto.UserPrivacyDTO;

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
        if (user.getUserPassWord().length() > 10) {
            throw new RuntimeException("비밀번호가 너무 깁니다. (최대 10자)");
        }
    	
    	//암호화
    	String encodedPassword = passwordEncoder.encode(user.getUserPassWord());
    	
    	//암호화된 비밀번호를 DB에 저장합니다.
    	user.setUserPassWord(encodedPassword);
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
        if (dto.getUserAllergies() != null && !dto.getUserAllergies().isEmpty()) {
            userDAO.deleteUserAllergies(dto.getUserNum());
            for (String alName : dto.getUserAllergies()) {
                userDAO.insertUserAllergy(dto.getUserNum(), alName);
            }
        }
    }

    //영양소 계산 전용 내부 메서드
    private void calculateAndSetGoals(UserPrivacyDTO dto) {
        //1.기초대사량(BMR) 계산
        double bmr;
        if ("M".equals(dto.getUserGender())) {
            bmr = (10 * dto.getUserWeight()) + (6.25 * dto.getUserHeight()) - (5 * dto.getUserAge()) + 5;
        } else {
            bmr = (10 * dto.getUserWeight()) + (6.25 * dto.getUserHeight()) - (5 * dto.getUserAge()) - 161;
        }

        //유지 칼로리(TDEE) 계산 (활동지수 Act 곱하기)
        double tdee = bmr * dto.getUserAct();

        //목표 칼로리 설정 (감량/유지/증량 판단 로직)
        // 2.목표 유형(up_model)에 따른 칼로리 조정 및 탄/단/지 비율 설정
        int targetKcal = (int) Math.round(tdee);
        double carbsRatio = 0.5, proteinRatio = 0.3, fatRatio = 0.2; // 기본값 (건강유지)

        String model = dto.getUserModel(); // up_model 값 (1, 2, 3, 4)
        if ("1".equals(model)) { // 다이어트 (4:4:2)
            // targetKcal -= 500;
            carbsRatio = 0.4; proteinRatio = 0.4; fatRatio = 0.2;
        } else if ("2".equals(model)) { // 건강 유지 (5:3:2)
            carbsRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
        } else if ("3".equals(model)) { // 근육 증량 (5:3:2)
            carbsRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
        } else if ("4".equals(model)) { // 저탄고지 (1:2:7)
            carbsRatio = 0.1; proteinRatio = 0.2; fatRatio = 0.7;
        }

        // 3.하루 총 목표 영양소 저장
        dto.setUserDailyKcal(targetKcal);
        dto.setUserDailyCarbs((int) Math.round((targetKcal * carbsRatio) / 4));
        dto.setUserDailyProtein((int) Math.round((targetKcal * proteinRatio) / 4));
        dto.setUserDailyFat((int) Math.round((targetKcal * fatRatio) / 9));
        dto.setUserDailyNatrium(2000); // 고정값
    }

	public UserPrivacyDTO getUserInfo(int usernum) {
		return userDAO.getUserInfo(usernum);
	}

	public List<String> findUserAllergies(int usernum) {
	    return userDAO.findUserAllergies(usernum);
	}

	/* 오늘 목표보기 */
	public Map<String, Object> getTodayNutrition(int userNum) {
	    return userDAO.getTodayTotalNutrition(userNum);
	}

	// 한끼의 영양성분
	public Map<String, Object> getMealNutrition(int userNum, String mealType) {
		return userDAO.getMealNutrition(userNum, mealType);
	}
    
}
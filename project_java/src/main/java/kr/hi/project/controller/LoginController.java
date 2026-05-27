package kr.hi.project.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dto.UserDTO;
import kr.hi.project.service.CharacterService; // 🔥 주입 완료
import kr.hi.project.service.JwtService;
import kr.hi.project.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class LoginController {
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private CharacterService characterService; // 🔥 캐릭터 서비스 주입 완료

	// *** [박하/수정] 기존에는 문자열만 보냈지만, 숫자가 포함된 객체를 보내기 위해 Object 타입으로 변경
	@PostMapping("/api/login")
	public Map<String, Object> login(@RequestBody Map<String, String> loginData){
		String userid = loginData.get("userid");
		String password = loginData.get("password");
		
		Map<String, String> user = userService.authenticate(userid, password);
		
		if(user != null) {
			// 성공하면 토큰 생성
			String accessToken = jwtService.createToken(userid);
	        String refreshToken = jwtService.createRefreshToken(userid);

			// *** [박하/추가] 토큰뿐만 아니라 로그인 성공 시 해당 아이디의 고유 번호를 DB에서 가져오는 코드를 추가
			int usernum = userService.findUsernumByUserid(userid);
			
			// ==========================================
			// 🚀 [경험치 시스템 연동] 로그인 성공 시 경험치 지급
			// ==========================================
			try {
			    // 우선은 정상 연동 테스트를 위해 기본 streakCount를 1로 전달합니다.
			    // (가이드라인에 따라 기본 5 XP가 캐릭터에 즉시 누적됩니다.)
			    int streakCount = 1; 
			    
			    // 만약 userService나 다른 곳에 연속 출석 계산 메서드가 이미 있다면 아래처럼 바꿀 수 있습니다.
			    // int streakCount = userService.getLoginStreakCount(usernum);
			    
			    characterService.processLoginReward(usernum, streakCount);
			    System.out.println("🌱 [경험치 알림] " + userid + " 유저 로그인 경험치 정산 완료!");
			} catch (Exception e) {
			    // 경험치 지급 중 오류가 나더라도 로그인 자체가 실패하면 안 되므로 예외 처리(try-catch) 적용
			    System.out.println("❌ [경험치 오류] 로그인 보상 지급 중 에러 발생: " + e.getMessage());
			    e.printStackTrace();
			}
			// ==========================================
			
			Map<String, Object> response = new HashMap<>();
			response.put("token", accessToken);
	        response.put("refreshToken", refreshToken); // [준성/추가] 새로 추가
	        response.put("usernum", usernum); // 하단 유실 방지 추가
			
			// *** [박하/추가] 리액트의 localStorage.setItem('user', ...) 형식에 맞게 user 키 안에 유저 정보를 객체로 담아 보냄
			Map<String, Object> userInfo = new HashMap<>();
			userInfo.put("user_num", usernum);
			userInfo.put("user_id", userid);
			userInfo.put("token", accessToken); // 하단 유실 방지 추가
			response.put("user", userInfo);
			
			return response;
		} else {
			throw new RuntimeException("아이디나 비밀번호가 틀렸어요.");
		}
	}
	
	@GetMapping("/api/user/info")
	public Map<String, Object> getUserInfo(@RequestHeader("Authorization") String authHeader) {
	    String token = authHeader.replace("Bearer ", "");
	    //토큰을 해석해서 아이디 가져오기
	    String userid = jwtService.getUsernameFromToken(token);
	    //username 가져오기
	    String username = userService.findUsernameByUserid(userid);
	    //email 가져오기
	    String email = userService.findEmailByUserid(userid);
	    //num 가져오기
	    int usernum = userService.findUsernumByUserid(userid);
	    //응답 보내기
	    Map<String, Object> response = new HashMap<>();
	    response.put("userid", userid);
	    response.put("username", username);
	    response.put("email", email);
	    response.put("usernum", usernum);
	    response.put("message", "당신은 인증된 사용자입니다!");
	    return response;
	}
	
	@PostMapping("/api/signup")
	public Map<String, String> signup(@RequestBody UserDTO userDTO){
		// 1. 서비스 호출 (암호화 및 DB 저장이 일어남)
	    userService.register(userDTO);
	    
	    Map<String, String> response = new HashMap<>();
	    response.put("message", "회원가입이 완료되었습니다!");
		return response;
	}
	
	// 로그인버튼 위해 토큰검사하기
	@GetMapping("/api/auth/validate")
	public Map<String, Object> validateToken(@RequestHeader("Authorization") String authHeader){
		Map<String, Object> response = new HashMap();
		try {
			String token = authHeader.replace("Bearer ", "");
			if (jwtService.validateToken(token)) {
				response.put("isValid", true);
			}else {
	            response.put("isValid", false);
	        }
	    } catch (Exception e) {
	        response.put("isValid", false);
	    }
	    return response;
	}
	
	//가입하기전 중복체크
	@GetMapping("/api/check-duplicate")
	public Map<String, Boolean> checkDuplicate(
			@RequestParam(value = "userid", required = false) String userid,
		    @RequestParam(value = "username", required = false) String username,
		    @RequestParam(value = "email", required = false) String email) {
	    
	    Map<String, Boolean> response = new HashMap<>();
	    
	    if (userid != null) {
	        response.put("isIdTaken", userService.isUserIdTaken(userid));
	    }
	    if (username != null) {
	        response.put("isNameTaken", userService.isUserNameTaken(username));
	    }
	    if (email != null) {
	        // 이메일 중복 체크
	        response.put("isEmailTaken", userService.isEmailTaken(email));
	    }
	    return response;
	}
	

	@PostMapping("/api/auth/refresh")
	public Map<String, Object> refresh(@RequestHeader("Authorization") String authHeader) {
	    String refreshToken = authHeader.replace("Bearer ", "");
	    
	    // Refresh Token이 유효한지 검사
	    if (jwtService.validateToken(refreshToken)) {
	        String userid = jwtService.getUsernameFromToken(refreshToken);
	        
	        // 새로운 Access Token 생성
	        String newAccessToken = jwtService.createToken(userid);
	        
	        Map<String, Object> response = new HashMap<>();
	        response.put("accessToken", newAccessToken);
	        return response;
	    } else {
	        // Refresh Token 자체가 만료되었거나 위조됨
	        throw new RuntimeException("Refresh Token이 만료되었습니다. 다시 로그인하세요.");
	    }
	}

}



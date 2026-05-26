package kr.hi.project.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dto.UserDTO;
import kr.hi.project.service.JwtService;
import kr.hi.project.service.UserService;
import kr.hi.project.service.CharacterService; // 🔥 추가

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class LoginController {
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private UserService userService;

    @Autowired
    private CharacterService characterService; // 🔥 캐릭터 서비스 주입

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

//			int usernum = userService.findUsernumByUserid(userid);
//			Map<String, Object> response = new HashMap<>();
//			response.put("token", token);
			/* *** [기존 코드 주석 처리] 
			Map<String, String> response = new HashMap<>();
			response.put("token", token);
			return response;
			*/

			// *** [박하/추가] 토큰뿐만 아니라 로그인 성공 시 해당 아이디의 고유 번호를 DB에서 가져오는 코드를 추가
			int usernum = userService.findUsernumByUserid(userid);
			
			Map<String, Object> response = new HashMap<>();
			response.put("token", accessToken);
	        response.put("refreshToken", refreshToken); // [준성/추가]새로 추가
			
			// *** [박하/추가] 리액트의 localStorage.setItem('user', ...) 형식에 맞게 user 키 안에 유저 정보를 객체로 담아 보냄
			Map<String, Object> userInfo = new HashMap<>();
			userInfo.put("user_num", usernum);
			userInfo.put("user_id", userid);
			response.put("user", userInfo);
			
			return response;
		}else {
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


}


            Map<String, Object> response = new HashMap<>();
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("user_num", usernum);
            userInfo.put("user_id", userid);
            userInfo.put("token", token); 
            
            response.put("user", userInfo);
            response.put("token", token); 
            response.put("usernum", usernum);
            
            return response;
        } else {
            throw new RuntimeException("아이디나 비밀번호가 틀렸어요.");
        }
    }
    
    @GetMapping("/api/user/info")
    public Map<String, Object> getUserInfo(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        
        String userid = jwtService.getUsernameFromToken(token);
        String username = userService.findUsernameByUserid(userid);
        String email = userService.findEmailByUserid(userid);
        int usernum = userService.findUsernumByUserid(userid);
        
        Map<String, Object> response = new HashMap<>();
        response.put("userid", userid);
        response.put("username", username);
        response.put("email", email);
        response.put("usernum", usernum);
        response.put("message", "당신은 인증된 사용자입니다!");
        
        return response;
    }
    
    @PostMapping("/api/signup")
    public Map<String, String> signup(@RequestBody UserDTO userDTO) {
        userService.register(userDTO);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "회원가입이 완료되었습니다!");
        return response;
    }
}
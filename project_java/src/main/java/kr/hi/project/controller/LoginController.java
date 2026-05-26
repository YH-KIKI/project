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

    @PostMapping("/api/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginData) {
        String userid = loginData.get("userid");
        String password = loginData.get("password");
        
        Map<String, String> user = userService.authenticate(userid, password);
        
        if (user != null) {
            // 1. 토큰 생성
            String token = jwtService.createToken(userid);
            
            // 2. 유저 고유 번호 조회
            int usernum = userService.findUsernumByUserid(userid);
            
            // 🌟 [추가 로직] 로그인 보상 지급
            // 실제 운영 서비스라면 '오늘 이미 받았는지' 체크하는 로직이 UserService 등에 있으면 좋습니다.
            // 여기서는 일단 로그인 성공 시 5XP(기본값)를 지급하도록 연결합니다.
            try {
                // streakCount는 현재 하드코딩(1)되어 있으나, 나중에 DB에서 가져오도록 확장 가능합니다.
                characterService.processLoginReward(usernum, 1); 
            } catch (Exception e) {
                // 경험치 지급 중 에러가 나도 로그인은 성공해야 하므로 예외 처리만 해줍니다.
                System.out.println("경험치 지급 중 오류 발생: " + e.getMessage());
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
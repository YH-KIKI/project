package kr.hi.project.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dao.UserDao;
import kr.hi.project.dto.UserDTO;
import kr.hi.project.service.JwtService;
import kr.hi.project.service.KakaoService;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(origins = "http://localhost:3000")
public class KakaoController {

	@Autowired
    private UserDao userDAO;
	
	@Autowired
    private JwtService jwtService;
	
    @Autowired
    private KakaoService kakaoService; // 서비스 주입!

    @PostMapping("/kakao")
    public ResponseEntity<?> kakaoLogin(@RequestBody Map<String, String> request) {
        String code = request.get("code");

        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body("코드가 없습니다!");
        }

        try {
            // 서비스에서 냠냠플래닛 전용 토큰과 유저 정보 맵을 받아옵니다.
            Map<String, Object> loginResult = kakaoService.processKakaoLogin(code);
            
            // 리액트가 원래 로그인과 완전히 똑같은 규격으로 데이터를 인식하도록 그대로 돌려보냅니다!
            return ResponseEntity.ok().body(loginResult);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("카카오 로그인 처리 중 에러 발생: " + e.getMessage());
        }
    }
    
    @PostMapping("/kakao/register")
    public ResponseEntity<?> registerKakaoUser(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String userName = request.get("userName");
        String userEmail = request.get("userEmail");
        String kakaoId = request.get("kakaoId");

        // 1. 다시 한번 서버에서 이메일 중복 검사 (철통 방어)
        int emailCount = userDAO.findUserByEmail(userEmail);
        if (emailCount > 0) {
            return ResponseEntity.badRequest().body("이미 다른 사용자가 사용 중인 이메일입니다!");
        }

        try {
            // 2. user 테이블에 삽입
            UserDTO newUser = new UserDTO();
            newUser.setUserId(userId);
            newUser.setUserName(userName);
            newUser.setUserEmail(userEmail);
            userDAO.insertSocialUserWithEmail(newUser);
            
            // 3. 연동 테이블에 삽입
            Map<String, Object> socialMap = new HashMap<>();
            socialMap.put("kakaoId", kakaoId);
            socialMap.put("userNum", newUser.getUserNum());
            userDAO.insertSocialAccount(socialMap);

            // 4. 가입이 끝났으니 진짜 로그인 토큰 발행
            String appAccessToken = jwtService.createToken(userId);
            String appRefreshToken = jwtService.createRefreshToken(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("token", appAccessToken);
            response.put("refreshToken", appRefreshToken);
            
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("user_num", newUser.getUserNum());
            userInfo.put("user_id", userId);
            response.put("user", userInfo);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("소셜 가입 처리 중 에러: " + e.getMessage());
        }
    }
}
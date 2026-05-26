package kr.hi.project.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dao.UserDao;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder; // 비밀번호 암호화 비교용 (스프링 시큐리티)

    // 🌟 눈바디 진입 시 비밀번호 확인 API
    @PostMapping("/verify-password")
    public ResponseEntity<Boolean> verifyPassword(
            @RequestBody Map<String, String> request,
            @RequestParam(name = "userNum", defaultValue = "1") Long userNum) {
        
        String inputPassword = request.get("password");
        
        // 1. DB에서 유저의 암호화된 비밀번호를 가져옵니다.
        String dbPassword = userDao.findPasswordByUserNum(userNum); 
        
        // 2. 입력한 비밀번호와 DB 비밀번호 비교 (단순 문자열 비교가 아닌 인코더 사용)
        // 만약 암호화를 적용하지 않으셨다면 dbPassword.equals(inputPassword) 로 하시면 됩니다!
        boolean isMatch = passwordEncoder.matches(inputPassword, dbPassword); 
        
        System.out.println("🔥 비밀번호 검증 요청: " + (isMatch ? "성공" : "실패"));
        
        return ResponseEntity.ok(isMatch);
    }
}
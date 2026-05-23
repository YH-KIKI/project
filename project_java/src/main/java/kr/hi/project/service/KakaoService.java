package kr.hi.project.service;

import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import kr.hi.project.dao.UserDao;
import kr.hi.project.dto.UserDTO;

@Service
public class KakaoService {

    private final String KAKAO_REST_API_KEY = "b4cc1448ae63974d811c00aa509952ee"; // 본인의 진짜 API 키 유지하기
    private final String KAKAO_REDIRECT_URI = "http://localhost:3000/kakao-callback";

    @Autowired
    private UserDao userDAO;

    @Autowired
    private JwtService jwtService;

    public Map<String, Object> processKakaoLogin(String code) {
        RestTemplate restTemplate = new RestTemplate();

        // -----------------------------------------
        // [STEP 1] 카카오 토큰(Access Token) 발급
        // -----------------------------------------
        String tokenUrl = "https://kauth.kakao.com/oauth/token";
        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> tokenParams = new LinkedMultiValueMap<>();
        tokenParams.add("grant_type", "authorization_code");
        tokenParams.add("client_id", KAKAO_REST_API_KEY.trim()); 
        tokenParams.add("redirect_uri", KAKAO_REDIRECT_URI);
        tokenParams.add("code", code);

        HttpEntity<MultiValueMap<String, String>> tokenRequest = new HttpEntity<>(tokenParams, tokenHeaders);
        ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(tokenUrl, tokenRequest, Map.class);
        String accessToken = (String) tokenResponse.getBody().get("access_token");

        // -----------------------------------------
        // [STEP 2] 발급받은 토큰으로 유저 프로필 가져오기
        // -----------------------------------------
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";
        HttpHeaders userHeaders = new HttpHeaders();
        userHeaders.add("Authorization", "Bearer " + accessToken);
        userHeaders.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        HttpEntity<MultiValueMap<String, String>> userRequest = new HttpEntity<>(userHeaders);
        ResponseEntity<Map> userResponse = restTemplate.exchange(userInfoUrl, HttpMethod.POST, userRequest, Map.class);
        Map<String, Object> userBody = userResponse.getBody();

        // -----------------------------------------
        // [STEP 3] 유저 데이터 가공 및 인가 ID 추출
        // -----------------------------------------
        String kakaoId = String.valueOf(userBody.get("id")); 
        String nickname = "카카오 유저";
        String email = "kakao_" + kakaoId + "@nyamnyam.com"; // 이메일 미제공 시 고유 대체 이메일 생성 규칙

        if (userBody != null) {
            Map<?, ?> kakaoAccount = (Map<?, ?>) userBody.get("kakao_account");
            if (kakaoAccount != null) {
                Map<?, ?> profile = (Map<?, ?>) kakaoAccount.get("profile");
                if (profile != null && profile.get("nickname") != null) {
                    nickname = (String) profile.get("nickname");
                }
                if (kakaoAccount.get("email") != null) {
                    email = (String) kakaoAccount.get("email");
                }
            }
        }

        // -----------------------------------------
        // [STEP 4] 냠냠플래닛 DB 연동 및 로그인 처리 (최종 안정화 버전) 💾
        // -----------------------------------------
        int finalUserNum;
        String finalUserId;

        // 1. 이미 등록된 카카오 계정인지 식별 ID 조회
        Integer existingUserNum = userDAO.findUserNumByKakaoId(kakaoId);

        if (existingUserNum == null) {
            // [A. 최초 로그인 유저 ➡️ 가입 대기 혹은 즉시 가입]
            System.out.println("🌱 냠냠플래닛에 처음 방문한 소셜 회원입니다.");
            
            finalUserId = "kakao_" + kakaoId;
            
            // 일반 회원 중 이메일 중복이 있는지 검사
            int emailCount = userDAO.findUserByEmail(email);
            
            // 카카오가 이메일을 안 줬거나(가짜 주소) 이미 DB에 존재하는 이메일이라면 ➡️ 리액트한테 이메일 입력창 켜라고 신호 줌
            if (email.startsWith("kakao_") || emailCount > 0) {
                System.out.println("📢 이메일 추가 입력이 필요합니다. 리액트로 가입 대기 신호를 전송합니다.");
                
                Map<String, Object> needEmailResponse = new HashMap<>();
                needEmailResponse.put("status", "NEED_EMAIL");
                needEmailResponse.put("userId", finalUserId);
                needEmailResponse.put("userName", nickname);
                needEmailResponse.put("kakaoId", kakaoId);
                return needEmailResponse; 
            }

            // 카카오가 진짜 이메일을 줬고 중복도 없다면 ➡️ 프리패스로 즉시 자동 회원가입 진행!
            UserDTO newUser = new UserDTO();
            newUser.setUserId(finalUserId);
            newUser.setUserName(nickname);
            newUser.setUserEmail(email);
            
            userDAO.insertSocialUserWithEmail(newUser); // 이메일 포함 인서트 메서드로 통일
            finalUserNum = newUser.getUserNum();
            
            Map<String, Object> socialMap = new HashMap<>();
            socialMap.put("kakaoId", kakaoId);
            socialMap.put("userNum", finalUserNum);
            userDAO.insertSocialAccount(socialMap);
            
        } else {
            // [B. 이미 가입된 기존 유저 ➡️ 프리패스 로그인]
            System.out.println("✨ 이미 가입된 소셜 회원입니다. 바로 토큰을 발행합니다.");
            finalUserNum = existingUserNum;
            finalUserId = "kakao_" + kakaoId;
        }

        // 2. 냠냠플래닛 전용 JWT 서비스 토큰 세트 발행
        String appAccessToken = jwtService.createToken(finalUserId);
        String appRefreshToken = jwtService.createRefreshToken(finalUserId);
        
        System.out.println("🚀 소셜 로그인용 JWT 토큰 세트 발행 완료!");

        // 3. 리액트가 에러 없이 완벽하게 수신할 수 있도록 통합 응답 객체 리턴
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS"); // 성공 상태 명시
        response.put("token", appAccessToken);
        response.put("refreshToken", appRefreshToken);
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("user_num", finalUserNum);
        userInfo.put("user_id", finalUserId);
        response.put("user", userInfo);

        return response;
    }
}
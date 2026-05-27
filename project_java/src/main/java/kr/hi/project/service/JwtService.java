package kr.hi.project.service;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JwtService {

	private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
	
	// Access Token 생성
	public String createToken(String userid) {
		long now = System.currentTimeMillis();

		return Jwts.builder()
				.setHeaderParam("typ", "JWT")
				.setSubject(userid)
				.setIssuedAt(new Date(now))
				.setExpiration(new Date(now + 3600000)) // 실제용
//				.setExpiration(new Date(now + 30000)) // 테스트용 30초
				// 🔥 FIX: 알고리즘 명시 버전 유지
				.signWith(key, SignatureAlgorithm.HS256)
				.compact();
	}
	
	// Refresh Token 생성 (길게 - 7일)
	public String createRefreshToken(String userid) {
//		long now = System.currentTimeMillis();// 테스트용
		return Jwts.builder()
				.setSubject(userid)
				.setIssuedAt(new Date()) // 실제용
				.setExpiration(new Date(System.currentTimeMillis() + 86400000 * 7)) // 실제용
//				.setIssuedAt(new Date(now)) // 테스트용
//				.setExpiration(new Date(now + 120000)) // 테스트용 2분
				.signWith(key)
				.compact();
	}
    
	// 토큰에서 유저 ID 추출 (try-catch 예외 처리 버전 유지)
	public String getUsernameFromToken(String token) {
		try {
			return Jwts.parserBuilder()
					.setSigningKey(key)
					.build()
					.parseClaimsJws(token)
					.getBody()
					.getSubject(); // 토큰에 담긴 이름(username) 반환
		} catch (Exception e) {
			System.out.println("토큰 파싱 실패: " + e.getMessage());
			return null;
		}
	}
	
	// 로그인버튼 위해 토큰검사하기
	public boolean validateToken(String token) {
		try {
	        // 토큰을 해석해서 서명 검증 및 만료 확인
	        Jwts.parserBuilder()
	            .setSigningKey(key) // 우리 비밀키로 해석
	            .build()
	            .parseClaimsJws(token); // 여기서 만료되었으면 Exception이 발생
	        
	        return true; // 에러가 안 났으면 유효한 토큰냥
	    } catch (io.jsonwebtoken.ExpiredJwtException e) {
	        System.out.println("토큰이 만료되었습니다냥!");
	    } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
	        System.out.println("토큰이 위조되었거나 잘못되었습니다냥!");
	    }
	    return false; // 3. 문제 있으면 가짜/만료 토큰냥!
	}
}

		
	

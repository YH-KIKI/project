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
//			    .setExpiration(new Date(now + 30000)) // 테스트용 30초
			    .signWith(key)               
			    .compact();                  
	}
	
	// Refresh Token 생성 (길게 - 7일)
    public String createRefreshToken(String userid) {
//    	long now = System.currentTimeMillis();// 테스트용
        return Jwts.builder()
                .setSubject(userid)
	            .setIssuedAt(new Date()) // 실제용
	            .setExpiration(new Date(System.currentTimeMillis() + 86400000 * 7)) // 실제용
//                .setIssuedAt(new Date(now)) // 테스트용
//                .setExpiration(new Date(now + 120000)) // 테스트용 2분
                .signWith(key)
                .compact();
    }
    
	public String getUsernameFromToken(String token) {
	    return Jwts.parserBuilder()
	            .setSigningKey(key) 
	            .build()
	            .parseClaimsJws(token)
	            .getBody()
	            .getSubject(); // 토큰에 담긴 이름(username) 반환
	}

    public String createToken(String userid) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .setHeaderParam("typ", "JWT")
                .setSubject(userid)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + 3600000))
                // 🔥 FIX: 알고리즘 명시
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();

        } catch (Exception e) {
            System.out.println("토큰 파싱 실패: " + e.getMessage());
            return null;
        }
    }
}
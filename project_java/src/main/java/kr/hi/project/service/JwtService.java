package kr.hi.project.service;

import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
	
	public String createToken(String userid) {
		long now = System.currentTimeMillis();
		return Jwts.builder()				
				.setHeaderParam("typ", "JWT") 
			    .setSubject(userid)       
			    .setIssuedAt(new Date(now))  
			    .setExpiration(new Date(now + 3600000)) 
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

}

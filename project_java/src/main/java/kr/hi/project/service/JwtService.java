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

    private final String SECRET_STRING = "your_permanent_secret_key_for_project_hi_2024_05_14";
    private final Key key = Keys.hmacShaKeyFor(SECRET_STRING.getBytes(StandardCharsets.UTF_8));

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
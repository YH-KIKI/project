package kr.hi.project.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.project.service.JwtService;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("🔥 FILTER 들어옴");

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            if (jwtService.isTokenExpired(token)) {
                // 만료된 경우 응답 헤더에 특정 값을 넣어 프론트엔드에게 알려줌
                response.setHeader("is-token-expired", "true");
            } else {
            try {
                String userid = jwtService.getUsernameFromToken(token);

                if (userid != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    // 🔥 핵심 수정: ROLE_USER 추가
                    UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                            userid,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_USER"))
                        );

                    SecurityContextHolder.getContext().setAuthentication(auth);
                }

            } catch (Exception e) {
                System.out.println("토큰 검증 에러: " + e.getMessage());
            }
            }
        }

        filterChain.doFilter(request, response);
    }
}
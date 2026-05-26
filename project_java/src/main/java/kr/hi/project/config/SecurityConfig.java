package kr.hi.project.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.project.service.JwtService;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtService jwtService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
            "/uploads/**", "/images/**", "/static/**", "/favicon.ico", "/error"
        );
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", 
                                 "/favicon.ico",
                                 "/uploads/**", 
                                 "/images/**",  // [추가/재근] 캐릭터 이미지 등 정적 리소스 접근 허용
                                 "/error",    
                                 "/api/signup", 
                                 "/api/login", 
                                 "/api/information_updata",
                                 "/api/information_select",
                                 "/api/diet/**",  // [추가/재근] AI식단추천
                                 "/api/community/**", // 추가했음(박하)
                                 "/api/comments/**", // [박하/추가] 댓글 API 허용 추가
                                 "/api/likes/**",    // [박하/추가] 추천 API 허용 추가
                                 "/api/food/**", //[연희/추가] food 테이블 불러오는 API
                                 "/api/character/**" ,
                                 "/api/bodycheck/**", // [추가/재근] 눈바디
                                 "/api/user/verify-password", // [추가/재근] 눈바디 비밀번호
                                 "/api/favorite/**", //[연희/추가] 즐찾들
                                 "/api/user/privacy/**", //[연희/추가] 프라이버시 영양성분 조회
                                 "/api/report-fail",//[준성/추가] 음식사진인증실패
                                 "/api/ai/**",
                                 "/api/user/info",
                                 "/api/record",
                                 "/api/meal/**",
                                 "/api/login/**", 
                                 "/login/**",
                                 "/kakao", 
                                 "/api/login/kakao/register",
                                 "/api/user/food/search",
                                 "/api/fridge/**" //[연희//추가] 냉장고 정보
                                 ).permitAll() 
                // 유효한 토큰이 있어야 들어갈수있는 페이지
                //.requestMatchers("/api/record").authenticated()
                .anyRequest().authenticated() 
            );
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://54.116.167.5"
                )); 
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 🛠️ 에러 수정: config -> configuration 으로 변경하여 변수명 일치시킴
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    public static class JwtAuthenticationFilter extends org.springframework.web.filter.OncePerRequestFilter {
        private final JwtService jwtService;

        public JwtAuthenticationFilter(JwtService jwtService) {
            this.jwtService = jwtService;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, IOException {

            String authHeader = request.getHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String userId = jwtService.getUsernameFromToken(token);

                    if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userId, null, new ArrayList<>());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }

                } catch (Exception e) {
                    System.err.println("JWT 필터 검증 실패: " + e.getMessage());
                }
            }

            filterChain.doFilter(request, response);
        }
    }
}
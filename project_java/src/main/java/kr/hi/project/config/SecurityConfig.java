package kr.hi.project.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt라는 강력한 암호화 알고리즘을 사용하겠다는 선언입니다.
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정 적용
            .csrf(csrf -> csrf.disable()) // 테스트를 위해 CSRF 잠시 비활성화
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/uploads/**", // [박하/추가] 서버에 저장된 이미지를 로그인 없이도 브라우저에서 볼 수 있도록 허용
                				 "/error",	// [재근/추가] DB에러 났을때 403안나오게 
                				 "/api/signup", 
                                 "/api/login", 
                                 "/api/user/info",
                                 "/api/information_updata",
                                 "/api/information_select",
                                 "/api/v1/diet/**",  // 🌟 이 부분이 방금 새로 추가된 곳입니다! (식단 API 허용)
                                 "/api/record",
                                 "/api/community/**", // 추가했음(박하)
                                 "/api/comments/**", // [박하/추가] 댓글 API 허용 추가
                                 "/api/likes/**",    // [박하/추가] 추천 API 허용 추가
                                 "/api/meal/**"
                                 ).permitAll() // 가입, 로그인은 누구나 가능
                .anyRequest().authenticated() // 나머지는 로그인이 필요함
            );
        
        return http.build();
    }

    // CORS 정책 상세 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // React 주소 허용
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
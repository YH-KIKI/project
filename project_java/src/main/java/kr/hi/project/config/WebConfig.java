package kr.hi.project.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry; // *** [박하/추가] 리소스 핸들러 설정을 위해 임포트
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer{
	
	// *** [박하/추가] 서버에 저장된 사진을 URL(http://localhost:8080/uploads/파일명)로 불러올 수 있도록 매핑
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/uploads/**")
				.addResourceLocations("file:///C:/project_uploads/"); 
	}
	
	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/**")
				.allowedOrigins("http://localhost:3000")
				.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
				.allowedHeaders("*")
				.allowCredentials(true);
	}
	
	@Bean
    WebClient webClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }
}

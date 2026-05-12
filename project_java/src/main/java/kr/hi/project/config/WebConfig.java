package kr.hi.project.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${spring.web.resources.static-locations:C:/project_uploads/}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String location = uploadPath;

        if (!location.endsWith("/")) {
            location += "/";
        }

        if (!location.startsWith("file:")) {
            if (location.startsWith("/")) {
                location = "file://" + location;
            } else {
                location = "file:///" + location;
            }
        }

        // 매핑 경로 /uploads/** 유지
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location)
                .setCachePeriod(0)
                .resourceChain(false);
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
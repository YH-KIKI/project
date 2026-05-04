package kr.hi.project;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// 🌟 1. MapperScan을 임포트합니다.
import org.mybatis.spring.annotation.MapperScan; 

@SpringBootApplication
// 🌟 2. 핵심 추가: "kr.hi.project.dao 폴더 안에 있는 인터페이스들을 Mapper로 인식해라!" 라고 명령합니다.
@MapperScan("kr.hi.project.dao") 
public class ProjectJavaApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectJavaApplication.class, args);
    }

}
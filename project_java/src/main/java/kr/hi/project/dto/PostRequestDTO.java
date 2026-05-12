package kr.hi.project.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor  // 기본 생성자 추가 (MyBatis 필수)
@AllArgsConstructor // 전체 필드 생성자 추가
public class PostRequestDTO {
    // Integer를 사용하면 데이터가 비어있어도 400 에러 대신 로직으로 진입합니다.
    private Integer postNum; 
    private Integer userNum;
    
    private String postTitle;
    private String postContent;
    
    private String postImgPath;
    private String postImgPos;
}
package kr.hi.project.dto;

import lombok.Data;

@Data
public class PostRequestDTO {
    private int userNum;
    private String postTitle;
    private String postContent;
    
    private String postImgPath;

    private String postImgPos;
}
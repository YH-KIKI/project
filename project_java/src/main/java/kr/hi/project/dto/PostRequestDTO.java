package kr.hi.project.dto;

import lombok.Data;

@Data
public class PostRequestDTO {
    private int user_num;
    private String post_title;
    private String post_content;
    
    private String post_img_path;

    private String post_img_pos;
}
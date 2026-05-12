package kr.hi.project.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class PostDTO {
    private int post_num;
    private int user_num;
    private String user_name;
    private String post_title;
    private String post_content;
    private int post_views;
    private LocalDateTime post_created_at;
    private LocalDateTime post_updated_at;
    
    private String post_img_path;
    private String post_img_pos;

    private int like_count;
    private int comment_count;
}
package kr.hi.project.dto;

import java.time.LocalDateTime;
import lombok.Data;

@Data
public class PostDTO {
    
    private int postNum;
    private int userNum;
    private String userName;
    private String postTitle;
    private String postContent;
    private int postViews;
    private LocalDateTime postCreatedAt;
    private LocalDateTime postUpdatedAt;
    
    private String postImgPath;
    private String postImgPos;

    private int likeCount;
    private int commentCount;
}
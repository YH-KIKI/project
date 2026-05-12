package kr.hi.project.dto;

import java.util.Date;
import lombok.Data;

@Data
public class PostLikeDTO {
    private int plNum;
    private int postNum;
    private int userNum;
    private Date plCreatedAt;

    private int likeCount;
    private boolean isLiked;
}
package kr.hi.project.dto;

import java.util.Date;
import lombok.Data;

@Data
public class PostLikeDTO {
    private int pl_num;
    private int post_num;
    private int user_num;
    private Date pl_created_at;

    private int like_count;
    private boolean is_liked;
}
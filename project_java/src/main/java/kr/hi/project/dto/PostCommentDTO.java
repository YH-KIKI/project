package kr.hi.project.dto;

import java.util.Date;
import lombok.Data;

@Data
public class PostCommentDTO {
    private int pc_num;
    private int post_num;
    private int user_num;
    private String pc_content;
    private Integer parent_pc_num;
    private Date pc_created_at;
    private Date pc_updated_at;
    private boolean pc_is_deleted;

    private String user_name;     
    private String user_id;
}
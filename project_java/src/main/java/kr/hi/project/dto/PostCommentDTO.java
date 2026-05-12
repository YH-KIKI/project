package kr.hi.project.dto;

import java.util.Date;
import lombok.Data;

@Data
public class PostCommentDTO {
    private int pcNum;
    private int postNum;
    private int userNum;
    private String pcContent;
    private Integer parentPcNum;
    private Date pcCreatedAt;
    private Date pcUpdatedAt;
    private boolean pcIsDeleted;

    private String userName;     
    private String userId;
}
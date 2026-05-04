package kr.hi.project.dto; 

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class UserPrivacyDTO {
    private Long userNum;
    private Double height;
    private Double weight;
    private Integer targetCalorie; 
}
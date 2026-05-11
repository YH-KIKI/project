package kr.hi.project.dto; 

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class DietUserDTO {
    private Long userNum;
    private Double height;
    private Double weight;
    private Integer targetCalorie; 
    private Integer carbs;    // 탄수화물
    private Integer protein;  // 단백질
    private Integer fat;      // 지방
    private Integer sodium;   // 나트륨
}
package kr.hi.project.dto;

import lombok.Data;

@Data
public class MealDetailDTO {
    private int mdKcal;       // 해당음식칼로리 (계산된 값)
    private int mdPortion;    // 중량(g)
    private int mkNum;        // 식단기록고유번호 (FK)
    private int foNum;        // 음식고유번호 (FK)
	private int mdNum;      // 식단하루고유번호 (FK)

}

package kr.hi.project.domain;

import lombok.Data;

@Data
public class MealDetailDTO {
    private int Mealkcal;       // 해당음식칼로리 (계산된 값)
    private int Mealportion;    // 중량(g)
    private int mk_num;        // 식단기록고유번호 (FK)
    private int Foodnum;        // 음식고유번호 (FK)
	private int Mday_num;      // 식단하루고유번호 (FK)

}

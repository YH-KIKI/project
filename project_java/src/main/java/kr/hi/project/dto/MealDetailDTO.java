package kr.hi.project.dto;

import lombok.Data;

@Data
public class MealDetailDTO {
	private int mdNum;      // 식단상세고유번호 (PK)
    private int mdKcal;       // 해당음식칼로리 (계산된 값)
    private int mdPortion;    // 중량(g)
    private int mkNum;        // 식단기록고유번호 (FK)
    private Integer foNum;        // 음식고유번호 (FK)
    
    
    
    private int mdayNum; 		// 하루식단고유번호
    private String foName;		// 음식이름
    private String mkMealType;	// 식사종류(아침,점심,저녁)
    
    
    private float foKcal;
    private float foCarbs;
    private float foProtein;
    private float foFat;
    private float foNatrium;
    private String mkImage;
    
 // 레시피 저장용
    private Boolean isRecipe;
    private Integer rcpNum;
    private String rcpName;
    private Integer rcpKcal;
    private Integer rcpCarbs;
    private Integer rcpProtein;
    private Integer rcpFat;
    private Integer rcpNatrium;
    

}

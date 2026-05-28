package kr.hi.project.dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class RecipeMealRecordRequestDTO {
	
	// 레시피 식단 저장용 DTO -> 저장은 밀레코드
    private int userNum;
    private String mkMealType;
    private LocalDate mkDietDate;
    private String mkUserMemo;

    private int rcpNum;
    private String rcpName;
    private String rcpImage;

    private int rcpKcal;
    private float rcpCarbs;
    private float rcpProtein;
    private float rcpFat;
    private float rcpNatrium;
}
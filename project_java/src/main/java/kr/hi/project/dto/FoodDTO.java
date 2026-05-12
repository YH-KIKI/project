package kr.hi.project.dto;

import lombok.Data;

@Data
public class FoodDTO {
    private int foNum;        // 음식고유번호
    private String foName;    // 음식이름
    private int foBaseGram;  // 기준중량(g)
    private float foKcal;     // 기준칼로리
    private float foCarbs;    // 탄수화물
    private float foProtein;  // 단백질
    private float foFat;      // 지방
    private float foNatrium;  // 나트륨
    private String foType;    // 종류 (한식 등)
}

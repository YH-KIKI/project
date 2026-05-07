package kr.hi.project.domain;

import lombok.Data;

@Data
public class FoodDTO {
    private int Foodnum;        // 음식고유번호
    private String Foodname;    // 음식이름
    private int Basegram;  // 기준중량(g)
    private float Foodkcal;     // 기준칼로리
    private float Foodcarbs;    // 탄수화물
    private float Foodprotein;  // 단백질
    private float Foodfat;      // 지방
    private float Foodnatrium;  // 나트륨
    private String Foodtype;    // 종류 (한식 등)
}

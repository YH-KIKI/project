package kr.hi.project.dto;

import lombok.Data;

@Data
public class MealFavoritesDTO {
    //기본 DB 컬럼 (meal_favorites 테이블)
    private int mfNum;      // 즐겨찾기 고유번호 (PK)
    private int userNum;    // 사용자 고유번호 (FK)
    private int mkNum;      // 식단기록 고유번호 (FK)
    private String mfName;  // 즐겨찾기 이름 (예: "제육볶음, 공기밥")

    //조인을 통해 가져올 추가 데이터 (화면 표시용)
    private int totalKcal;      // 해당 식단의 총 칼로리 합계
    private String foodListStr; // 포함된 음식들을 합친 문자열 (예: "닭가슴살, 번티밥")
    private String mkImage;
    
    private String mkMealType; //식단 저장 타입
}

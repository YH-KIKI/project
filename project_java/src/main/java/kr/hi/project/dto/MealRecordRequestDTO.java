package kr.hi.project.dto;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import lombok.Data;

@Data
public class MealRecordRequestDTO {
    private int userNum;
    private String mkMealType; // 아침, 점심, 저녁
    private Map<String, Integer> foodDetails; // { "제육볶음": 200, "냉면": 450 }
    
    // 새 방식 추가
    private List<MealDetailDTO> foods;

    // 추가 옵션
    private String mkImage;
    private String mkUserMemo;
    private Integer mkNum;
    private LocalDate mkDietDate;
}
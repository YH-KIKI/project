package kr.hi.project.dto;
import lombok.Data;
import java.util.Map;

@Data
public class MealRecordRequestDTO {
    private int userNum;
    private String mkMealType; // 아침, 점심, 저녁
    private Map<String, Integer> foodDetails; // { "제육볶음": 200, "냉면": 450 }
}
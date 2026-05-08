package kr.hi.project.domain;
import lombok.Data;
import java.util.Map;

@Data
public class MealRecordRequestDTO {
    private int Usernum;
    private String MealType; // 아침, 점심, 저녁
    private Map<String, Integer> FoodDetails; // { "제육볶음": 200, "냉면": 450 }
}
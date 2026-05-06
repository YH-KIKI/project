package kr.hi.project.controller; // 🌟 패키지명 일치

import kr.hi.project.service.DietService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/diet") 
@RequiredArgsConstructor
public class DietController {

    private final DietService dietService;

    @GetMapping("/recommend")
    public ResponseEntity<List<Map<String, Object>>> recommendDiet(
            @RequestParam(name = "type", defaultValue = "맞춤 식단") String type,
            @RequestParam(name = "userNum", defaultValue = "1") Long userNum 
    ) {
        System.out.println("🔥 [Spring Boot] React에서 식단 추천 요청 도착!");
        System.out.println("요청된 식단 타입: " + type + ", 유저 번호: " + userNum);

        List<Map<String, Object>> resultList = dietService.getDietRecommendations(userNum, type);

        return ResponseEntity.ok(resultList);
    }
}
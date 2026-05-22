package kr.hi.project.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dto.FoodDTO;
import kr.hi.project.service.FoodService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/food")
public class FoodController {

    private final FoodService foodService;

    // 전체 음식 조회
    @GetMapping("/list")
    public List<FoodDTO> getFoodList() {
        return foodService.getFoodList();
    }

    // 음식 검색
    @GetMapping("/search")
    public List<FoodDTO> searchFood(@RequestParam("keyword") String keyword) {
        return foodService.searchFood(keyword);
    }
    
    // 하나음식의 모든종류를 가져오기
    @GetMapping("/search-variants")
    public ResponseEntity<?> searchFoodVariants(@RequestParam("foodName") String foodName) {
        List<FoodDTO> foodList = foodService.searchFoodByName(foodName); 
        System.out.println(foodList);
        return ResponseEntity.ok(foodList);
    }
}
package kr.hi.project.controller;


import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dto.MealFavoritesDTO;
import kr.hi.project.service.MealFavoritesService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/favorite/meal")
public class MealFavoritesController {

    private final MealFavoritesService mealFavoritesService;

    @GetMapping
    public ResponseEntity<List<MealFavoritesDTO>> getMealFavorites(
            @RequestParam("userNum") int userNum) {

        return ResponseEntity.ok(
                mealFavoritesService.getMealFavorites(userNum)
        );
    }

    @PostMapping
    public ResponseEntity<?> insertMealFavorite(
            @RequestBody MealFavoritesDTO dto) {

        mealFavoritesService.insertMealFavorite(dto);
        return ResponseEntity.ok("식단 즐겨찾기 저장 완료");
    }

    @DeleteMapping
    public ResponseEntity<?> deleteMealFavorite(
            @RequestParam("userNum") int userNum,
            @RequestParam("mfNum") int mfNum) {

        mealFavoritesService.deleteMealFavorite(userNum, mfNum);
        return ResponseEntity.ok("식단 즐겨찾기 삭제 완료");
    }
    
    @GetMapping("/detail")
    public ResponseEntity<MealFavoritesDTO> getMealFavoriteDetail(
            @RequestParam("userNum") int userNum,
            @RequestParam("mfNum") int mfNum) {

        return ResponseEntity.ok(
                mealFavoritesService.getMealFavoriteDetail(userNum, mfNum)
        );
    }

    @PutMapping("/memo")
    public ResponseEntity<?> updateMealFavoriteMemo(
            @RequestBody MealFavoritesDTO dto) {

        mealFavoritesService.updateMealFavoriteMemo(dto);
        return ResponseEntity.ok("메모 수정 완료");
    }
    
    @PutMapping("/name")
    public ResponseEntity<?> updateMealFavoriteName(
            @RequestBody MealFavoritesDTO dto) {

        mealFavoritesService.updateMealFavoriteName(dto);
        return ResponseEntity.ok("식단 이름 수정 완료");
    }
}
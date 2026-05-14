package kr.hi.project.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dto.SingleFoodFavoriteDTO;
import kr.hi.project.service.SingleFoodFavoriteService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/favorite/single-food")
public class SingleFoodFavoriteController {

    private final SingleFoodFavoriteService singleFoodFavoriteService;

    @GetMapping
    public ResponseEntity<List<SingleFoodFavoriteDTO>> getSingleFoodFavorites(
            @RequestParam("userNum") int userNum) {

        return ResponseEntity.ok(
                singleFoodFavoriteService.getSingleFoodFavorites(userNum)
        );
    }

    @PostMapping
    public ResponseEntity<?> insertSingleFoodFavorite(
            @RequestBody SingleFoodFavoriteDTO dto) {

        singleFoodFavoriteService.insertSingleFoodFavorite(dto);
        return ResponseEntity.ok("음식 즐겨찾기 저장 완료");
    }

    @DeleteMapping
    public ResponseEntity<?> deleteSingleFoodFavorite(
            @RequestParam("userNum") int userNum,
            @RequestParam("sfNum") int sfNum) {

        singleFoodFavoriteService.deleteSingleFoodFavorite(userNum, sfNum);
        return ResponseEntity.ok("음식 즐겨찾기 삭제 완료");
    }
}
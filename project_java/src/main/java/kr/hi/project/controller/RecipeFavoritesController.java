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

import kr.hi.project.dto.RecipeFavoritesDTO;
import kr.hi.project.service.RecipeFavoritesService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/favorite/recipe")
public class RecipeFavoritesController {

    private final RecipeFavoritesService recipeFavoritesService;

    @GetMapping
    public ResponseEntity<List<RecipeFavoritesDTO>> getRecipeFavorites(
            @RequestParam("userNum") int userNum) {

        return ResponseEntity.ok(
                recipeFavoritesService.getRecipeFavorites(userNum)
        );
    }

    @PostMapping
    public ResponseEntity<?> insertRecipeFavorite(
            @RequestBody RecipeFavoritesDTO dto) {

        recipeFavoritesService.insertRecipeFavorite(dto);
        return ResponseEntity.ok("레시피 즐겨찾기 저장 완료");
    }

    @DeleteMapping
    public ResponseEntity<?> deleteRecipeFavorite(
            @RequestParam("userNum") int userNum,
            @RequestParam("rcpNum") int rcpNum) {

        recipeFavoritesService.deleteRecipeFavorite(userNum, rcpNum);
        return ResponseEntity.ok("레시피 즐겨찾기 삭제 완료");
    }
}
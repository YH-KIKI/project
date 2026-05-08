package kr.hi.project.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.domain.MealFavoritesDTO;
import kr.hi.project.service.FavoriteService;

@RestController
@RequestMapping("/api/meal")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    // 1. 사용자의 식단 기록 전체 조회
    @GetMapping("/logs")
    public ResponseEntity<?> getMealLogs(@RequestParam("userNum") int userNum) {
        // 서비스에서 아까 만든 조인 쿼리(findMealLogsWithFav) 호출
        List<Map<String, Object>> logs = favoriteService.getMealLogsWithFav(userNum);
        return ResponseEntity.ok(logs);
    }

    // 2. 즐겨찾기 목록 조회
    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites(@RequestParam("userNum") int userNum) {
        // 서비스에서 findMyFavorites 호출
        List<MealFavoritesDTO> favorites = favoriteService.getFavoriteList(userNum);
        System.out.println(favorites);
        return ResponseEntity.ok(favorites);
    }

    // 3. 즐겨찾기 추가
    @PostMapping("/favorites")
    public ResponseEntity<?> addFavorite(@RequestBody Map<String, Object> params) {
        // 리액트에서 넘긴 { userNum, mkNum } 받기
        int userNum = Integer.parseInt(params.get("userNum").toString());
        int mkNum = Integer.parseInt(params.get("mkNum").toString());
        
        favoriteService.addFavorite(userNum, mkNum);
        return ResponseEntity.ok("즐겨찾기 추가 성공!");
    }
}
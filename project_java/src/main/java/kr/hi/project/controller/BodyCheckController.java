package kr.hi.project.controller;

import kr.hi.project.service.BodyCheckService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/bodycheck")
@RequiredArgsConstructor
public class BodyCheckController {

    private final BodyCheckService bodyCheckService;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeBodyCheck(
            @RequestParam("file") MultipartFile file,
            @RequestParam("analyzeType") String analyzeType,
            @RequestParam("userNum") Long userNum) {
        try {
            // 서비스 계층으로 사진과 옵션을 토스!
            String result = bodyCheckService.analyzeAndSave(file, analyzeType, userNum);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("서버 저장/분석 중 오류가 발생했습니다.");
        }
    }
}
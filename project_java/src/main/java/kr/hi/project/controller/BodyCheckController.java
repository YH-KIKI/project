package kr.hi.project.controller;

import kr.hi.project.dto.BodyCamDTO;
import kr.hi.project.service.BodyCheckService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/bodycheck")
@RequiredArgsConstructor
public class BodyCheckController {

    private final BodyCheckService bodyCheckService;

    // 눈바디 저장 및 AI 분석
    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeBodyCheck(
            @RequestParam("file") MultipartFile file,
            @RequestParam("analyzeType") String analyzeType,
            @RequestParam("userNum") Long userNum) {
        try {
            String result = bodyCheckService.analyzeAndSave(file, analyzeType, userNum);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("서버 오류 발생");
        }
    }

    // 눈바디 목록 불러오기
    @GetMapping("/list")
    public ResponseEntity<List<BodyCamDTO>> getBodyCheckList(@RequestParam("userNum") Long userNum) {
        List<BodyCamDTO> list = bodyCheckService.getBodyCheckList(userNum);
        return ResponseEntity.ok(list);
    }
    
 // 눈바디 삭제 API
    @DeleteMapping("/{bcNum}")
    public ResponseEntity<String> deleteBodyCheck(@PathVariable("bcNum") int bcNum) {
        try {
            bodyCheckService.deleteBodyCheck(bcNum);
            return ResponseEntity.ok("삭제 성공");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("삭제 실패");
        }
    }
}
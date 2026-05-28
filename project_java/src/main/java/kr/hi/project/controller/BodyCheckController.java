package kr.hi.project.controller;

import kr.hi.project.dto.BodyCamDTO;
import kr.hi.project.service.BodyCheckService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bodycheck")
@RequiredArgsConstructor
public class BodyCheckController {

    private final BodyCheckService bodyCheckService;

    // 🌟 리턴 타입을 ResponseEntity<String> -> ResponseEntity<?> 로 변경
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeBodyCheck(
            @RequestParam("file") MultipartFile file,
            @RequestParam("analyzeType") String analyzeType,
            @RequestParam("userNum") Long userNum) {
        try {
            // 서비스에서 Map 객체를 받아서 그대로 리턴 (리액트는 response.data 로 쉽게 사용 가능)
            Map<String, Object> result = bodyCheckService.analyzeAndSave(file, analyzeType, userNum);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "서버 오류 발생"));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<BodyCamDTO>> getBodyCheckList(@RequestParam("userNum") Long userNum) {
        List<BodyCamDTO> list = bodyCheckService.getBodyCheckList(userNum);
        return ResponseEntity.ok(list);
    }
    
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
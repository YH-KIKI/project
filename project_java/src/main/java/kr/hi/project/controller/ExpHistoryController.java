package kr.hi.project.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.hi.project.dto.ExpHistoryDTO;
import kr.hi.project.service.ExpHistoryService;
import kr.hi.project.service.JwtService;

@RestController
@RequestMapping("/api/history")
public class ExpHistoryController {

    @Autowired
    private ExpHistoryService expHistoryService;

    @Autowired
    private JwtService jwtService;

    @GetMapping("/list")
    public ResponseEntity<?> getList(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        // [디버깅 로그 1] 헤더 수신 확인
        System.out.println("====== 히스토리 리스트 요청 시작 ======");
        System.out.println("수신된 Authorization 헤더: " + authHeader);

        // 1. 토큰 존재 여부 및 형식 확인
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("결과: 401 - 인증 헤더 누락 또는 형식 오류");
            return ResponseEntity.status(401).body("인증 토큰이 누락되었습니다.");
        }

        String token = authHeader.substring(7); // "Bearer " 제거

        try {
            // 2. 토큰에서 userid 추출
            String userId = jwtService.getUsernameFromToken(token);
            System.out.println("추출된 유저 ID: " + userId);
            
            if (userId == null) {
                System.out.println("결과: 401 - 토큰 파싱 후 ID 추출 실패");
                return ResponseEntity.status(401).body("토큰 정보가 부정확합니다.");
            }

            // 3. 추출한 ID로 DB에서 userNum 조회
            Integer userNum = expHistoryService.getUserNumByUserId(userId); 
            System.out.println("조회된 userNum: " + userNum);

            if (userNum == null) {
                System.out.println("결과: 401 - DB에 해당 유저 ID(user_id)가 없음");
                return ResponseEntity.status(401).body("존재하지 않는 유저 정보입니다.");
            }

            // 4. 비즈니스 로직 수행 (페이징)
            int size = 5;
            int offset = (page - 1) * size;

            List<ExpHistoryDTO> history = expHistoryService.getHistoryList(userNum, offset, size);
            int totalItems = expHistoryService.getTotalCount(userNum);
            int totalPages = (int) Math.ceil((double) totalItems / size);

            System.out.println("조회 성공 - 아이템 개수: " + (history != null ? history.size() : 0));

            Map<String, Object> response = new HashMap<>();
            response.put("history", history);
            response.put("totalPages", totalPages);
            response.put("currentPage", page);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // [디버깅 로그 2] 에러 발생 원인 출력
            System.err.println("토큰 검증 중 예외 발생!");
            e.printStackTrace(); // 어떤 에러인지 콘솔에 상세히 찍힘
            return ResponseEntity.status(401).body("토큰이 만료되었거나 유효하지 않습니다. 에러: " + e.getMessage());
        } finally {
            System.out.println("====== 히스토리 리스트 요청 종료 ======");
        }
    }
}
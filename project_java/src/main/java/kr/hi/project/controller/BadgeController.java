package kr.hi.project.controller;

import kr.hi.project.dto.BadgeDTO;
import kr.hi.project.service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badge")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BadgeController {

    private final BadgeService badgeService;

    // =========================
    // 전체 뱃지 조회
    // =========================
    @GetMapping("/list/{userNum}")
    public ResponseEntity<List<BadgeDTO>> getBadgeList(@PathVariable int userNum) {
        return ResponseEntity.ok(badgeService.getBadgeList(userNum));
    }

    // =========================
    // 대표 뱃지 설정
    // =========================
    @PostMapping("/equip")
    public ResponseEntity<String> equipBadge(@RequestParam int userNum,
                                              @RequestParam String badgeId) {

        badgeService.equipBadge(userNum, badgeId);
        return ResponseEntity.ok("OK");
    }

    // =========================
    // 이벤트 발생
    // =========================
    @PostMapping("/event")
    public ResponseEntity<String> insertEvent(@RequestParam int userNum,
                                               @RequestParam String eventType,
                                               @RequestParam int eventValue) {

        badgeService.insertEvent(userNum, eventType, eventValue);
        return ResponseEntity.ok("OK");
    }
}
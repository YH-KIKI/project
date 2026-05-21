package kr.hi.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.service.FridgeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/fridge")
public class FridgeController {

    private final FridgeService fridgeService;

    @GetMapping("/summary")
    public ResponseEntity<?> getFridgeSummary(
            @RequestParam("userNum") int userNum
    ) {

        return ResponseEntity.ok(
                fridgeService.getSummary(userNum)
        );
    }
}
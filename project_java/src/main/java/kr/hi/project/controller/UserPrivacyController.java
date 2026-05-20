package kr.hi.project.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.dto.UserPrivacyDTO;
import kr.hi.project.service.UserPrivacyService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/privacy")
@RequiredArgsConstructor
public class UserPrivacyController {

    private final UserPrivacyService userPrivacyService;

    @GetMapping
    public ResponseEntity<UserPrivacyDTO> getUserPrivacy(
            @RequestParam("userNum") int userNum) {
    	
        UserPrivacyDTO userPrivacy = userPrivacyService.getUserPrivacy(userNum);
        return ResponseEntity.ok(userPrivacy);
    }
}
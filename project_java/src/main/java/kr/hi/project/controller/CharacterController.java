package kr.hi.project.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import kr.hi.project.dto.CharacterDTO;
import kr.hi.project.service.CharacterService;
import java.util.Map;

@RestController
@RequestMapping("/api/character")
public class CharacterController {

    @Autowired
    private CharacterService characterService;

    // 1. 캐릭터 정보 조회 (GET)
    @GetMapping("/info")
    public ResponseEntity<?> getCharacterInfo(@RequestParam("userNum") int userNum) {
        CharacterDTO character = characterService.getCharacterStatus(userNum);
        if (character == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("캐릭터 정보를 찾을 수 없습니다.");
        }
        return ResponseEntity.ok(character);
    }

    // 2. 캐릭터 타입 변경 (POST)
    @PostMapping("/update")
    public ResponseEntity<?> updateCharacter(@RequestBody Map<String, Object> payload) {
        try {
            // [방어 코드] payload 자체가 null이거나 필요한 키가 없는지 확인
            if (payload == null || payload.get("userNum") == null || payload.get("type") == null) {
                System.out.println("데이터 누락 발생: " + payload);
                return ResponseEntity.badRequest().body("userNum 또는 type 데이터가 누락되었습니다.");
            }

            // 안전한 숫자 파싱 (Object -> String -> Integer)
            int userNum = Integer.parseInt(payload.get("userNum").toString());
            int type = Integer.parseInt(payload.get("type").toString());

            // 서비스 계층 호출
            characterService.updateCharacterType(userNum, type);

            return ResponseEntity.ok().body("캐릭터 변경 성공");
            
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("데이터 형식이 올바르지 않습니다 (숫자 필요).");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류: " + e.getMessage());
        }
    }
}
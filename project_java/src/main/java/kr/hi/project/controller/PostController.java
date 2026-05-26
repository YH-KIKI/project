package kr.hi.project.controller;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import kr.hi.project.dto.PostDTO;
import kr.hi.project.dto.PostRequestDTO;
import kr.hi.project.service.PostService;
import kr.hi.project.service.CharacterService; // 🔥 추가

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private CharacterService characterService; // 🔥 캐릭터 서비스 주입

    // 게시글 목록 조회
    @GetMapping("/posts")
    public Map<String, Object> getPosts(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "keyword", required = false) String keyword) {
        
        String finalKeyword = (keyword != null && keyword.contains("xhr")) ? "" : keyword;
        return postService.getPostsWithPaging(page, 7, category, finalKeyword);
    }

    // 게시글 상세 조회
    @GetMapping("/post/{id}")
    public PostDTO getPostDetail(
            @PathVariable("id") int id,
            @RequestParam(value = "userNum", required = false) Integer userNum,
            HttpServletRequest request,
            HttpServletResponse response) {
        return postService.getPostDetail(id, userNum, request, response);
    }

    // 🚀 게시글 작성 (경험치 연동 수정 부)
    @PostMapping("/write")
    public String writePost(@RequestBody PostRequestDTO dto) {
        // 1. 기존 게시글 작성 로직 실행 (DB에 인서트)
        postService.writePost(dto);
        
        // 2. 글 작성 유저에게 활동 보너스(5 XP) 지급
        try {
            // PostRequestDTO에 있는 userNum 가져오기 (변수명 대소문자가 DTO 스펙과 다르면 dto.getUser_num() 등으로 체크)
            int userNum = dto.getUserNum(); 
            
            if (userNum > 0) {
                characterService.processPostReward(userNum);
                System.out.println("📝 [경험치 알림] " + userNum + "번 유저 게시글 작성 경험치(+5 XP) 정산 완료!");
            }
        } catch (Exception e) {
            // 경험치 때문에 글쓰기 전체가 튕기면 안 되므로 예외 처리 적용
            System.out.println("❌ [경험치 오류] 게시글 작성 보상 지급 중 에러 발생: " + e.getMessage());
            e.printStackTrace();
        }
        
        return "success";
    }

    // 게시글 수정
    @PutMapping("/update")
    public String updatePost(@RequestBody PostDTO dto) {
        postService.modifyPost(dto);
        return "success";
    }

    // 게시글 삭제
    @DeleteMapping("/delete/{id}")
    public String deletePost(@PathVariable("id") int id) {
        postService.removePost(id);
        return "success";
    }

    // 이미지 업로드 핸들러
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (!file.isEmpty()) {
            File uploadDir = new File("C:/project_uploads/");
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String fileName = UUID.randomUUID().toString() + extension;
            
            File saveFile = new File(uploadDir, fileName);
            file.transferTo(saveFile);

            // WebConfig 설정과 맞춘 URL 반환
            String fileUrl = "http://localhost:8080/uploads/" + fileName;
            
            return ResponseEntity.ok(fileUrl);
        }
        return ResponseEntity.badRequest().body("fail");
    }
}
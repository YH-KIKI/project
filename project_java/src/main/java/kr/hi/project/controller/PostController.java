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

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {

    @Autowired
    private PostService postService;

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

    // 게시글 작성
    @PostMapping("/write")
    public String writePost(@RequestBody PostRequestDTO dto) {
        postService.writePost(dto);
        return "success";
    }

    // 게시글 수정
    @PutMapping("/update")
    public String updatePost(@RequestBody PostDTO dto) {
        postService.modifyPost(dto);
        return "success";
    }

    // 게시글 삭제 (빨간 줄 수정 완료)
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
package kr.hi.project.controller;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import kr.hi.project.dto.PostDTO;
import kr.hi.project.dto.PostRequestDTO;
import kr.hi.project.service.PostService;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping("/posts")
    public Map<String, Object> getPosts(
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "keyword", required = false) String keyword) {
        return postService.getPostsWithPaging(page, 7, category, keyword);
    }

    @GetMapping("/post/{id}")
    public PostDTO getPostDetail(
            @PathVariable("id") int id,
            @RequestParam(value = "userNum", required = false) Integer userNum,
            HttpServletRequest request,
            HttpServletResponse response) {
        return postService.getPostDetail(id, userNum, request, response);
    }

    @PostMapping("/write")
    public String writePost(@RequestBody PostRequestDTO dto) {
        postService.writePost(dto);
        return "success";
    }

    @PutMapping("/update")
    public String updatePost(@RequestBody PostDTO dto) {
        postService.modifyPost(dto);
        return "success";
    }

    @DeleteMapping("/delete/{id}")
    public String deletePost(@PathVariable("id") int id) {
        postService.removePost(id);
        return "success";
    }

    @PostMapping("/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        if (!file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            
            File saveFile = new File("C:/project_uploads/" + fileName);
            file.transferTo(saveFile);
            
            return "http://localhost:8080/uploads/" + fileName;
        }
        return "fail";
    }
}
package kr.hi.project.controller;

import kr.hi.project.dto.PostLikeDTO;
import kr.hi.project.service.PostLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;

    @PostMapping("/toggle")
    public Map<String, Object> toggleLike(@RequestBody PostLikeDTO likeDTO) {
        int result = postLikeService.toggleLike(likeDTO);
        int count = postLikeService.getLikeCount(likeDTO.getPostNum());
        
        Map<String, Object> response = new HashMap<>();
        response.put("isLiked", result == 1);
        response.put("likeCount", count);
        return response;
    }

    @GetMapping("/status")
    public Map<String, Object> getStatus(@RequestParam("postNum") int postNum, @RequestParam("userNum") int userNum) {
        PostLikeDTO dto = new PostLikeDTO();
        dto.setPostNum(postNum);
        dto.setUserNum(userNum);

        Map<String, Object> response = new HashMap<>();
        response.put("isLiked", postLikeService.isLikedByUser(dto));
        response.put("likeCount", postLikeService.getLikeCount(postNum));
        return response;
    }
}
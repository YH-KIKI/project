package kr.hi.project.controller;

import java.util.List;
import kr.hi.project.dto.PostCommentDTO;
import kr.hi.project.service.PostCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class PostCommentController {

    private final PostCommentService postCommentService;

    @GetMapping("/{post_num}")
    public List<PostCommentDTO> getComments(@PathVariable("post_num") int post_num) { // *** ("post_num") 추가 ***
        return postCommentService.getCommentsByPostNum(post_num);
    }

    @PostMapping
    public int writeComment(@RequestBody PostCommentDTO commentDTO) {
        return postCommentService.addComment(commentDTO);
    }

    @PutMapping
    public int updateComment(@RequestBody PostCommentDTO commentDTO) {
        return postCommentService.modifyComment(commentDTO);
    }

    @DeleteMapping("/{pc_num}")
    public int deleteComment(@PathVariable("pc_num") int pc_num) { // *** ("pc_num") 추가 ***
        return postCommentService.removeComment(pc_num);
    }
}
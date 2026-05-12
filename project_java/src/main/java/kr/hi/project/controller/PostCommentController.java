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

    @GetMapping("/{postNum}")
    public List<PostCommentDTO> getComments(@PathVariable("postNum") int postNum) {
        return postCommentService.getCommentsByPostNum(postNum);
    }

    @PostMapping
    public int writeComment(@RequestBody PostCommentDTO commentDTO) {
        return postCommentService.addComment(commentDTO);
    }

    @PutMapping
    public int updateComment(@RequestBody PostCommentDTO commentDTO) {
        return postCommentService.modifyComment(commentDTO);
    }

    @DeleteMapping("/{pcNum}")
    public int deleteComment(@PathVariable("pcNum") int pcNum) {
        return postCommentService.removeComment(pcNum);
    }
}
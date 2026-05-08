package kr.hi.project.service;

import java.util.List;
import kr.hi.project.dao.PostCommentDao;
import kr.hi.project.dto.PostCommentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostCommentService {

    private final PostCommentDao postCommentDao;

    public List<PostCommentDTO> getCommentsByPostNum(int post_num) {
        return postCommentDao.selectCommentsByPostNum(post_num);
    }

    @Transactional
    public int addComment(PostCommentDTO commentDTO) {
        return postCommentDao.insertComment(commentDTO);
    }

    @Transactional
    public int modifyComment(PostCommentDTO commentDTO) {
        return postCommentDao.updateComment(commentDTO);
    }

    @Transactional
    public int removeComment(int pc_num) {
        return postCommentDao.deleteComment(pc_num);
    }
}
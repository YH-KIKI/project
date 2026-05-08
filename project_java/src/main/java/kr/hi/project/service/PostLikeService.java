package kr.hi.project.service;

import kr.hi.project.dao.PostLikeDao;
import kr.hi.project.dto.PostLikeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeDao postLikeDao;

    @Transactional
    public int toggleLike(PostLikeDTO likeDTO) {
        int status = postLikeDao.checkLikeStatus(likeDTO);
        if (status > 0) {
            postLikeDao.deleteLike(likeDTO);
            return 0;
        } else {
            postLikeDao.insertLike(likeDTO);
            return 1;
        }
    }

    public int getLikeCount(int post_num) {
        return postLikeDao.countLikesByPostNum(post_num);
    }

    public boolean isLikedByUser(PostLikeDTO likeDTO) {
        return postLikeDao.checkLikeStatus(likeDTO) > 0;
    }
}
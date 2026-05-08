package kr.hi.project.dao;

import kr.hi.project.dto.PostLikeDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PostLikeDao {
    int insertLike(PostLikeDTO likeDTO);
    int deleteLike(PostLikeDTO likeDTO);
    int checkLikeStatus(PostLikeDTO likeDTO);
    int countLikesByPostNum(int post_num);
}
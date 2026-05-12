package kr.hi.project.dao;

import java.util.List;
import kr.hi.project.dto.PostCommentDTO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PostCommentDao {
    List<PostCommentDTO> selectCommentsByPostNum(int postNum);
    int insertComment(PostCommentDTO commentDTO);
    int updateComment(PostCommentDTO commentDTO);
    int deleteComment(int pcNum);
    PostCommentDTO selectCommentByPcNum(int pcNum);
}
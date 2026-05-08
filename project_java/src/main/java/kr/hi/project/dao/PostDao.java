package kr.hi.project.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import kr.hi.project.domain.PostDTO;
import kr.hi.project.dto.PostRequestDTO;

@Mapper
public interface PostDao {
    List<PostDTO> selectAllPosts();
    PostDTO selectPostByNum(int post_num);
    int insertPost(PostRequestDTO post);
    void updateViews(int post_num);
    void updatePost(PostDTO post);
    void deletePost(int post_num);

    List<PostDTO> selectPostsWithPaging(
        @Param("limit") int limit, 
        @Param("offset") int offset,
        @Param("category") String category,
        @Param("keyword") String keyword
    );

    int selectTotalCount(
        @Param("category") String category,
        @Param("keyword") String keyword
    );
}
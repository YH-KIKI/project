package kr.hi.project.dao;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import kr.hi.project.dto.PostDTO;
import kr.hi.project.dto.PostRequestDTO;

@Mapper
public interface PostDao {

    List<PostDTO> selectAllPosts();

    // 카멜 표기법 유지
    PostDTO selectPostByNum(int postNum);

    int insertPost(PostRequestDTO post);

    void updateViews(int postNum);

    void updatePost(PostDTO post);

    void deletePost(int postNum);

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
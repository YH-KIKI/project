package kr.hi.project.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.hi.project.dao.PostDao;
import kr.hi.project.dto.PostDTO;
import kr.hi.project.dto.PostRequestDTO;

@Service
public class PostService {

    @Autowired
    private PostDao postDao;

    public List<PostDTO> getAllPosts() {
        return postDao.selectAllPosts();
    }

    public PostDTO getPostDetail(int post_num, Integer loginUserNum, HttpServletRequest request, HttpServletResponse response) {
        PostDTO post = postDao.selectPostByNum(post_num);

        if (loginUserNum != null && loginUserNum.equals(post.getUser_num())) {
            return post;
        }

        Cookie[] cookies = request.getCookies();
        Cookie viewCookie = null;

        if (cookies != null) {
            for (Cookie c : cookies) {
                if (c.getName().equals("postView")) {
                    viewCookie = c;
                    break;
                }
            }
        }

        if (viewCookie == null) {
            Cookie newCookie = new Cookie("postView", "[" + post_num + "]");
            newCookie.setPath("/");
            newCookie.setMaxAge(60 * 60 * 24);
            response.addCookie(newCookie);
            postDao.updateViews(post_num);
        } else {
            String value = viewCookie.getValue();
            if (!value.contains("[" + post_num + "]")) {
                viewCookie.setValue(value + "[" + post_num + "]");
                viewCookie.setPath("/");
                viewCookie.setMaxAge(60 * 60 * 24);
                response.addCookie(viewCookie);
                postDao.updateViews(post_num);
            }
        }

        return postDao.selectPostByNum(post_num);
    }

    public void writePost(PostRequestDTO dto) {
        postDao.insertPost(dto);
    }

    public void modifyPost(PostDTO dto) {
        postDao.updatePost(dto);
    }

    public void removePost(int post_num) {
        postDao.deletePost(post_num);
    }

    public Map<String, Object> getPostsWithPaging(int page, int size, String category, String keyword) {
        int offset = (page - 1) * size;
        
        List<PostDTO> posts = postDao.selectPostsWithPaging(size, offset, category, keyword);
        
        int totalCount = postDao.selectTotalCount(category, keyword);
        
        int totalPages = (int) Math.ceil((double) totalCount / size);

        Map<String, Object> result = new HashMap<>();
        result.put("posts", posts);
        result.put("totalPages", totalPages);
        result.put("totalCount", totalCount);
        
        return result;
    }
}
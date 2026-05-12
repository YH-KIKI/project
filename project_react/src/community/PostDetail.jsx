import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './PostDetail.css';
import axios from 'axios';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';

const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [post, setPost] = useState(null);

  const getStoredUserNum = useCallback(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData).user_num;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const userNum = getStoredUserNum() || '';
        // [수정] 백엔드 컨트롤러 파라미터 명칭 userNum 에 맞춰 수정
        const response = await axios.get(`http://localhost:8080/api/community/post/${id}?userNum=${userNum}`, {
          withCredentials: true
        });
        setPost(response.data);
      } catch (error) {
        console.error("상세 내용을 불러오는 중 오류가 발생했습니다:", error);
      }
    };

    fetchPostDetail();
  }, [id, getStoredUserNum]);

  const formatDate = (dateString) => {
    if (!dateString) return ""; 
    const date = new Date(dateString);
    const ymd = date.toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '');
    const hm = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${ymd} ${hm}`;
  };

  const handleDelete = async () => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        const response = await axios.delete(`http://localhost:8080/api/community/delete/${id}`);
        if (response.data === "success") {
          alert("게시글이 삭제되었습니다.");
          navigate('/community');
        }
      } catch (error) {
        console.error("삭제 중 오류 발생:", error);
        alert("게시글 삭제에 실패했습니다.");
      }
    }
  };

  if (!post) {
    return <div className="post-detail-container">로딩 중...</div>;
  }

  const renderImage = () => {
    if (!post.postImgPath) return null;
    
    // [수정] 백엔드에서 이미 전체 URL을 주므로 중복 방지 로직 추가
    const imgSrc = post.postImgPath.startsWith('http') 
                   ? post.postImgPath 
                   : `http://localhost:8080/uploads/${post.postImgPath}`;

    return (
      <div className="post-image-box" style={{ margin: '20px 0', textAlign: 'center' }}>
        <img 
          src={imgSrc} 
          alt="post" 
          style={{ maxWidth: '100%', borderRadius: '12px' }} 
        />
      </div>
    );
  };

  return (
    <div className="post-detail-container">
      <header className="post-detail-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <div className="post-title-area">
          <h2 className="post-detail-title">{post.postTitle}</h2>
          <div className="post-detail-meta">
            <span className="author">{post.userName}</span>
            <span className="divider">|</span>
            <span className="date">{formatDate(post.postCreatedAt)}</span>
            <span className="divider">|</span>
            <span className="views">조회 {post.postViews}</span>
          </div>
        </div>
        {Number(getStoredUserNum()) === Number(post.userNum) && (
          <div className="post-edit-actions">
            <button className="edit-btn" onClick={() => navigate('/community/write', { state: { post } })}>수정</button>
            <button className="delete-btn" onClick={handleDelete}>삭제</button>
          </div>
        )}
      </header>

      <hr className="post-divider" />

      <div className="post-content">
        {post.postImgPos === 'top' && renderImage()}
        <div dangerouslySetInnerHTML={{ __html: post.postContent }} />
        {post.postImgPos === 'bottom' && renderImage()}
        <div className="post-image-placeholder">
        </div>
      </div>

      <div className="post-actions">
        <LikeButton post_num={id} user_num={getStoredUserNum()} />
      </div>

      <CommentSection post_num={id} user_num={getStoredUserNum()} />
    </div>
  );
};

export default PostDetail;
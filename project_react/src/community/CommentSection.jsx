import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CommentItem from './CommentItem';
import './CommentSection.css';

const CommentSection = ({ post_num, user_num }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const fetchComments = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/comments/${post_num}`);
            setComments(response.data);
        } catch (error) {
            console.error(error);
        }
    }, [post_num]);

    useEffect(() => {
        if (post_num) {
            fetchComments();
        }
    }, [post_num, fetchComments]);

    const handleWriteComment = async () => {
        if (!user_num) {
            alert("로그인이 필요한 서비스입니다.");
            return;
        }
        if (!newComment.trim()) {
            alert("내용을 입력해주세요.");
            return;
        }
        try {
            await axios.post('http://localhost:8080/api/comments', {
                post_num,
                user_num,
                pc_content: newComment,
                parent_pc_num: null
            });
            alert("댓글을 작성하였습니다.");
            setNewComment("");
            fetchComments();
        } catch (error) {
            console.error(error);
        }
    };

    const renderComments = (parentId = null) => {
        return comments
            .filter(comment => comment.parent_pc_num === parentId)
            .map(comment => (
                <div key={comment.pc_num} className={parentId ? "nnp-reply-wrapper" : ""}>
                    <CommentItem 
                        comment={comment} 
                        user_num={user_num} 
                        onRefresh={fetchComments}
                    />
                    <div className="nnp-child-comments">
                        {renderComments(comment.pc_num)}
                    </div>
                </div>
            ));
    };

    return (
        <div className="nnp-comment-container">
            <h3 className="nnp-comment-count">댓글 {comments.length}</h3>
            
            <div className="nnp-comment-list">
                {renderComments(null)}
            </div>

            <div className="nnp-comment-input-box">
                <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="따뜻한 댓글을 남겨주세요!"
                />
                <button className="nnp-comment-submit" onClick={handleWriteComment}>등록</button>
            </div>
        </div>
    );
};

export default CommentSection;
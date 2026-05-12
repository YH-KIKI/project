import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CommentItem from './CommentItem';
import './CommentSection.css';

const CommentSection = ({ post_num, user_num }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const fetchComments = useCallback(async () => {
        if (!post_num) return;
        try {
            const response = await axios.get(`http://localhost:8080/api/comments/${post_num}`);
            setComments(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("댓글 로딩 오류:", error);
        }
    }, [post_num]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

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
                postNum: parseInt(post_num),
                userNum: parseInt(user_num),
                pcContent: newComment,
                parentPcNum: null 
            });
            alert("댓글을 작성하였습니다.");
            setNewComment("");
            fetchComments();
        } catch (error) {
            console.error("댓글 작성 오류:", error);
            alert("댓글 작성에 실패했습니다.");
        }
    };

    const renderComments = (parentId = null) => {
        if (!comments || !Array.isArray(comments)) return null;

        return comments
            .filter(comment => {
                if (!comment) return false;
                
                const pNum = comment.parentPcNum !== undefined ? comment.parentPcNum : comment.parent_pc_num;
                
                if (parentId === null) {
                    return pNum === null || pNum === undefined || pNum === 0 || pNum === "0";
                }
                
                return pNum === parentId;
            })
            .map(comment => {
                const currentPcNum = comment.pcNum || comment.pc_num;

                return (
                    <div key={currentPcNum} className={parentId ? "nnp-reply-wrapper" : ""}>
                        <CommentItem 
                            comment={comment} 
                            user_num={user_num} 
                            onRefresh={fetchComments}
                        />
                        <div className="nnp-child-comments">
                            {currentPcNum && renderComments(currentPcNum)}
                        </div>
                    </div>
                );
            });
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
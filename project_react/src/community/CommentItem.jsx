import React, { useState } from 'react';
import axios from 'axios';

const CommentItem = ({ comment, user_num, onRefresh }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [editContent, setEditContent] = useState(comment.pc_content);
    const [replyContent, setReplyContent] = useState("");

    const isAuthor = user_num === comment.user_num;

    const handleUpdate = async () => {
        try {
            await axios.put('http://localhost:8080/api/comments', {
                pc_num: comment.pc_num,
                user_num: user_num,
                pc_content: editContent
            });
            setIsEditing(false);
            onRefresh();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async () => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            await axios.delete(`http://localhost:8080/api/comments/${comment.pc_num}`);
            onRefresh();
        } catch (error) { console.error(error); }
    };

    const handleReply = async () => {
        if (!user_num) {
            alert("로그인이 필요한 서비스입니다.");
            return;
        }
        if (!replyContent.trim()) {
            alert("답글 내용을 입력해주세요.");
            return;
        }
        try {
            await axios.post('http://localhost:8080/api/comments', {
                post_num: comment.post_num,
                user_num: user_num,
                pc_content: replyContent,
                parent_pc_num: comment.pc_num
            });
            alert("댓글을 작성하였습니다.");
            setReplyContent("");
            setIsReplying(false);
            onRefresh();
        } catch (error) { console.error(error); }
    };

    if (comment.pc_is_deleted) return <div className="nnp-comment-item deleted">삭제된 댓글입니다.</div>;

    return (
        <div className={`nnp-comment-item ${comment.parent_pc_num ? 'nnp-reply-item' : ''}`}>
            <div className="nnp-comment-header">
                <span className="nnp-comment-author">{comment.user_name}</span>
                <span className="nnp-comment-date">{new Date(comment.pc_created_at).toLocaleString()}</span>
            </div>
            <div className="nnp-comment-body">
                {isEditing ? (
                    <div className="nnp-edit-wrapper">
                        <textarea className="nnp-edit-textarea" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                        <div className="nnp-edit-btns">
                            <button className="nnp-edit-save" onClick={handleUpdate}>저장</button>
                            <button className="nnp-edit-cancel" onClick={() => setIsEditing(false)}>취소</button>
                        </div>
                    </div>
                ) : <p>{comment.pc_content}</p>}
            </div>
            <div className="nnp-comment-actions">
                <span onClick={() => setIsReplying(!isReplying)}>답글</span>
                {isAuthor && !isEditing && (
                    <>
                        <span onClick={() => setIsEditing(true)}>수정</span>
                        <span onClick={handleDelete}>삭제</span>
                    </>
                )}
            </div>
            {isReplying && (
                <div className="nnp-edit-wrapper nnp-reply-wrapper">
                    <textarea 
                        className="nnp-edit-textarea" 
                        value={replyContent} 
                        onChange={(e) => setReplyContent(e.target.value)} 
                        placeholder="답글을 남겨주세요!" 
                    />
                    <div className="nnp-edit-btns">
                        <button className="nnp-edit-save" onClick={handleReply}>등록</button>
                        <button className="nnp-edit-cancel" onClick={() => setIsReplying(false)}>취소</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentItem;
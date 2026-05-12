import React, { useState } from 'react';
import axios from 'axios';

const CommentItem = ({ comment, user_num, onRefresh }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    // [수정] pc_content -> pcContent
    const [editContent, setEditContent] = useState(comment.pcContent);
    const [replyContent, setReplyContent] = useState("");

    // [수정] user_num -> userNum
    const isAuthor = Number(user_num) === Number(comment.userNum);

    const handleUpdate = async () => {
        try {
            await axios.put('http://localhost:8080/api/comments', {
                // [수정] 스네이크 케이스를 모두 DTO 필드명(CamelCase)으로 변경
                pcNum: comment.pcNum,
                userNum: user_num,
                pcContent: editContent
            });
            setIsEditing(false);
            onRefresh();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async () => {
        if (!window.confirm("댓글을 삭제하시겠습니까?")) return;
        try {
            // [수정] pc_num -> pcNum
            await axios.delete(`http://localhost:8080/api/comments/${comment.pcNum}`);
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
                // [수정] 스네이크 케이스를 모두 DTO 필드명(CamelCase)으로 변경
                postNum: comment.postNum,
                userNum: user_num,
                pcContent: replyContent,
                parentPcNum: comment.pcNum
            });
            alert("댓글을 작성하였습니다.");
            setReplyContent("");
            setIsReplying(false);
            onRefresh();
        } catch (error) { console.error(error); }
    };

    // [수정] pc_is_deleted -> pcIsDeleted
    if (comment.pcIsDeleted) return <div className="nnp-comment-item deleted">삭제된 댓글입니다.</div>;

    return (
        // [수정] parent_pc_num -> parentPcNum
        <div className={`nnp-comment-item ${comment.parentPcNum ? 'nnp-reply-item' : ''}`}>
            <div className="nnp-comment-header">
                {/* [수정] user_name -> userName */}
                <span className="nnp-comment-author">{comment.userName}</span>
                {/* [수정] pc_created_at -> pcCreatedAt */}
                <span className="nnp-comment-date">
                    {comment.pcCreatedAt ? new Date(comment.pcCreatedAt).toLocaleString() : ""}
                </span>
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
                ) : (
                    /* [수정] pc_content -> pcContent */
                    <p>{comment.pcContent}</p>
                )}
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
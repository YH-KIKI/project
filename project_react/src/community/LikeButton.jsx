import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './LikeButton.css';

const LikeButton = ({ post_num, user_num }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const fetchLikeStatus = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8080/api/likes/status`, {
                params: { post_num, user_num: user_num || 0 }
            });
            setIsLiked(response.data.isLiked);
            setLikeCount(response.data.likeCount);
        } catch (error) {
            console.error(error);
        }
    }, [post_num, user_num]);

    useEffect(() => {
        if (post_num) {
            fetchLikeStatus();
        }
    }, [post_num, fetchLikeStatus]);

    const handleLikeToggle = async () => {
        if (!user_num) {
            alert("로그인이 필요한 서비스입니다.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/likes/toggle', {
                post_num,
                user_num
            });
            
            const newLikedStatus = response.data.isLiked;
            setIsLiked(newLikedStatus);
            setLikeCount(response.data.likeCount);

            if (newLikedStatus) {
                alert("게시글을 추천하였습니다.");
            } else {
                alert("게시글 추천을 취소하였습니다.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="like-button-container">
            <button 
                className={`like-btn ${isLiked ? 'active' : ''}`} 
                onClick={handleLikeToggle}
            >
                <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span>
                추천 {likeCount}
            </button>
        </div>
    );
};

export default LikeButton;
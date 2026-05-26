package kr.hi.project.dao;

import org.apache.ibatis.annotations.Param;

public interface ChatbotDao {
    // 유저의 챗봇 말투 설정 불러오기
    String getUserChatbotMode(@Param("userNum") Long userNum);
}
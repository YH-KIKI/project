package kr.hi.project.dto;

import lombok.Data;

@Data
public class BodyCamDTO {
    private int bcNum;          // 고유번호 (PK)
    private String bcImagePath; // 로컬 저장 경로
    private String bcType;      // 분석 타입 (원본, pose, outline)
    private String bcAiResult;  // 파이썬이 준 AI 결과 (Base64 등)
    private int userNum;        // 유저 번호 (FK)
    private String bcDate;      // 등록일
}
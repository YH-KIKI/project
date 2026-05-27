package kr.hi.project.dto;

import lombok.Data;

@Data
public class BodyCamDTO {
    private int bcNum;           // 리액트의 record.bcNum 과 매핑
    private int userNum;         // 유저 번호
    private String bcImagePath;  // 리액트의 record.bcImagePath 과 매핑 (사진 주소)
    private String bcDate;       // 리액트의 record.bcDate 과 매핑 (날짜)
    private String bcType;       // 원본, pose, outline 구분
    private String bcAiResult;   // AI 점수 등 결과 데이터
    private String bcCreatedAt;  // 생성일시
}
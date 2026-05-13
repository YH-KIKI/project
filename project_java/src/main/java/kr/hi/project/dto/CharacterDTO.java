package kr.hi.project.dto;

import lombok.Data;

@Data
public class CharacterDTO {
    private int chNum;           // 캐릭터 고유 번호
    private int chLevel;         // 현재 레벨
    private int chExp;           // 현재 경험치
    private int userNum;         // 유저 번호
    private int cgNum;           // 현재 성장 단계 외형 번호
    private String cgName;       // 캐릭터 등급 명칭 (ex: 식단 병아리)
    private String cgImg;        // 캐릭터 이미지 파일명
    private int nextLevelExp;    // 다음 레벨까지 필요한 총 경험치
}
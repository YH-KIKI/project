package kr.hi.project.dto;

import java.util.List;

import lombok.Data;

@Data
public class FridgeAIResponseDTO {

    private String status;

    private List<AIResult> results;

    @Data
    public static class AIResult {

        private int rcpNum;

        private String aiReason;

        private List<String> hashtags;
    }
}
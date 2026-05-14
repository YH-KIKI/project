package kr.hi.project.dto;

import lombok.Data;

@Data
public class FailedPredictDTO {
	private int userNum;
    private String userInputName;
    private String fpImage;
}

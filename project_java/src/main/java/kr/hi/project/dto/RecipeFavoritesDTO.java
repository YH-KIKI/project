package kr.hi.project.dto;

import lombok.Data;

@Data
public class RecipeFavoritesDTO {

    private int rfvNum;
    private int userNum;
    private int rcpNum;

    private String rcpName;
    private String rcpWay;
    private String rcpType;
    private String rcpImage;
    private String rcpParts;

    private Integer rcpWeight;
    private Integer rcpKcal;
    private Double rcpCarbs;
    private Double rcpProtein;
    private Double rcpFat;
    private Double rcpNatrium;

    private String rfvCreatedAt;
}
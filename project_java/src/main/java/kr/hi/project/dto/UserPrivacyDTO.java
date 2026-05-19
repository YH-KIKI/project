package kr.hi.project.dto;

import java.util.List;

import lombok.Data;

@Data
public class UserPrivacyDTO {
    private int userNum;
    private String userId;
    private String userName;
    private String userEmail;
    private String userGender;
    private float userHeight;
    private float userWeight;
    private float userTargetweight;
    private int userAge;
    private float userAct;
    private float userDailyKcal;
    private float userDailyCarbs;
    private float userDailyProtein;
    private float userDailyFat;
    private float userDailyNatrium;
    private List<String> userAllergies;
    private String userModel;
    
    private List<Integer> favoriteFoods;
    private List<Integer> dislikeFoods;
}

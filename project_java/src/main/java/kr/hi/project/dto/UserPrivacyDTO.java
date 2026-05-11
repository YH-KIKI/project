package kr.hi.project.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class UserPrivacyDTO {
	@JsonProperty("Usernum")
    private int Usernum;

    @JsonProperty("Userid")
    private String Userid;

    @JsonProperty("Username")
    private String Username;

    @JsonProperty("Email")
    private String Email;

    @JsonProperty("Gender")
    private String Gender;

    @JsonProperty("Height")
    private float Height;

    @JsonProperty("Weight")
    private float Weight;

    @JsonProperty("Targetweight")
    private float Targetweight;

    @JsonProperty("Age")
    private int Age;

    @JsonProperty("Act")
    private float Act;
    
    @JsonProperty("Dailykcal")
    private float Dailykcal;
    
    @JsonProperty("Dailycarbs")
    private float Dailycarbs;
    
    @JsonProperty("Dailyprotein")
    private float Dailyprotein;
    
    @JsonProperty("Dailyfat")
    private float Dailyfat;
    
    @JsonProperty("Dailynatrium")
    private float Dailynatrium;
    
    @JsonProperty("Allergies")
    private List<String> Allergies;
}

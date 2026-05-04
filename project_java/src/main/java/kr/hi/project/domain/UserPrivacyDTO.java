package kr.hi.project.domain;

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
    private int Act;
}

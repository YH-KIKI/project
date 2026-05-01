package kr.hi.project.domain;

import lombok.Data;

@Data
public class UserPrivacyDTO {
	private int Usernum;
    private String Userid;
    private String Username;
    private String Email;
    private String Gender;
    private float Height;
    private float Weight;
    private float Targetweight;
    private int Age;
    private int Act;
}

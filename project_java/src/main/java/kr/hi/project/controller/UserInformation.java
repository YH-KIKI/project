package kr.hi.project.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import kr.hi.project.domain.UserPrivacyDTO;
import kr.hi.project.service.JwtService;
import kr.hi.project.service.UserService;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class UserInformation {
	@Autowired
	private JwtService jwtService;
	@Autowired
	private UserService userService;

	@GetMapping("/api/information_select")
	public UserPrivacyDTO getUserInfo(@RequestHeader("Authorization") String authHeader) {

	    String token = authHeader.replace("Bearer ", "");
	    String userid = jwtService.getUsernameFromToken(token);

	    UserPrivacyDTO dto = new UserPrivacyDTO();
	    dto.setUserid(userid);
	    int usernum = userService.findUsernumByUserid(userid);
	    return userService.getUserInfo(usernum);
	}

	
	@PostMapping("/api/information_updata")
	public Map<String, String> signup(@RequestBody UserPrivacyDTO UserPrivacyDTO){
	    userService.informationUpdata(UserPrivacyDTO);
	    
	    Map<String, String> response = new HashMap<>();
	    response.put("message", "정보수정이 완료되었습니다!");
		return response;
		
	}

}

package kr.hi.project.controller;

import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.AllArgsConstructor;


@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/ai")
public class ProxyController {

	private final WebClient webClient;
	@PostMapping("/api/detect/proxy")
	public String service(@RequestParam("message") String message, @RequestParam("file") MultipartFile file) {
	
	System.out.println("2. [Spring Boot] 리액트에서 넘어온 데이터 확인 👇");
	System.out.println(" - 메시지: " + message);
	System.out.println(" - 파일명: " + file.getOriginalFilename());
	
    MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
    bodyBuilder.part("message", message);
    bodyBuilder.part("file", file.getResource());
    String result = webClient.post().uri("/detect")
      .contentType(MediaType.MULTIPART_FORM_DATA)
      .body(BodyInserters.fromMultipartData(bodyBuilder.build()))
      .retrieve()
      .bodyToMono(String.class)
      .block();

    System.out.println("5. [Spring Boot] 파이썬에서 돌아온 결과 확인 👇");
	System.out.println(" - 결과: " + result);
    return result;
  }
}
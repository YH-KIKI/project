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
    MultipartBodyBuilder bodyBuilder = new MultipartBodyBuilder();
    bodyBuilder.part("message", message);
    bodyBuilder.part("file", file.getResource());
    String result = webClient.post().uri("/detect")
      .contentType(MediaType.MULTIPART_FORM_DATA)
      .body(BodyInserters.fromMultipartData(bodyBuilder.build()))
      .retrieve()
      .bodyToMono(String.class)
      .block();
      return result;
  }
}
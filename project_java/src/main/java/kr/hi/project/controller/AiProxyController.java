package kr.hi.project.controller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class AiProxyController {
	
	// [AWS 치트키 1] 사진인식주소
    @Value("${ai.analyze.url:http://localhost:8000}")
    private String analyzeServerUrl;

    // [AWS 치트키 2] 제미나이 평가 서버 주소
    @Value("${ai.gemini.url:http://localhost:8001}")
    private String geminiServerUrl;
    
    // 식단 피드백
    @Value("${ai.meal.url:http://localhost:8000}")
    private String mealServerUrl;

    @RequestMapping(value = "/api/ai/predict", method = {RequestMethod.POST, RequestMethod.GET})
    public ResponseEntity<String> proxyPredict(@RequestParam("file") MultipartFile file) {
        try {
            // 리액트가 자바로 보낸 이미지 파일을 그대로 가로챕니다.
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 자바가 백엔드 내부망을 통해 8000번 파이썬 서버로 신호를 패스
            RestTemplate restTemplate = new RestTemplate();
            String pythonUrl = analyzeServerUrl + "/api/ai/predict"; 
            
            // 파이썬이 분석해서 되돌려준 맛있는 결과 데이터를 리액트한테 그대로 토스합니다.
            ResponseEntity<String> response = restTemplate.postForEntity(pythonUrl, requestEntity, String.class);
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("자바 중계 서버 오류: " + e.getMessage());
        }
    }

    @PostMapping("/api/ai/evaluate")
    public ResponseEntity<String> proxyEvaluate(@RequestBody String jsonPayload) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            
            // 자바가 백엔드 내부망을 통해 8001번 제미나이 파이썬 서버로 패스
            // 나중에 AWS로 배포할 때 여기 localhost만 AWS 제미나이 EC2 IP로 바꾸기
            String geminiUrl = geminiServerUrl + "/api/ai/evaluate"; 

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> requestEntity = new HttpEntity<>(jsonPayload, headers);

            // 파이썬이 제미나이로 분석해서 준 냥이 말투 답변을 리액트한테 그대로 토스!
            ResponseEntity<String> response = restTemplate.postForEntity(geminiUrl, requestEntity, String.class);
            return response;

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("자바 제미나이 중계 오류: " + e.getMessage());
        }
    }
    
    
    // 식단 피드백용    
    @PostMapping("/api/ai/meal-feedback")
    public ResponseEntity<String> proxyMealFeedback(@RequestBody String jsonPayload) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            String pythonUrl =
                    mealServerUrl + "/api/ai/meal-feedback";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> requestEntity =
                    new HttpEntity<>(jsonPayload, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                        pythonUrl,
                        requestEntity,
                        String.class
                    );

            return response;

        } catch (Exception e) {
            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body("식단 피드백 중계 오류: " + e.getMessage());
        }
    }
}

package kr.hi.project.service;

import kr.hi.project.dao.BodyCamDao;
import kr.hi.project.dto.BodyCamDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper; // 🌟 추가됨 (JSON 변환용)

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BodyCheckService {

    private final BodyCamDao bodyCamDao;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper(); // JSON 변환기

    @Value("${project.upload.path:C:/uploads/bodycam/}")
    private String UPLOAD_DIR; 

    // 파이썬 기본 주소
    @Value("${AI_SERVER_URL:http://localhost:8000}")
    private String pythonBaseUrl;

    // 🌟 리턴 타입을 String -> Map<String, Object>로 변경! (리액트가 읽기 편하게)
    public Map<String, Object> analyzeAndSave(MultipartFile file, String analyzeType, Long userNum) throws Exception {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        String savedFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String savedFilePath = UPLOAD_DIR + savedFileName;
        String dbImagePath = "/uploads/bodycam/" + savedFileName;

        byte[] fileData = file.getBytes(); 
        Files.write(Paths.get(savedFilePath), fileData);

        Map<String, Object> resultMap = new HashMap<>();
        String aiResultText = "";
        
        // 원본이 아닌 AI 분석(pose, outline)일 때 파이썬 호출
        if (!"원본".equals(analyzeType)) {
            // 🌟 파이썬의 나누어진 주소로 정확히 타겟팅!
            String targetUrl = pythonBaseUrl + "/api/ai/bodycam/" + analyzeType; 
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            ByteArrayResource fileResource = new ByteArrayResource(fileData) {
                @Override public String getFilename() { return file.getOriginalFilename(); }
            };
            body.add("file", fileResource);

            try {
                // 파이썬으로부터 Map(JSON) 형태로 응답받기
                ResponseEntity<Map> response = restTemplate.postForEntity(targetUrl, new HttpEntity<>(body, headers), Map.class);
                resultMap = response.getBody(); 
                aiResultText = objectMapper.writeValueAsString(resultMap); // DB 저장용 문자열 변환
            } catch (Exception e) {
                resultMap.put("error", "AI 분석 실패");
                aiResultText = "AI 분석 실패";
            }
        } else {
            resultMap.put("status", "success");
            resultMap.put("message", "원본 저장 완료");
        }

        // DB 저장
        BodyCamDTO dto = new BodyCamDTO();
        dto.setBcImagePath(dbImagePath);
        dto.setBcType(analyzeType);
        dto.setBcAiResult(aiResultText);
        dto.setUserNum(userNum.intValue());
        bodyCamDao.insertBodyCamRecord(dto);

        return resultMap; // 🌟 리액트로 Map(JSON 객체) 반환!
    }

    public List<BodyCamDTO> getBodyCheckList(Long userNum) {
        return bodyCamDao.selectBodyCamList(userNum.intValue());
    }
    
    public void deleteBodyCheck(int bcNum) {
        bodyCamDao.deleteBodyCamRecord(bcNum);
    }
}
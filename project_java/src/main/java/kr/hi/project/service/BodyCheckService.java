package kr.hi.project.service;

import kr.hi.project.dao.BodyCamDao;
import kr.hi.project.dto.BodyCamDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BodyCheckService {

    private final BodyCamDao bodyCamDao;
    private final RestTemplate restTemplate = new RestTemplate();
    
    private final String UPLOAD_DIR = "C:/uploads/bodycam/"; 

    public String analyzeAndSave(MultipartFile file, String analyzeType, Long userNum) throws IOException {
        
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        String savedFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String savedFilePath = UPLOAD_DIR + savedFileName;
        String dbImagePath = "/uploads/bodycam/" + savedFileName;

        // 🌟 파일을 C드라이브로 옮기기 전에 메모리에 복사! (에러 해결 핵심)
        byte[] fileData = file.getBytes(); 
        Files.write(Paths.get(savedFilePath), fileData);

        String aiResultText = "";

        if (!"원본".equals(analyzeType)) {
            String pythonUrl = "http://localhost:8000/api/ai/bodycheck";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            ByteArrayResource fileResource = new ByteArrayResource(fileData) {
                @Override public String getFilename() { return file.getOriginalFilename(); }
            };

            body.add("file", fileResource);
            body.add("analyzeType", analyzeType);
            body.add("userNum", userNum);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            try {
                ResponseEntity<String> response = restTemplate.postForEntity(pythonUrl, requestEntity, String.class);
                aiResultText = response.getBody(); 
            } catch (Exception e) {
                System.out.println("🚨 파이썬 서버 통신 실패: " + e.getMessage());
                aiResultText = "AI 분석 실패 (서버 연결 에러)";
            }
        }

        BodyCamDTO dto = new BodyCamDTO();
        dto.setBcImagePath(dbImagePath);
        dto.setBcType(analyzeType);
        dto.setBcAiResult(aiResultText);
        dto.setUserNum(userNum.intValue());
        
        bodyCamDao.insertBodyCamRecord(dto);

        return "원본".equals(analyzeType) ? "원본 저장 성공" : aiResultText;
    }
}
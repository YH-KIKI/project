package kr.hi.project.service;

import kr.hi.project.dao.BodyCamDao;
import kr.hi.project.dto.BodyCamDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value; // 🌟 필수 추가: 환경변수 값을 가져오는 기능
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BodyCheckService {

    private final BodyCamDao bodyCamDao;
    private final RestTemplate restTemplate = new RestTemplate();

    // ==========================================
    // 사진 업로드 경로 (로컬 & AWS 자동 스위칭)
    // - 환경변수 'project.upload.path'가 없으면 C드라이브를 사용합니다.
    // ==========================================
    @Value("${project.upload.path:C:/uploads/bodycam/}")
    private String UPLOAD_DIR; 

    // ==========================================
    // 파이썬 AI 서버 주소 (로컬 & AWS 자동 스위칭)
    // - 환경변수 'AI_SERVER_URL'이 없으면 localhost:8000을 사용합니다.
    // ==========================================
    @Value("${AI_SERVER_URL:http://localhost:8000}/api/ai/bodycheck")
    private String pythonUrl;

    public String analyzeAndSave(MultipartFile file, String analyzeType, Long userNum) throws IOException {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) uploadDir.mkdirs();

        String savedFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String savedFilePath = UPLOAD_DIR + savedFileName;
        
        // DB에는 웹에서 접근 가능한 상대 경로로 저장
        String dbImagePath = "/uploads/bodycam/" + savedFileName;

        byte[] fileData = file.getBytes(); 
        Files.write(Paths.get(savedFilePath), fileData);

        String aiResultText = "";
        
        if (!"원본".equals(analyzeType)) {
            // 🌟 [수정 3] 변경된 pythonUrl 변수를 사용하여 요청을 보냅니다.
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            ByteArrayResource fileResource = new ByteArrayResource(fileData) {
                @Override public String getFilename() { return file.getOriginalFilename(); }
            };
            body.add("file", fileResource);
            body.add("analyzeType", analyzeType);
            body.add("userNum", userNum);

            try {
                ResponseEntity<String> response = restTemplate.postForEntity(pythonUrl, new HttpEntity<>(body, headers), String.class);
                aiResultText = response.getBody(); 
            } catch (Exception e) {
                aiResultText = "AI 분석 실패";
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

    // 눈바디 목록 가져오기
    public List<BodyCamDTO> getBodyCheckList(Long userNum) {
        return bodyCamDao.selectBodyCamList(userNum.intValue());
    }
    
    // DB 기록 삭제
    public void deleteBodyCheck(int bcNum) {
        bodyCamDao.deleteBodyCamRecord(bcNum);
    }
}
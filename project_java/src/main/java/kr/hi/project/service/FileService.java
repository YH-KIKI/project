package kr.hi.project.service;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {

    // 🌟 [수정] 이제 직접 경로를 쓰지 않고, WebConfig처럼 설정값을 가져옵니다.
    // 설정이 없으면 프로젝트 폴더 내 uploads 폴더를 기본값으로 사용합니다.
    @Value("${spring.web.resources.static-locations:uploads/}")
    private String uploadPath;

    public String saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) return null;

        // 🌟 [수정] WebConfig의 로직과 일치시킵니다.
        String cleanPath = uploadPath.replace("file:", "").replace("///", "/");
        
        File folder = new File(cleanPath);
        if (!folder.exists()) folder.mkdirs();

        String originalName = file.getOriginalFilename();
        String uuid = UUID.randomUUID().toString();
        String savedName = uuid + "_" + originalName;

        // 파일 실제 저장
        File target = new File(folder.getAbsolutePath() + File.separator + savedName);
        file.transferTo(target);

        // DB에는 브라우저 접근 경로인 /uploads/파일명 만 저장
        return "/uploads/" + savedName;
    }
    
    // 설정 파일에서 경로를 읽기
    @Value("${project.relearn.path}")
    private String relearnPath;

    public String saveToTrainingFolder(MultipartFile file, String foodName) throws IOException {
        // 운영체제에 상관없이 경로를 합쳐주는 File.separator 사용
        String cleanPath = relearnPath.replace("file:", "").replace("///", "/");
        File folder = new File(cleanPath + File.separator + foodName);
        
        if (!folder.exists()) folder.mkdirs(); 

        // 파일 저장
        String originalName = file.getOriginalFilename();
        String uuid = UUID.randomUUID().toString();
        String savedName = uuid + "_" + originalName;

        File target = new File(folder, savedName);
        file.transferTo(target);
        
        return "/uploads/relearn/" + foodName + "/" + savedName;
    }
}
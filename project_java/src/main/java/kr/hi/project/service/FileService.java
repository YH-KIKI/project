package kr.hi.project.service;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
public class FileService {
    // 실제 파일이 저장될 로컬 경로
    private final String uploadPath = "C:/nnp_uploads/";

    public String saveFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) return null;

        //폴더가 없으면 생성
        File folder = new File(uploadPath);
        if (!folder.exists()) folder.mkdirs();

        //파일명 중복 방지를 위한 랜덤 이름 생성 (uuid_originalName)
        String originalName = file.getOriginalFilename();
        String uuid = UUID.randomUUID().toString();
        String savedName = uuid + "_" + originalName;

        //파일 저장
        File target = new File(uploadPath + savedName);
        file.transferTo(target);

        //브라우저에서 접근할 경로 반환
        // WebConfig 설정 덕분에 /uploads/파일명 으로 접근 가능해집니다.
        return "/uploads/" + savedName;
    }
}

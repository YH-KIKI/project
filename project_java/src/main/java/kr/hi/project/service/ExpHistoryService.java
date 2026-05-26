package kr.hi.project.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.hi.project.dao.ExpHistoryDao;
import kr.hi.project.dto.ExpHistoryDTO;

@Service
public class ExpHistoryService {

    @Autowired
    private ExpHistoryDao expHistoryDao;

    /**
     * 🌟 유저 아이디(String)를 이용해 유저 고유 번호(int)를 조회합니다.
     * 컨트롤러에서 JWT 토큰을 파싱한 후 userNum을 찾기 위해 필요합니다.
     */
    public Integer getUserNumByUserId(String userId) {
        return expHistoryDao.findUserNumByUserId(userId);
    }

    /**
     * 📊 특정 유저의 캐릭터 경험치 획득 히스토리 목록을 페이징하여 조회합니다.
     */
    public List<ExpHistoryDTO> getHistoryList(int userNum, int offset, int limit) {
        return expHistoryDao.getHistoryList(userNum, offset, limit);
    }

    /**
     * 🔢 페이징 처리를 위해 해당 유저의 전체 히스토리 개수를 조회합니다.
     */
    public int getTotalCount(int userNum) {
        return expHistoryDao.getTotalCount(userNum);
    }
}
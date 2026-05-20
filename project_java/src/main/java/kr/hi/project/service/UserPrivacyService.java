package kr.hi.project.service;

import org.springframework.stereotype.Service;

import kr.hi.project.dao.UserPrivacyDao;
import kr.hi.project.dto.UserPrivacyDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserPrivacyService {

    private final UserPrivacyDao userPrivacyDao;

    public UserPrivacyDTO getUserPrivacy(int userNum) {
        return userPrivacyDao.findNutritionTargetByUserNum(userNum);
    }
}
package kr.hi.project.service;

import kr.hi.project.dao.BadgeDao;
import kr.hi.project.dto.BadgeDTO;
import kr.hi.project.dto.BadgeLevelDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeDao badgeDao;

    // =========================
    // 전체 뱃지 조회
    // =========================
    public List<BadgeDTO> getBadgeList(int userNum) {

        List<BadgeDTO> list = badgeDao.getUserBadges(userNum);

        for (BadgeDTO badge : list) {

            int progress = calculateProgress(userNum, badge.getBadgeId());
            badge.setProgress(progress);

            int requirement = badge.getRequirementValue();

            badge.setOwned(progress >= requirement);

            badge.setNextRequirement(requirement);

            badge.setPercent(
                    requirement == 0 ? 0 :
                            Math.min(progress * 100 / requirement, 100)
            );
        }

        return list;
    }

    // =========================
    // 대표 뱃지 설정
    // =========================
    public void equipBadge(int userNum, String badgeId) {
        badgeDao.setEquippedBadge(badgeId, userNum);
    }

    // =========================
    // 이벤트 발생 → 갱신
    // =========================
    public void insertEvent(int userNum, String eventType, int value) {
        updateBadges(userNum);
    }

    // =========================
    // 핵심: 뱃지 갱신
    // =========================
    public void updateBadges(int userNum) {

        List<BadgeDTO> badges = badgeDao.getUserBadges(userNum);

        for (BadgeDTO badge : badges) {

            int progress = calculateProgress(userNum, badge.getBadgeId());

            int requirement = badge.getRequirementValue();

            boolean owned = progress >= requirement;

            // progress 누적 저장
            badgeDao.updateBadgeProgress(
                    badge.getBadgeId(),
                    userNum,
                    progress
            );

            // 레벨업 처리
            if (owned && badge.getLevel() < badge.getMaxLevel()) {

                badgeDao.levelUpBadge(
                        badge.getBadgeId(),
                        userNum,
                        badge.getMaxLevel()
                );
            }
        }
    }

    // =========================
    // 핵심 계산 (DB 기반으로 변경 필요 없음)
    // =========================
    private int calculateProgress(int userNum, String badgeId) {

        switch (badgeId) {

            case "login_streak":
                return badgeDao.getUserBadges(userNum).get(0).getProgress(); // 임시 구조

            case "login_total":
                return badgeDao.getUserBadges(userNum).get(0).getProgress();

            case "meal_total":
                return badgeDao.getUserBadges(userNum).get(0).getProgress();

            case "post_total":
                return badgeDao.getUserBadges(userNum).get(0).getProgress();

            case "like_received":
                return badgeDao.getUserBadges(userNum).get(0).getProgress();

            case "like_given":
                return badgeDao.getUserBadges(userNum).get(0).getProgress();

            default:
                return 0;
        }
    }
}
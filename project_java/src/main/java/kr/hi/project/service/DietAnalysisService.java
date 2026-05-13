package kr.hi.project.service;

import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import kr.hi.project.dao.DietAnalysisDao;
import kr.hi.project.dto.DietAnalysisResponseDto;

@Service
@RequiredArgsConstructor
public class DietAnalysisService {

    private final DietAnalysisDao dietAnalysisDao;

    /**
     * 1. 특정 날짜의 식단 분석 요약 데이터 가져오기
     */
    @Transactional
    public DietAnalysisResponseDto getDailyAnalysis(Long userNum, String date) {
        
        // DB에서 데이터 가져오기
        Map<String, Object> totals = dietAnalysisDao.selectDailyTotalNutrients(userNum, date);
        Integer targetKcal = dietAnalysisDao.selectUserTargetKcal(userNum);

        // 방어 로직 (DB에 입력값이 없거나 계산 결과가 null일 경우 대비)
        int currentKcal = totals != null && totals.get("total_kcal") != null ? ((Number) totals.get("total_kcal")).intValue() : 0;
        int safeTargetKcal = (targetKcal != null && targetKcal > 0) ? targetKcal : 1800; // 기본값 세팅
        
        int carbs = totals != null && totals.get("total_carbs") != null ? ((Number) totals.get("total_carbs")).intValue() : 0;
        int protein = totals != null && totals.get("total_protein") != null ? ((Number) totals.get("total_protein")).intValue() : 0;
        int fat = totals != null && totals.get("total_fat") != null ? ((Number) totals.get("total_fat")).intValue() : 0;
        int sodium = totals != null && totals.get("total_sodium") != null ? ((Number) totals.get("total_sodium")).intValue() : 0;

        // 오차율 계산
        double errorRate = Math.abs((double)(safeTargetKcal - currentKcal)) / safeTargetKcal * 100;

        String grade;
        String gradeMessage;
        int earnedXp = 0;

        // 기획안 기반 등급 및 경험치 부여 로직
        if (currentKcal == 0) {
            grade = "F"; gradeMessage = "아직 식단이 기록되지 않았어요!"; earnedXp = 0;
        } else if (errorRate <= 10) {
            grade = "A"; gradeMessage = "아주 훌륭해요! 현실적으로 완벽에 가까운 식단"; earnedXp = 50;
        } else if (errorRate <= 20) {
            grade = "B"; gradeMessage = "좋습니다! 꾸준히 잘 관리하고 있는 식단"; earnedXp = 30;
        } else if (errorRate <= 30) {
            grade = "C"; gradeMessage = "무난해요! 조금만 더 신경 쓰면 훨씬 좋아질 거예요"; earnedXp = 15;
        } else if (errorRate <= 40) {
            grade = "D"; gradeMessage = "아쉬워요! 다음 끼니엔 목표 비율을 조금 더 의식해 볼까요?"; earnedXp = 5;
        } else {
            grade = "F"; gradeMessage = "목표와 너무 크게 빗나간 식단 (또는 미기록)"; earnedXp = 0;
        }

        // 캐릭터 경험치(XP) DB 업데이트
        if (earnedXp > 0) {
            dietAnalysisDao.updateCharacterExp(userNum, earnedXp);
        }

        // 파이썬 연동 전 임시 메시지
        String aiFeedback = "AI 분석 결과, \n당신은 지금 물을 한 잔 마시는 것이 좋아요!";

        // 결과 DTO 반환
        return new DietAnalysisResponseDto(
            grade, gradeMessage, currentKcal, safeTargetKcal, earnedXp,
            carbs, protein, fat, sodium, aiFeedback
        );
    }

    /**
     * 2. 사용자가 식단을 기록한 모든 날짜 목록 가져오기 (달력 도장 표시용)
     */
    public List<String> getRecordedDates(Long userNum) {
        return dietAnalysisDao.selectRecordedDates(userNum);
    }
}
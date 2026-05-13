package kr.hi.project.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;
import kr.hi.project.dao.DietAnalysisDao;
import kr.hi.project.dto.DietAnalysisResponseDto;

@Service
@RequiredArgsConstructor
public class DietAnalysisService {

    private final DietAnalysisDao dietAnalysisDao;

    /**
     * 1. 특정 날짜의 식단 분석 요약 데이터 가져오기 + 파이썬 AI 연동
     */
    @Transactional
    public DietAnalysisResponseDto getDailyAnalysis(Long userNum, String date) {
        
        // 1. DB에서 데이터 가져오기
        Map<String, Object> totals = dietAnalysisDao.selectDailyTotalNutrients(userNum, date);
        Integer targetKcal = dietAnalysisDao.selectUserTargetKcal(userNum);

        // 방어 로직 (DB에 입력값이 없거나 계산 결과가 null일 경우 대비)
        int currentKcal = totals != null && totals.get("total_kcal") != null ? ((Number) totals.get("total_kcal")).intValue() : 0;
        int safeTargetKcal = (targetKcal != null && targetKcal > 0) ? targetKcal : 1800;
        
        int carbs = totals != null && totals.get("total_carbs") != null ? ((Number) totals.get("total_carbs")).intValue() : 0;
        int protein = totals != null && totals.get("total_protein") != null ? ((Number) totals.get("total_protein")).intValue() : 0;
        int fat = totals != null && totals.get("total_fat") != null ? ((Number) totals.get("total_fat")).intValue() : 0;
        int sodium = totals != null && totals.get("total_sodium") != null ? ((Number) totals.get("total_sodium")).intValue() : 0;

        // 2. 오차율 계산
        double errorRate = Math.abs((double)(safeTargetKcal - currentKcal)) / safeTargetKcal * 100;

        String grade;
        String gradeMessage;
        int earnedXp = 0;

        // 3. 기획안 기반 등급 및 경험치 부여 로직
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

        // 4. 캐릭터 경험치(XP) DB 업데이트
        if (earnedXp > 0) {
            dietAnalysisDao.updateCharacterExp(userNum, earnedXp);
        }

        // 🌟 5. 파이썬 AI 서버로 3줄 요약 피드백 요청하기 🌟
        String aiFeedback = "";
        try {
            RestTemplate restTemplate = new RestTemplate();
            String pythonUrl = "http://localhost:8000/api/v1/ai/feedback";

            // 파이썬으로 보낼 데이터 조립
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("userNum", userNum);
            requestData.put("grade", grade);
            requestData.put("currentKcal", currentKcal);
            requestData.put("targetKcal", safeTargetKcal);
            requestData.put("carbs", carbs);
            requestData.put("protein", protein);
            requestData.put("fat", fat);
            requestData.put("sodium", sodium);

            // 파이썬 서버에 POST 요청 보내기
            @SuppressWarnings("unchecked")
            Map<String, Object> aiResponse = restTemplate.postForObject(pythonUrl, requestData, Map.class);
            
            if (aiResponse != null && aiResponse.get("feedback") != null) {
                aiFeedback = (String) aiResponse.get("feedback");
            } else {
                aiFeedback = "AI 코치가 식단을 분석 중입니다.";
            }
        } catch (Exception e) {
            System.out.println("❌ 파이썬 AI 서버 연결 실패: " + e.getMessage());
            aiFeedback = "1. AI 코치 서버와 연결할 수 없습니다.\n2. 파이썬 서버가 켜져 있는지 확인해 주세요.\n3. 계속되면 관리자에게 문의해 주세요.";
        }

        // 6. 결과 DTO 반환
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
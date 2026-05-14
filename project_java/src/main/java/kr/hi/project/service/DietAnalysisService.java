package kr.hi.project.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import kr.hi.project.dao.DietAnalysisDao;
import kr.hi.project.dto.DietAnalysisResponseDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DietAnalysisService {

    private final DietAnalysisDao dietAnalysisDao;

    // =========================================================================
    // 1. [일일 분석] 특정 날짜의 식단 분석 요약 데이터 가져오기 + 파이썬 AI 연동
    // =========================================================================
    @Transactional
    public DietAnalysisResponseDto getDailyAnalysis(Long userNum, String date) {
        
        Map<String, Object> totals = dietAnalysisDao.selectDailyTotalNutrients(userNum, date);
        Integer targetKcal = dietAnalysisDao.selectUserTargetKcal(userNum);

        int currentKcal = totals != null && totals.get("total_kcal") != null ? ((Number) totals.get("total_kcal")).intValue() : 0;
        int safeTargetKcal = (targetKcal != null && targetKcal > 0) ? targetKcal : 1800;
        
        int carbs = totals != null && totals.get("total_carbs") != null ? ((Number) totals.get("total_carbs")).intValue() : 0;
        int protein = totals != null && totals.get("total_protein") != null ? ((Number) totals.get("total_protein")).intValue() : 0;
        int fat = totals != null && totals.get("total_fat") != null ? ((Number) totals.get("total_fat")).intValue() : 0;
        int sodium = totals != null && totals.get("total_sodium") != null ? ((Number) totals.get("total_sodium")).intValue() : 0;

        double errorRate = Math.abs((double)(safeTargetKcal - currentKcal)) / safeTargetKcal * 100;

        String grade;
        String gradeMessage;
        int earnedXp = 0;

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

        if (earnedXp > 0) {
            dietAnalysisDao.updateCharacterExp(userNum, earnedXp);
        }

        String aiFeedback = "";
        try {
            RestTemplate restTemplate = new RestTemplate();
            String pythonUrl = "http://localhost:8000/api/v1/ai/feedback";

            Map<String, Object> requestData = new HashMap<>();
            requestData.put("userNum", userNum);
            requestData.put("grade", grade);
            requestData.put("currentKcal", currentKcal);
            requestData.put("targetKcal", safeTargetKcal);
            requestData.put("carbs", carbs);
            requestData.put("protein", protein);
            requestData.put("fat", fat);
            requestData.put("sodium", sodium);

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

        return new DietAnalysisResponseDto(
            grade, gradeMessage, currentKcal, safeTargetKcal, earnedXp,
            carbs, protein, fat, sodium, aiFeedback
        );
    }

    // =========================================================================
    // 2. [달력 표시용] 사용자가 식단을 기록한 모든 날짜 목록 가져오기
    // =========================================================================
    public List<String> getRecordedDates(Long userNum) {
        return dietAnalysisDao.selectRecordedDates(userNum);
    }

    // =========================================================================
    // 3. [통계 메인] 주간/월간 차트 데이터 반환 핵심 로직
    // =========================================================================
    @Transactional(readOnly = true)
    public Map<String, Object> getStatsData(Long userNum, String date, String type) {
        LocalDate selectedDate = LocalDate.parse(date);
        LocalDate startDate;
        LocalDate endDate = selectedDate;

        if ("weekly".equals(type)) {
            startDate = selectedDate.minusDays(6);
        } else {
            startDate = selectedDate.withDayOfMonth(1);
            endDate = selectedDate.withDayOfMonth(selectedDate.lengthOfMonth());
        }

        List<Map<String, Object>> rawData = dietAnalysisDao.selectStatsByPeriod(
            userNum, startDate.toString(), endDate.toString()
        );

        List<Map<String, Object>> chartData = new ArrayList<>();
        int sumCarbs = 0, sumProtein = 0, sumFat = 0, sumSodium = 0;
        
        // 🌟 [수정됨] 무조건 7일 혹은 해당 월의 일수(예: 31일)로 나누기 위한 변수 설정
        int divideDays = "weekly".equals(type) ? 7 : selectedDate.lengthOfMonth();

        if ("weekly".equals(type)) {
            for (int i = 0; i < 7; i++) {
                LocalDate currentDate = startDate.plusDays(i);
                String dayName = currentDate.getDayOfWeek().name();
                String koreanDay = switch (dayName) {
                    case "MONDAY" -> "월"; case "TUESDAY" -> "화"; case "WEDNESDAY" -> "수";
                    case "THURSDAY" -> "목"; case "FRIDAY" -> "금"; case "SATURDAY" -> "토"; default -> "일";
                };

                int dailyKcal = 0;
                for (Map<String, Object> row : rawData) {
                    if (row.get("log_date").toString().equals(currentDate.toString())) {
                        dailyKcal = ((Number) row.get("total_kcal")).intValue();
                        sumCarbs += ((Number) row.get("total_carbs")).intValue();
                        sumProtein += ((Number) row.get("total_protein")).intValue();
                        sumFat += ((Number) row.get("total_fat")).intValue();
                        sumSodium += ((Number) row.get("total_sodium")).intValue();
                        break;
                    }
                }
                
                Map<String, Object> dayData = new HashMap<>();
                dayData.put("day", koreanDay);
                dayData.put("kcal", dailyKcal);
                chartData.add(dayData);
            }
        } else {
            int[] weeklyKcal = new int[5]; 
            for (Map<String, Object> row : rawData) {
                LocalDate logDate = LocalDate.parse(row.get("log_date").toString());
                int weekOfMonth = (logDate.getDayOfMonth() - 1) / 7;
                if (weekOfMonth > 4) weekOfMonth = 4;
                
                weeklyKcal[weekOfMonth] += ((Number) row.get("total_kcal")).intValue();
                sumCarbs += ((Number) row.get("total_carbs")).intValue();
                sumProtein += ((Number) row.get("total_protein")).intValue();
                sumFat += ((Number) row.get("total_fat")).intValue();
                sumSodium += ((Number) row.get("total_sodium")).intValue();
            }

            for (int i = 0; i < 5; i++) {
                Map<String, Object> weekData = new HashMap<>();
                weekData.put("day", (i + 1) + "주차");
                weekData.put("kcal", weeklyKcal[i]);
                chartData.add(weekData);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("chartData", chartData);
        
        // 🌟 [수정됨] 엄격하게 7일 / 해당 월 일수로 나눔
        Map<String, Integer> nutrients = new HashMap<>();
        nutrients.put("carbs", sumCarbs / divideDays);
        nutrients.put("protein", sumProtein / divideDays);
        nutrients.put("fat", sumFat / divideDays);
        nutrients.put("sodium", sumSodium / divideDays);
        result.put("nutrients", nutrients);

        return result;
    }
}
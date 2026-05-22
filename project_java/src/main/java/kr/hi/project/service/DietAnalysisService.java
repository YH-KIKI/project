package kr.hi.project.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value; 
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import kr.hi.project.dao.DietAnalysisDao;
import kr.hi.project.dao.MealRecordDao; 
import kr.hi.project.dto.MealDetailDTO; 
import kr.hi.project.dto.DietAnalysisResponseDto;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DietAnalysisService {

    private final DietAnalysisDao dietAnalysisDao;
    private final MealRecordDao mealRecordDao; 

    // 실서버(도커)와 로컬 환경 자동 주소 스위칭 세팅
    @Value("${AI_SERVER_URL:http://localhost:8000}")
    private String aiServerUrl;

    // =========================================================================
    // 1. [일일 분석] 특정 날짜의 식단 분석 요약 데이터 가져오기 + 파이썬 AI 연동
    // =========================================================================
    @Transactional
    public DietAnalysisResponseDto getDailyAnalysis(Long userNum, String date) {
        
        List<MealDetailDTO> todayMeals = mealRecordDao.getTodayMealRecord(userNum.intValue(), date);
        Integer targetKcal = dietAnalysisDao.selectUserTargetKcal(userNum);
        int safeTargetKcal = (targetKcal != null && targetKcal > 0) ? targetKcal : 1800;

        int currentKcal = 0;
        int carbs = 0;
        int protein = 0;
        int fat = 0;
        int sodium = 0;

        if (todayMeals != null && !todayMeals.isEmpty()) {
            for (MealDetailDTO item : todayMeals) {
                double portion = item.getMdPortion() <= 0 ? 1.0 : item.getMdPortion();
                
                currentKcal += item.getMdKcal();
                carbs += (int) (item.getFoCarbs() * portion);
                protein += (int) (item.getFoProtein() * portion);
                fat += (int) (item.getFoFat() * portion);
                sodium += (int) (item.getFoNatrium() * portion);
            }
        }

        // 🌟 [추가] 유저의 식단 목표(Type)를 DB에서 조회 (기본값: 건강유지)
        // ※ 매퍼에 해당 메서드가 없다면 유저 정보 테이블에서 선택한 type을 가져오도록 매핑해야 합니다.
        String dietType = dietAnalysisDao.selectUserDietType(userNum);
        if (dietType == null) dietType = "건강유지";

        // 🌟 [추가] 식단 목표별 탄단지 비율 및 칼로리 보정치 설정
        double carbRatio = 0.5, proteinRatio = 0.3, fatRatio = 0.2; // 기본 5:3:2
        double calorieModifier = 1.0;

        switch (dietType) {
            case "다이어트":
                carbRatio = 0.4; proteinRatio = 0.4; fatRatio = 0.2;
                calorieModifier = 0.8; // 칼로리 20% 제한
                break;
            case "근육증가":
                carbRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
                calorieModifier = 1.2; // 벌크업을 위한 칼로리 20% 상향
                break;
            case "저탄고지":
                carbRatio = 0.2; proteinRatio = 0.3; fatRatio = 0.5;
                break;
            case "건강유지":
            default:
                carbRatio = 0.5; proteinRatio = 0.3; fatRatio = 0.2;
                break;
        }

        // 🌟 [추가] 선택된 식단 목표 유형에 맞춰 최종 권장 타겟 재계산
        int adjustedTargetKcal = (int) (safeTargetKcal * calorieModifier);
        int targetCarbs = (int) Math.round((adjustedTargetKcal * carbRatio) / 4.0);
        int targetProtein = (int) Math.round((adjustedTargetKcal * proteinRatio) / 4.0);
        int targetFat = (int) Math.round((adjustedTargetKcal * fatRatio) / 9.0);

        // 🌟 [추가] 각 권장 영양소 기준 오차율 계산 (분모가 0이 되는 현상 방지)
        double kcalError = Math.abs((double)(adjustedTargetKcal - currentKcal)) / adjustedTargetKcal * 100.0;
        double carbsError = Math.abs((double)(targetCarbs - carbs)) / Math.max(targetCarbs, 1) * 100.0;
        double proteinError = Math.abs((double)(targetProtein - protein)) / Math.max(targetProtein, 1) * 100.0;
        double fatError = Math.abs((double)(targetFat - fat)) / Math.max(targetFat, 1) * 100.0;

        // 🌟 [추가] 최종 종합 오차율 반영 (칼로리 가중치 40%, 탄단지 각각 20%씩 총 100%)
        double totalErrorRate = (kcalError * 0.4) + (carbsError * 0.2) + (proteinError * 0.2) + (fatError * 0.2);

        String grade;
        String gradeMessage;
        int earnedXp = 0;

        // AI 피드백 컴포넌트 톤앤매너와 통일성을 갖춘 부드러운 코칭 메시지 구성
        if (currentKcal == 0) {
            grade = "-"; 
            gradeMessage = "아직 오늘의 식단 기록이 없어요! 로로에게 오늘 먹은 냠냠 식단을 알려주세요 🍽️"; 
            earnedXp = 0;
        } else if (totalErrorRate <= 15) { // 탄단지 결합으로 조건이 정밀해져 컷오프를 15%로 최적화
            grade = "A"; 
            gradeMessage = "목표에 완벽하게 도달했어요! 로로가 강력 추천하는 오늘의 식단 마스터 👑"; 
            earnedXp = 50;
        } else if (totalErrorRate <= 25) {
            grade = "B"; 
            gradeMessage = "아주 훌륭해요! 탄단지 밸런스도 건강하게 맞춰가고 있어요 🌟"; 
            earnedXp = 30;
        } else if (totalErrorRate <= 35) {
            grade = "C"; 
            gradeMessage = "잘 하셨어요! 내일은 특정 영양소가 너무 한쪽으로 쏠리지 않게 해볼까요? 😊"; 
            earnedXp = 15;
        } else if (totalErrorRate <= 45) {
            grade = "D"; 
            gradeMessage = "영양 밸런스가 조금 아쉬운 하루네요! 하지만 로로가 내일도 힘껏 응원할게요 💪"; 
            earnedXp = 5;
        } else {
            grade = "F"; 
            gradeMessage = "오늘은 에너지가 넘치는 치팅데이였군요! 내일부터 다시 로로와 함께 건강하게 챙겨 먹어봐요 🌈"; 
            earnedXp = 0;
        }

        if (earnedXp > 0) {
            dietAnalysisDao.updateCharacterExp(userNum, earnedXp);
        }

        String aiFeedback = "";
        try {
            RestTemplate restTemplate = new RestTemplate();
            String pythonUrl = aiServerUrl + "/api/ai/feedback";

            Map<String, Object> requestData = new HashMap<>();
            requestData.put("userNum", userNum);
            requestData.put("grade", grade);
            requestData.put("currentKcal", currentKcal);
            requestData.put("targetKcal", adjustedTargetKcal); // 보정된 목표 칼로리 송신
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
                grade,                // grade
                gradeMessage,         // gradeMessage
                currentKcal,          // currentKcal
                adjustedTargetKcal,   // 🌟 targetKcal (유저 맞춤 동적 칼로리!)
                earnedXp,             // earnedXp
                carbs,                // currentCarbs
                protein,              // currentProtein
                fat,                  // currentFat
                sodium,               // currentSodium
                targetCarbs,          // 🌟 targetCarbs (유저 맞춤 동적 탄수화물)
                targetProtein,        // 🌟 targetProtein (유저 맞춤 동적 단백질)
                targetFat,            // 🌟 targetFat (유저 맞춤 동적 지방)
                2000,                 // 🌟 targetSodium (나트륨은 보통 2000 고정)
                aiFeedback            // aiFeedback
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
        
        Map<String, Integer> nutrients = new HashMap<>();
        nutrients.put("carbs", sumCarbs / divideDays);
        nutrients.put("protein", sumProtein / divideDays);
        nutrients.put("fat", sumFat / divideDays);
        nutrients.put("sodium", sumSodium / divideDays);
        result.put("nutrients", nutrients);

        return result;
    }
}
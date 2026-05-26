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
    public DietAnalysisResponseDto getDailyAnalysis(Long userNum, String date, String persona) {
        
        // 유저가 먹은 음식 기록 및 기본 목표 칼로리 조회
        List<MealDetailDTO> todayMeals = mealRecordDao.getTodayMealRecord(userNum.intValue(), date);
        Integer targetKcal = dietAnalysisDao.selectUserTargetKcal(userNum);
        int safeTargetKcal = (targetKcal != null && targetKcal > 0) ? targetKcal : 1800;

        int currentKcal = 0;
        int carbs = 0;
        int protein = 0;
        int fat = 0;
        int sodium = 0;

        // 먹은 음식들의 영양성분 총합 계산
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

        // 유저의 식단 목표(Type)를 DB에서 조회 (MyBatis XML에서 문자로 치환됨)
        String dietType = dietAnalysisDao.selectUserDietType(userNum);
        if (dietType == null) dietType = "건강유지";

        // 식단 목표별 탄단지 비율 및 칼로리 보정치 설정
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

        // 선택된 식단 목표 유형에 맞춰 최종 권장 타겟 동적 재계산
        int adjustedTargetKcal = (int) (safeTargetKcal * calorieModifier);
        int targetCarbs = (int) Math.round((adjustedTargetKcal * carbRatio) / 4.0);
        int targetProtein = (int) Math.round((adjustedTargetKcal * proteinRatio) / 4.0);
        int targetFat = (int) Math.round((adjustedTargetKcal * fatRatio) / 9.0);

        // 각 권장 영양소 기준 오차율 계산 (분모가 0이 되는 현상 방지)
        double kcalError = Math.abs((double)(adjustedTargetKcal - currentKcal)) / adjustedTargetKcal * 100.0;
        double carbsError = Math.abs((double)(targetCarbs - carbs)) / Math.max(targetCarbs, 1) * 100.0;
        double proteinError = Math.abs((double)(targetProtein - protein)) / Math.max(targetProtein, 1) * 100.0;
        double fatError = Math.abs((double)(targetFat - fat)) / Math.max(targetFat, 1) * 100.0;

        // 최종 종합 오차율 반영 (칼로리 가중치 40%, 탄단지 각각 20%씩 총 100%)
        double totalErrorRate = (kcalError * 0.4) + (carbsError * 0.2) + (proteinError * 0.2) + (fatError * 0.2);

        String grade;
        int earnedXp = 0;

        // 자바에서는 등급만 계산하고, UI 멘트는 파이썬 AI에게 위임합니다.
        if (currentKcal == 0) {
            grade = "-"; earnedXp = 0;
        } else if (totalErrorRate <= 15) { 
            grade = "A"; earnedXp = 50;
        } else if (totalErrorRate <= 25) {
            grade = "B"; earnedXp = 30;
        } else if (totalErrorRate <= 35) {
            grade = "C"; earnedXp = 15;
        } else if (totalErrorRate <= 45) {
            grade = "D"; earnedXp = 5;
        } else {
            grade = "F"; earnedXp = 0;
        }

        if (earnedXp > 0) {
            dietAnalysisDao.updateCharacterExp(userNum, earnedXp);
        }

        // AI로부터 받아올 변수 초기값 세팅
        String gradeMessage = "AI 코치가 총평을 작성 중입니다...";
        String aiFeedback = "식단 데이터를 정밀 분석 중입니다.";

        try {
            RestTemplate restTemplate = new RestTemplate();
            String pythonUrl = aiServerUrl + "/api/ai/feedback";

            // 파이썬 FastAPI로 전송할 상자 채우기
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("userNum", userNum);
            requestData.put("grade", grade);
            requestData.put("currentKcal", currentKcal);
            requestData.put("targetKcal", adjustedTargetKcal); 
            requestData.put("carbs", carbs);
            requestData.put("protein", protein);
            requestData.put("fat", fat);
            requestData.put("sodium", sodium);
            
            // 🌟 리액트에서 컨트롤러를 거쳐 넘어온 '리모컨 신호(페르소나)'를 실어 보냅니다!
            requestData.put("personaMode", persona); 

            @SuppressWarnings("unchecked")
            Map<String, Object> aiResponse = restTemplate.postForObject(pythonUrl, requestData, Map.class);
            
            if (aiResponse != null) {
                // AI가 실시간 창작한 페르소나 버전 1줄 타이틀
                if (aiResponse.get("gradeMessage") != null) {
                    gradeMessage = (String) aiResponse.get("gradeMessage");
                }
                // AI가 실시간 창작한 페르소나 버전 3줄 요약 피드백
                if (aiResponse.get("feedback") != null) {
                    aiFeedback = (String) aiResponse.get("feedback");
                }
            }
        } catch (Exception e) {
            System.out.println("❌ 파이썬 AI 서버 연결 실패: " + e.getMessage());
            gradeMessage = "코치 연결 실패 😥";
            aiFeedback = "1. AI 코치 서버와 연결할 수 없습니다.\n2. 파이썬 서버가 구동 중인지 확인해 주세요.";
        }

        // DTO 정의 순서에 완벽히 맞추어 프론트엔드로 리턴
        return new DietAnalysisResponseDto(
            grade, gradeMessage, currentKcal, adjustedTargetKcal, earnedXp,
            carbs, protein, fat, sodium,
            targetCarbs, targetProtein, targetFat, 2000, // 동적 목표 영양소 바인딩
            aiFeedback
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
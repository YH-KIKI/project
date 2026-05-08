package kr.hi.project.service;

import java.time.LocalDate;
import java.time.temporal.ChronoField;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.hi.project.dao.MealDao;
import kr.hi.project.domain.FoodDTO;
import kr.hi.project.domain.MealDayDTO;
import kr.hi.project.domain.MealDetailDTO;
import kr.hi.project.domain.MealLogDTO;
import kr.hi.project.domain.MealMonthDTO;
import kr.hi.project.domain.MealRecordRequestDTO;
import kr.hi.project.domain.MealWeekDTO;

@Service
public class MealService {

	@Autowired
    private MealDao mealDAO;

    @Transactional
    public void saveMealRecord(MealRecordRequestDTO request, String imageUrl) {
    	int userNum = request.getUsernum();
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        int day = now.getDayOfMonth();
        // 주차 계산 (현재 월의 몇 번째 주인지)
        int week = now.get(ChronoField.ALIGNED_WEEK_OF_MONTH);

        // 1. Month 확인/생성
        Integer mmNum = mealDAO.findMonthNum(userNum, year, month);
        if (mmNum == null) {
            MealMonthDTO mm = new MealMonthDTO();
            mm.setUser_num(userNum); mm.setMealMonthyear(year); mm.setMealMonthmonth(month);
            mealDAO.insertMonth(mm);
            mmNum = mm.getMm_num();
        }

        // 2. Week 확인/생성
        Integer mwNum = mealDAO.findWeekNum(mmNum, year, month, week);
        if (mwNum == null) {
            MealWeekDTO mw = new MealWeekDTO();
            mw.setMm_num(mmNum); mw.setMealWeekyear(year); mw.setMealWeekmonth(month); mw.setMealWeekweek(week);
            mealDAO.insertWeek(mw);
            mwNum = mw.getMw_num();
        }
    	
        // 3. Day 확인/생성
        Integer mdayNum = mealDAO.findDayNum(mwNum, day);
        if (mdayNum == null) {
            MealDayDTO md = new MealDayDTO();
            md.setMw_num(mwNum); md.setMealdayday(day);
            mealDAO.insertDay(md);
            mdayNum = md.getMday_num();
        }
        
        //meal_log 객체 만들어서 저장
        MealLogDTO log = new MealLogDTO();
        log.setFoodimage(imageUrl);
        log.setMealtype(request.getMealType().trim());
        log.setUsernum(request.getUsernum()); // React에서 받아온 user_num
        
        mealDAO.insertMealLog(log); // XML 실행 -> log객체에 생성된 mk_num이 담김

        //음식 상세 정보들 저장
        for (String foodName : request.getFoodDetails().keySet()) {
            int intakeGram = request.getFoodDetails().get(foodName); // 사용자가 입력한 g

            // DB에서 해당 음식의 영양 데이터 가져오기
            FoodDTO food = mealDAO.findFoodByName(foodName);
            
            if (food != null) {

                MealDetailDTO detail = new MealDetailDTO();
                detail.setMk_num(log.getMk_num()); // 방금 생성된 식단번호 연결
                detail.setFoodnum(food.getFoodnum()); // 음식 번호 연결
                detail.setMday_num(mdayNum);          // 오늘 하루 번호 (모두 동일하게 입력)
                detail.setMealportion(intakeGram);
                
                // 칼로리 계산 (소수점 버림 처리)
                int calculatedKcal = (int)(food.getFoodkcal() * (double) intakeGram);
                detail.setMealkcal(calculatedKcal);
                System.out.println(detail);
                mealDAO.insertMealDetail(detail);
            }
        }
        mealDAO.updateDailyKcal(mdayNum);
    }
}


package kr.hi.project.service;

import java.time.LocalDate;
import java.time.temporal.ChronoField;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.hi.project.dao.MealDao;
import kr.hi.project.dto.FoodDTO;
import kr.hi.project.dto.MealDayDTO;
import kr.hi.project.dto.MealDetailDTO;
import kr.hi.project.dto.MealLogDTO;
import kr.hi.project.dto.MealMonthDTO;
import kr.hi.project.dto.MealRecordRequestDTO;
import kr.hi.project.dto.MealWeekDTO;

@Service
public class MealService {

    @Autowired
    private MealDao mealDAO;

    @Transactional
    public void saveMealRecord(MealRecordRequestDTO request, String imageUrl) {

        int userNum = request.getUserNum();

        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        int day = now.getDayOfMonth();
        int week = now.get(ChronoField.ALIGNED_WEEK_OF_MONTH);
        String mealType = request.getMkMealType().trim();
        int count = mealDAO.checkDuplicateMeal(userNum, mealType, now);
        if (count > 0) {
            // 중복 시 예외 발생 -> Controller의 catch 블록으로 이동함
            throw new RuntimeException("이미 오늘의 " + mealType + " 식단이 등록되어 있습니다!");
        }
        
        // 1. Month 확인/생성
        Integer mmNum = mealDAO.findMonthNum(userNum, year, month);

        if (mmNum == null) {
            MealMonthDTO monthDTO = new MealMonthDTO();
            monthDTO.setUserNum(userNum);
            monthDTO.setMmYear(year);
            monthDTO.setMmMonth(month);

            mealDAO.insertMonth(monthDTO);
            mmNum = monthDTO.getMmNum();
        }

        // 2. 주간 기록 확인/생성
        Integer mwNum = mealDAO.findWeekNum(mmNum, year, month, week);

        if (mwNum == null) {
            MealWeekDTO weekDTO = new MealWeekDTO();
            weekDTO.setMmNum(mmNum);
            weekDTO.setMwYear(year);
            weekDTO.setMwMonth(month);
            weekDTO.setMwWeek(week);

            mealDAO.insertWeek(weekDTO);
            mwNum = weekDTO.getMwNum();
        }

        // 3. 일간 기록 확인/생성
        Integer mdayNum = mealDAO.findDayNum(mwNum, day);

        if (mdayNum == null) {
            MealDayDTO dayDTO = new MealDayDTO();
            dayDTO.setMwNum(mwNum);
            dayDTO.setMdDay(day);
            dayDTO.setMdayKcal(0);

            // DAO에 insertDay가 있으니까 이 이름 그대로 사용
            mealDAO.insertDay(dayDTO);

            mdayNum = dayDTO.getMdayNum();
        }
        
        //meal_log 객체 만들어서 저장
        MealLogDTO log = new MealLogDTO();
        log.setMkImage(imageUrl);
        log.setMkMealType(request.getMkMealType().trim());
        log.setUserNum(request.getUserNum()); // React에서 받아온 user_num
        
        mealDAO.insertMealLog(log); 
        //음식 상세 정보들 저장
        for (String foodName : request.getFoodDetails().keySet()) {

            int intakeGram = request.getFoodDetails().get(foodName);

            FoodDTO food = mealDAO.findFoodByName(foodName);

            if (food == null) {
                continue;
            }

            MealDetailDTO detailDTO = new MealDetailDTO();

            detailDTO.setMkNum(logDTO.getMkNum());
            detailDTO.setFoNum(food.getFoNum());

            // 중요: meal_day FK
            detailDTO.setMdayNum(mdayNum);

            // 섭취량 g
            detailDTO.setMdPortion(intakeGram);

            // 칼로리 계산
            int calculatedKcal = (int) (food.getFoKcal() * intakeGram);
            detailDTO.setMdKcal(calculatedKcal);

            mealDAO.insertMealDetail(detailDTO);
        }

        // 6. 하루 총 칼로리 업데이트
        mealDAO.updateDailyKcal(mdayNum);
    }
}
package kr.hi.project.service;

import java.time.LocalDate;
import java.time.temporal.ChronoField;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.hi.project.dao.MealRecordDao;
import kr.hi.project.dto.FoodDTO;
import kr.hi.project.dto.MealDayDTO;
import kr.hi.project.dto.MealDetailDTO;
import kr.hi.project.dto.MealLogDTO;
import kr.hi.project.dto.MealMonthDTO;
import kr.hi.project.dto.MealRecordRequestDTO;
import kr.hi.project.dto.MealWeekDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MealRecordService {

    private final MealRecordDao mealRecordDao;

    @Transactional
    public void saveMealRecord(MealRecordRequestDTO request) {

        int userNum = request.getUserNum();

        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        int day = now.getDayOfMonth();
        int week = now.get(ChronoField.ALIGNED_WEEK_OF_MONTH);

        // 1. 월간 기록 확인/생성
        Integer mmNum = mealRecordDao.findMonthNum(userNum, year, month);

        if (mmNum == null) {
            MealMonthDTO monthDTO = new MealMonthDTO();
            monthDTO.setUserNum(userNum);
            monthDTO.setMmYear(year);
            monthDTO.setMmMonth(month);

            mealRecordDao.insertMonth(monthDTO);
            mmNum = monthDTO.getMmNum();
        }

        // 2. 주간 기록 확인/생성
        Integer mwNum = mealRecordDao.findWeekNum(mmNum, year, month, week);

        if (mwNum == null) {
            MealWeekDTO weekDTO = new MealWeekDTO();
            weekDTO.setMmNum(mmNum);
            weekDTO.setMwYear(year);
            weekDTO.setMwMonth(month);
            weekDTO.setMwWeek(week);

            mealRecordDao.insertWeek(weekDTO);
            mwNum = weekDTO.getMwNum();
        }

        // 3. 일간 기록 확인/생성
        Integer mdayNum = mealRecordDao.findDayNum(mwNum, day);

        if (mdayNum == null) {
            MealDayDTO dayDTO = new MealDayDTO();
            dayDTO.setMwNum(mwNum);
            dayDTO.setMdDay(day);
            dayDTO.setMdayKcal(0);

            mealRecordDao.insertDay(dayDTO);
            mdayNum = dayDTO.getMdayNum();
        }

        // 4. meal_log 저장
        MealLogDTO mealLog = new MealLogDTO();
        mealLog.setUserNum(userNum);
        mealLog.setMkMealType(request.getMkMealType());
        mealLog.setMkImage(null);
        mealLog.setMkUserMemo(null);

        mealRecordDao.insertMealLog(mealLog);

        int mkNum = mealLog.getMkNum();

        // 5. foodDetails 반복 저장
        for (String foodName : request.getFoodDetails().keySet()) {

            int portion = request.getFoodDetails().get(foodName);

            FoodDTO food = mealRecordDao.findFoodByName(foodName);

            if (food == null) {
                throw new RuntimeException("존재하지 않는 음식입니다: " + foodName);
            }

            int calculatedKcal = Math.round(
                    food.getFoKcal() * portion / food.getFoBaseGram()
            );

            MealDetailDTO detail = new MealDetailDTO();
            detail.setMkNum(mkNum);
            detail.setFoNum(food.getFoNum());

            // 이게 빠져서 터진 거!
            detail.setMdayNum(mdayNum);

            detail.setMdPortion(portion);
            detail.setMdKcal(calculatedKcal);

            mealRecordDao.insertMealDetail(detail);
        }

        // 6. 하루 총 칼로리 업데이트
        mealRecordDao.updateDailyKcal(mdayNum);
    }
    
    public List<MealDetailDTO> getTodayMealRecord(int userNum, String date) {
        return mealRecordDao.getTodayMealRecord(userNum, date);
    }
    
    
}
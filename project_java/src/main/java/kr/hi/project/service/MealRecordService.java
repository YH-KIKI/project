package kr.hi.project.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.hi.project.dao.MealRecordDao;
import kr.hi.project.dto.FoodDTO;
import kr.hi.project.dto.MealDetailDTO;
import kr.hi.project.dto.MealLogDTO;
import kr.hi.project.dto.MealRecordRequestDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MealRecordService {

    private final MealRecordDao mealRecordDao;

    @Transactional
    public void saveMealRecord(MealRecordRequestDTO request) {

        // 1. meal_log 저장
        MealLogDTO mealLog = new MealLogDTO();
        mealLog.setUserNum(request.getUserNum());
        mealLog.setMkMealType(request.getMkMealType());
        mealLog.setMkImage(null);
        mealLog.setMkUserMemo(null);

        mealRecordDao.insertMealLog(mealLog);

        // insert 후 자동 생성된 mkNum
        int mkNum = mealLog.getMkNum();

        // 2. foodDetails 반복 저장
        for (String foodName : request.getFoodDetails().keySet()) {

            int portion = request.getFoodDetails().get(foodName);

            FoodDTO food = mealRecordDao.findFoodByName(foodName);

            if (food == null) {
                throw new RuntimeException("존재하지 않는 음식입니다: " + foodName);
            }

            // 기준중량 대비 칼로리 계산
            int calculatedKcal = Math.round(
                    food.getFoKcal() * portion / food.getFoBaseGram()
            );

            MealDetailDTO detail = new MealDetailDTO();
            detail.setMkNum(mkNum);
            detail.setFoNum(food.getFoNum());
            detail.setMdPortion(portion);
            detail.setMdKcal(calculatedKcal);

            mealRecordDao.insertMealDetail(detail);
        }
    }
}
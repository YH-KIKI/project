package kr.hi.project.service;

import java.io.File;
import java.time.LocalDate;
import java.time.temporal.ChronoField;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    
    @Value("${meal.upload.path:C:/uploads/meal/}")
    private String mealUploadPath;
    
    
    
    private String saveMealImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return null;
        }

        try {

        	String uploadDir = mealUploadPath;

            File dir = new File(uploadDir);

            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalName = file.getOriginalFilename();

            String ext =
                originalName.substring(
                    originalName.lastIndexOf(".")
                );

            String savedName =
                UUID.randomUUID() + ext;

            File saveFile =
                new File(uploadDir + savedName);

            file.transferTo(saveFile);

            return "/uploads/meal/" + savedName;

        } catch(Exception e){

            throw new RuntimeException(
                "이미지 저장 실패", e
            );
        }
    }

    @Transactional
    public void saveMealRecord(MealRecordRequestDTO request, MultipartFile mealImageFile) {

        int userNum = request.getUserNum();

        LocalDate selectedDate =
        	    request.getMkDietDate();
        int year = selectedDate.getYear();
        int month = selectedDate.getMonthValue();
        int day = selectedDate.getDayOfMonth();

        int week =
            selectedDate.get(
                ChronoField.ALIGNED_WEEK_OF_MONTH
            );

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

	     // 4. 같은 날짜 + 같은 식사타입 기존 기록 전체 삭제 후 새로 저장
	        int mkNum;
	
	        // 기존에 같은 날짜/식사타입으로 저장된 meal_log 번호들 찾기
	        List<Integer> oldMkNums = mealRecordDao.findMealLogNumsForUpdate(
	                userNum,
	                request.getMkMealType(),
	                mdayNum
	        );
	
	        // 기존 기록이 있으면 detail 먼저 삭제 후 log 삭제
	        if (oldMkNums != null && !oldMkNums.isEmpty()) {
	            mealRecordDao.deleteMealDetailsByMkNums(oldMkNums);
	            mealRecordDao.deleteMealLogsByMkNums(oldMkNums);
	        }
	
	        // 새 meal_log 생성
	        MealLogDTO mealLog = new MealLogDTO();
	        mealLog.setUserNum(userNum);
	        mealLog.setMkMealType(request.getMkMealType());
	        
	        String imagePath =
	                saveMealImage(mealImageFile);

	        mealLog.setMkImage(imagePath);
	        
	        mealLog.setMkUserMemo(request.getMkUserMemo());
	        
	        mealLog.setMkDietDate(request.getMkDietDate());
	
	        mealRecordDao.insertMealLog(mealLog);
	
	        mkNum = mealLog.getMkNum();
	        request.setMkNum(mkNum);

     // 5. 음식 상세 저장
        if (request.getAiMenuName() != null) {
            
            String foodName = request.getAiMenuName();
            FoodDTO food = mealRecordDao.findFoodByName(foodName);

            // DB에 없는 음식이면 에러 띄우지 말고 즉시 신규 등록!
            if (food == null) {
                food = new FoodDTO();
                food.setFoName(foodName);
                food.setFoBaseGram(100);
                food.setFoKcal(request.getAiKcal() != null ? request.getAiKcal().floatValue() : 0f);
                food.setFoType("AI추천");
                mealRecordDao.insertNewFood(food); 
            }

            MealDetailDTO detail = new MealDetailDTO();
            detail.setMkNum(mkNum);
            detail.setFoNum(food.getFoNum());
            detail.setMdayNum(mdayNum);
            detail.setMdPortion(100); 
            detail.setMdKcal(request.getAiKcal() != null ? request.getAiKcal() : 0);
            // 재근추가
            detail.setFoCarbs(request.getAiCarbs());
            detail.setFoProtein(request.getAiProtein());
            detail.setFoFat(request.getAiFat());
            
            mealRecordDao.insertMealDetail(detail);

        } 
        else 
	        
        if (request.getFoods() != null && !request.getFoods().isEmpty()) {

            // 새 방식: foods 배열 기반 저장
            for (MealDetailDTO food : request.getFoods()) {

                MealDetailDTO detail = new MealDetailDTO();
                detail.setMkNum(mkNum);
                detail.setFoNum(food.getFoNum());
                detail.setMdayNum(mdayNum);

                detail.setMdPortion(food.getMdPortion());
                detail.setMdKcal(food.getMdKcal());

                mealRecordDao.insertMealDetail(detail);
            }

        } else if (request.getFoodDetails() != null && !request.getFoodDetails().isEmpty()) {

            // 기존 방식: 음식명 Map 기반 저장
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
                detail.setMdayNum(mdayNum);
                detail.setMdPortion(portion);
                detail.setMdKcal(calculatedKcal);

                mealRecordDao.insertMealDetail(detail);
            }

        } else {
            throw new RuntimeException("저장할 음식 정보가 없습니다.");
        }

        // 6. 하루 총 칼로리 업데이트
        mealRecordDao.updateDailyKcal(mdayNum);
    }
    
    public List<MealDetailDTO> getTodayMealRecord(int userNum, String date) {
        return mealRecordDao.getTodayMealRecord(userNum, date);
    }

    // 날짜 불러오기
	public List<String> getRecordedDates(int userNum) {
		 return mealRecordDao.findRecordedDates(userNum);
	}
    
    
}
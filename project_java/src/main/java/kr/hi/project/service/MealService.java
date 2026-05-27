package kr.hi.project.service;

import java.io.File;
import java.time.LocalDate;
import java.time.temporal.ChronoField;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.ServletContext;
import kr.hi.project.dao.MealDao;
import kr.hi.project.dto.FailedPredictDTO;
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
    
    @Autowired
    private ServletContext servletContext;

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

            detailDTO.setMkNum(log.getMkNum());
            detailDTO.setMkMealType(log.getMkMealType());
            detailDTO.setFoNum(food.getFoNum());
            detailDTO.setFoName(food.getFoName());
            detailDTO.setFoNum(food.getFoNum());

            // 중요: meal_day FK
            detailDTO.setMdayNum(mdayNum);

            // 섭취량 g
            detailDTO.setMdPortion(intakeGram);

            // 칼로리 계산
            int calculatedKcal = (int) ((food.getFoKcal()/100) * intakeGram);
            detailDTO.setMdKcal(calculatedKcal);
            
            mealDAO.insertMealDetail(detailDTO);
        }

        // 6. 하루 총 칼로리 업데이트
        mealDAO.updateDailyKcal(mdayNum);
    }

	public void insertFailedRecord(FailedPredictDTO dto) {
		mealDAO.insertFailedRecord(dto);
		
	}
	// 사진인식하고 식단 상세 파일과 로그를 지우기
	@Value("${spring.web.resources.static-locations:uploads/}")
    private String uploadPath;

    public void cancelMealRecord(int mkNum, int mdayNum) {
        
        // 1. 🔍 DB에서 사진 주소 꺼내오기 -> 결과: "/uploads/29f98df4-046b-4823...jpg"
        String imageUrl = mealDAO.findImageUrlByMkNum(mkNum);
        
        if (imageUrl != null && !imageUrl.isEmpty()) {
            try {
                // 2. 🪓 FileService랑 똑같은 방식으로 베이스 경로를 클린하게 깎아냅니다냥!
                // file:///C:/uploads/ ➡️ /C:/uploads/ (리눅스든 윈도우든 안전하게 매핑냥)
                String cleanPath = uploadPath.replace("file:", "").replace("///", "/");
                
                // 3. ✂️ DB 주소에서 진짜 파일명만 쏙 발라내기냥!
                // "/uploads/29f98df4-...jpg" ➡️ "29f98df4-...jpg"
                String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
                
                // 4. 🧩 기준 폴더와 파일명을 결합하여 찐 물리 파일 객체 생성!
                File baseFolder = new File(cleanPath);
                File fileToDelete = new File(baseFolder, fileName);
                
                System.out.println("📂 [File-Cancel] FileService 기준 찐 삭제 조준 경로: " + fileToDelete.getAbsolutePath());

                // 5. 🔥 서버(AWS 또는 로컬 컴퓨터)에서 물리 파일 즉시 완전 소멸 실행!!!
                if (fileToDelete.exists()) {
                    boolean isDeleted = fileToDelete.delete();
                    if (isDeleted) {
                        System.out.println("🗑️ [File-Cancel] /uploads/ 폴더에서 식단 사진 완전 제거 성공 완료냥! ✨");
                    } else {
                        System.out.println("⚠️ [File-Cancel] 파일은 있는데 자바 보안 권한 때문에 못 지웠다냥.");
                    }
                } else {
                    System.out.println("🔍 [File-Cancel] 이미 지워졌거나 해당 경로에 파일이 존재하지 않는다냥. 패스냥!");
                }
                
            } catch (Exception e) {
                System.out.println("❌ 사진 물리 파일 삭제 중 예외 발생: " + e.getMessage());
            }
        }
	    // 자식 테이블(상세 내역) 먼저 삭제
	    mealDAO.deleteMealDetailByMkNum(mkNum);
	    // 부모 테이블(식단 로그) 삭제
	    mealDAO.deleteMealLogByMkNum(mkNum);
	    // 식단이 지워졌으니 오늘 총 칼로리를 다시 계산해서 업데이트
	    mealDAO.updateDailyKcal(mdayNum);

	}

}
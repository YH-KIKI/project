package kr.hi.project.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.hi.project.dao.FavoriteDao;
import kr.hi.project.dto.MealFavoritesDTO;
import kr.hi.project.dto.MealRecordRequestDTO;

@Service
public class FavoriteService {
	@Autowired
    private FavoriteDao favoriteDAO;
	@Autowired 
	private MealService mealService;

	public List<Map<String, Object>> getMealLogsWithFav(int userNum) {
		return favoriteDAO.getMealLogsWithFav(userNum);
	}

	public List<MealFavoritesDTO> getFavoriteList(int userNum) {
		return favoriteDAO.getFavoriteList(userNum);
	}

	public void addFavorite(int userNum, int mkNum) {
		favoriteDAO.addFavorite(userNum, mkNum);
	}

	public void deleteFavorite(int mfNum) {
		favoriteDAO.deleteFavorite(mfNum);
	}

	@Transactional
    public void copyFavoriteToMeal(int userNum, int oldMkNum, String newMealType) {
        // 1. 기존 식단 상세 정보들을 불러옴
        List<Map<String, Object>> details = favoriteDAO.getDetailsByMkNum(oldMkNum);
        
        // 2. MealRecordRequestDTO로 변환
        Map<String, Integer> foodDetails = new HashMap<>();
        for(Map<String, Object> d : details) {
            String foodName = (String) d.get("fo_name");
            int portion = ((Number) d.get("md_portion")).intValue();
            foodDetails.put(foodName, portion);
        }
        
        MealRecordRequestDTO request = new MealRecordRequestDTO();
        request.setUserNum(userNum);
        request.setMkMealType(newMealType);
        request.setFoodDetails(foodDetails);
        
        // 3. 사진 주소 불러오기
        String imageUrl = favoriteDAO.findImageUrlByMkNum(oldMkNum);
        
        // 4. MealService의 저장 로직 호출 
        // -> 여기서 MealService 내부의 checkDuplicateMeal 로직이 동작하여 
        //    이미 식단이 있으면 RuntimeException을 던져 컨트롤러가 잡게 됩니다냥!
        mealService.saveMealRecord(request, imageUrl);
    }

}

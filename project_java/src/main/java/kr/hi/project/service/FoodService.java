package kr.hi.project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import kr.hi.project.dao.FoodDao;
import kr.hi.project.dto.FoodDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodDao foodDao;

    public List<FoodDTO> getFoodList() {
        return foodDao.getFoodList();
    }

    public List<FoodDTO> searchFood(String keyword) {
        return foodDao.searchFood(keyword);
    }

    public FoodDTO getFoodByNum(int foNum) {
        return foodDao.getFoodByNum(foNum);
    }

	public List<FoodDTO> searchFoodByName(String foodName) {
		return foodDao.searchFoodByName(foodName);
	}
}
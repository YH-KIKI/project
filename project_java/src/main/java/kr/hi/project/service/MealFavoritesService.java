package kr.hi.project.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.hi.project.dao.MealFavoritesDao;
import kr.hi.project.dto.MealFavoritesDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MealFavoritesService {

    private final MealFavoritesDao mealFavoritesDao;

    public List<MealFavoritesDTO> getMealFavorites(int userNum) {
        return mealFavoritesDao.getMealFavorites(userNum);
    }

    @Transactional
    public void insertMealFavorite(MealFavoritesDTO dto) {
        int exists = mealFavoritesDao.existsMealFavorite(
                dto.getUserNum(),
                dto.getMkNum()
        );

        if (exists == 0) {
            mealFavoritesDao.insertMealFavorite(dto);
        }
    }

    @Transactional
    public void deleteMealFavorite(int userNum, int mfNum) {
        mealFavoritesDao.deleteMealFavorite(userNum, mfNum);
    }
}
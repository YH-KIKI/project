package kr.hi.project.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import kr.hi.project.dao.FavoriteDao;
import kr.hi.project.domain.MealFavoritesDTO;

@Service
public class FavoriteService {
	@Autowired
    private FavoriteDao favoriteDAO;

	public List<Map<String, Object>> getMealLogsWithFav(int userNum) {
		return favoriteDAO.getMealLogsWithFav(userNum);
	}

	public List<MealFavoritesDTO> getFavoriteList(int userNum) {
		return favoriteDAO.getFavoriteList(userNum);
	}

	public void addFavorite(int userNum, int mkNum) {
		favoriteDAO.addFavorite(userNum, mkNum);
	}

}

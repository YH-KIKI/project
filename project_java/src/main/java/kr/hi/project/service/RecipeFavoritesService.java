package kr.hi.project.service;

import java.util.List;

import org.springframework.stereotype.Service;

import kr.hi.project.dao.RecipeFavoritesDao;
import kr.hi.project.dto.RecipeFavoritesDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RecipeFavoritesService {

    private final RecipeFavoritesDao recipeFavoritesDao;

    public List<RecipeFavoritesDTO> getRecipeFavorites(int userNum) {
        return recipeFavoritesDao.getRecipeFavorites(userNum);
    }

    public void insertRecipeFavorite(RecipeFavoritesDTO dto) {
        recipeFavoritesDao.insertRecipeFavorite(dto);
    }

    public void deleteRecipeFavorite(int userNum, int rcpNum) {
        recipeFavoritesDao.deleteRecipeFavorite(userNum, rcpNum);
    }
}
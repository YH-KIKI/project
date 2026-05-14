package kr.hi.project.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import kr.hi.project.dao.SingleFoodFavoriteDao;
import kr.hi.project.dto.SingleFoodFavoriteDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SingleFoodFavoriteService {

    private final SingleFoodFavoriteDao singleFoodFavoriteDao;

    public List<SingleFoodFavoriteDTO> getSingleFoodFavorites(int userNum) {
        return singleFoodFavoriteDao.getSingleFoodFavorites(userNum);
    }

    @Transactional
    public void insertSingleFoodFavorite(SingleFoodFavoriteDTO dto) {
        int exists = singleFoodFavoriteDao.existsSingleFoodFavorite(
                dto.getUserNum(),
                dto.getFoNum()
        );

        if (exists == 0) {
            if (dto.getSfPortion() <= 0) {
                dto.setSfPortion(dto.getFoBaseGram() > 0 ? dto.getFoBaseGram() : 100);
            }

            singleFoodFavoriteDao.insertSingleFoodFavorite(dto);
        }
    }

    @Transactional
    public void deleteSingleFoodFavorite(int userNum, int sfNum) {
        singleFoodFavoriteDao.deleteSingleFoodFavorite(userNum, sfNum);
    }
}
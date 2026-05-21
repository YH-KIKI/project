package kr.hi.project.service;

import org.springframework.stereotype.Service;

import kr.hi.project.dao.FridgeDao;
import kr.hi.project.dto.FridgeSummaryDTO;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FridgeService {

    private final FridgeDao fridgeDao;

    public FridgeSummaryDTO getSummary(int userNum) {

        FridgeSummaryDTO dto =
                fridgeDao.getFridgeSummary(userNum);

        dto.setKcalPercent(
            calculatePercent(
                dto.getCurrentKcal(),
                dto.getTargetKcal()
            )
        );

        dto.setCarbsPercent(
            calculatePercent(
                dto.getCurrentCarbs(),
                dto.getTargetCarbs()
            )
        );

        dto.setProteinPercent(
            calculatePercent(
                dto.getCurrentProtein(),
                dto.getTargetProtein()
            )
        );

        dto.setFatPercent(
            calculatePercent(
                dto.getCurrentFat(),
                dto.getTargetFat()
            )
        );

        dto.setNatriumPercent(
            calculatePercent(
                dto.getCurrentNatrium(),
                dto.getTargetNatrium()
            )
        );

        return dto;
    }

    private int calculatePercent(
            float current,
            float target
    ) {

        if (target <= 0) return 0;

        return Math.min(
            (int)((current / target) * 100),
            100
        );
    }
}
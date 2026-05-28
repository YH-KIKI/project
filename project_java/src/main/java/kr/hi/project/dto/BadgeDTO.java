package kr.hi.project.dto;

import java.time.LocalDateTime;

public class BadgeDTO {

    private String badgeId;
    private String badgeName;
    private String badgeCategory;
    private String description;
    private int maxLevel;

    private int userNum;

    // user_badge
    private int level;
    private int progress;
    private Integer equipped;
    private LocalDateTime updatedAt;

    // badge_level
    private String requirementType;
    private int requirementValue;
    private String title;

    // frontend 계산값
    private boolean owned;
    private int nextRequirement;
    private int percent;

    public String getBadgeId() { return badgeId; }
    public void setBadgeId(String badgeId) { this.badgeId = badgeId; }

    public String getBadgeName() { return badgeName; }
    public void setBadgeName(String badgeName) { this.badgeName = badgeName; }

    public String getBadgeCategory() { return badgeCategory; }
    public void setBadgeCategory(String badgeCategory) { this.badgeCategory = badgeCategory; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getMaxLevel() { return maxLevel; }
    public void setMaxLevel(int maxLevel) { this.maxLevel = maxLevel; }

    public int getUserNum() { return userNum; }
    public void setUserNum(int userNum) { this.userNum = userNum; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }

    public Integer getEquipped() { return equipped; }
    public void setEquipped(Integer equipped) { this.equipped = equipped; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getRequirementType() { return requirementType; }
    public void setRequirementType(String requirementType) { this.requirementType = requirementType; }

    public int getRequirementValue() { return requirementValue; }
    public void setRequirementValue(int requirementValue) { this.requirementValue = requirementValue; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public boolean isOwned() { return owned; }
    public void setOwned(boolean owned) { this.owned = owned; }

    public int getNextRequirement() { return nextRequirement; }
    public void setNextRequirement(int nextRequirement) { this.nextRequirement = nextRequirement; }

    public int getPercent() { return percent; }
    public void setPercent(int percent) { this.percent = percent; }
}
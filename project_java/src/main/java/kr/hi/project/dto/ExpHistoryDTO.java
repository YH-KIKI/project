package kr.hi.project.dto;

/**
 * 성장 히스토리 정보를 담는 데이터 전송 객체 (DTO)
 */
public class ExpHistoryDTO {
    private int id;             // 고유 식별자
    private String type;        // 경험치 획득 유형 (식단 기록, 운동 등)
    private int exp;            // 획득한 경험치 양
    private String date;        // 획득 날짜
    private int currentLv;      // 당시 캐릭터 레벨
    private boolean isLevelUp;  // 레벨업 여부

    // 기본 생성자 (MyBatis 등에서 필수)
    public ExpHistoryDTO() {}

    // 모든 필드를 포함한 생성자 (선택사항)
    public ExpHistoryDTO(int id, String type, int exp, String date, int currentLv, boolean isLevelUp) {
        this.id = id;
        this.type = type;
        this.exp = exp;
        this.date = date;
        this.currentLv = currentLv;
        this.isLevelUp = isLevelUp;
    }

    // --- Getter & Setter ---

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getExp() { return exp; }
    public void setExp(int exp) { this.exp = exp; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public int getCurrentLv() { return currentLv; }
    public void setCurrentLv(int currentLv) { this.currentLv = currentLv; }

    // 🌟 불리언 타입 Getter 수정: 리액트의 'item.isLevelUp'과 일치하도록 명명
    public boolean getIsLevelUp() { return isLevelUp; }
    public void setIsLevelUp(boolean isLevelUp) { this.isLevelUp = isLevelUp; }

    // 디버깅을 위한 toString 오버라이드
    @Override
    public String toString() {
        return "ExpHistoryDTO{" +
                "id=" + id +
                ", type='" + type + '\'' +
                ", exp=" + exp +
                ", date='" + date + '\'' +
                ", currentLv=" + currentLv +
                ", isLevelUp=" + isLevelUp +
                '}';
    }
}
-- CREATE DATABASE nnp;
-- USE nnp;
-- ALTER TABLE nnp.post DROP FOREIGN KEY FK_user_TO_post;
-- DROP TABLE nnp.`user`;
CREATE TABLE `user` (
	`user_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`user_id`	varchar(50)	NOT NULL,
	`user_password`	varchar(255)	NULL,
	`user_email`	varchar(100)	NOT NULL,
	`user_name`	varchar(50)	NOT NULL,
	`user_is_social`	boolean	NOT NULL default 0
);

CREATE TABLE `food` (
	`fo_num`	int	 primary key NOT NULL AUTO_INCREMENT,
	`fo_name`	varchar(50)	NOT NULL,
	`fo_base_gram`	int	NOT NULL default 0,
	`fo_kcal`	float	NOT NULL default 0,
	`fo_carbs`	float	NOT NULL default 0,
	`fo_protein`	float	NOT NULL default 0,
	`fo_fat`	float	NOT NULL default 0,
	`fo_natrium`	float	NOT NULL default 0,
	`fo_type`	varchar(50)	NULL
);

CREATE TABLE `meal_detail` (
	`md_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`md_kcal`	int	NOT NULL default 0,
	`md_portion`	int	NOT NULL default 0,
	`md_created_at`	datetime	NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`mk_num`	int	NOT NULL,
	`fo_num`	int	NOT NULL,
	`mday_num`	int	NOT NULL
);

CREATE TABLE `singlefood_favorites` (
	`sf_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`sf_portion`	int	NOT NULL default 0,
	`fo_num`	int	NOT NULL,
	`user_num`	int	NOT NULL
);

CREATE TABLE `type_tip` (
	`nt_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`nt_type`	enum('다이어트','근육','든든하게')	NOT NULL default '든든하게',
	`nt_portion`	int	NOT NULL default 0
);

CREATE TABLE `meal_week` (
	`mw_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`mw_kcal`	int	NOT NULL default 0,
	`mw_score`	ENUM('A', 'B', 'C', 'D', 'E', 'F')	NOT NULL default 'F',
	`mw_created_at`	date	NOT NULL DEFAULT (CURRENT_DATE),
	`mw_week`	int	NOT NULL default 0,
	`mw_month`	int	NOT NULL default 0,
	`mw_year`	int	NOT NULL default 0,
	`mm_num`	int	NOT NULL
);

CREATE TABLE `chatbot_type` (
	`ct_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`ct_type`	enum('1','2','3','4')	NOT NULL default 1,
	`ct_speaking_style`	enum('비즈니스','반말','장난')	NOT NULL default '비즈니스'
);

CREATE TABLE `exp_history` (
	`eh_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`eh_exp`	int	NOT NULL default 0,
	`eh_created_at`	datetime	NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`Field`	varchar(50)	NOT NULL default '경험치얻은이유_생각중',
	`ch_num`	int	NOT NULL,
	`ed_num`	int	NOT NULL
);

CREATE TABLE `user_allergy` (
	`ua_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`user_num`	int	NOT NULL,
	`al_num`	int
);

CREATE TABLE `chat_history` (
	`ch_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`ch_historysummary`	text	NULL,
	`ch_from`	varchar(50)	NULL,
	`ch_created_at`	datetime	NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`cc_num`	int	NOT NULL
);

CREATE TABLE `allergy` (
	`al_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`al_name`	varchar(50)	NOT NULL
);

CREATE TABLE `notification` (
	`no_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`no_content`	text	NULL,
	`no_isread`	boolean	NOT NULL default 0,
	`no_created_at`	datetime	NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`user_num`	int	NOT NULL,
    `nt_num`	int	NOT NULL
);

CREATE TABLE `refrigerator` (
	`re_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`user_num`	int	NOT NULL,
	`re_name`	varchar(50)	NOT NULL default '냉장고'
);

CREATE TABLE `food_tip` (
	`ft_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`ft_meal_type`	enum('아침','점심','저녁')	NOT NULL default '아침',
	`fo_num`	int	NOT NULL,
	`nt_num`	int	NOT NULL,
	`user_num`	int	NOT NULL
);

CREATE TABLE `meal_favorites` (
	`mf_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`user_num`	int	NOT NULL,
	`mk_num`	int	NOT NULL,
	`mf_name`	varchar(50)	NOT NULL,
    `mf_created_at`	datetime	NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `mf_memo`	varchar(255) NULL
);

CREATE TABLE `refrigerator_food` (
	`rf_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`re_portion`	int	NOT NULL default 0,
	`re_num`	int	NOT NULL,
	`fo_num`	int	NOT NULL
);

CREATE TABLE `chatbot_config` (
	`cc_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`cc_botname`	varchar(50)	NOT NULL,
	`cc_temperature`	float	NOT NULL default 0 CHECK (cc_temperature >= 0 AND cc_temperature <= 1),
	`user_num`	int	NOT NULL,
	`ct_num`	int	NOT NULL
);

CREATE TABLE `exp_details` (
	`ed_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`ed_type`	ENUM('로그인', '사진분석활용', '식단평가A', '식단평가B', '식단평가C', '식단평가D', '식단평가F', '주간보상', '월간보상')	NOT NULL,
	`ed_exp`	int	NOT NULL default 0
);

CREATE TABLE `character` (
	`ch_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`ch_level`	int	NOT NULL,
	`ch_exp`	int	NOT NULL default 0,
	`ch_time`	datetime	NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`user_num`	int	NOT NULL,
	`cg_num`	int	NOT NULL
);

CREATE TABLE `character_grow` (
	`cg_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`cg_name`	varchar(50)	NOT NULL,
	`cg_img`	text	NULL,
	`he_num`	int	NOT NULL
);

CREATE TABLE `meal_log` (
	`mk_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`mk_image`	text	NULL,
	`mk_meal_type`	enum('아침','점심','저녁')	NOT NULL default '아침',
	`mk_usermemo`	text	NULL,
	`mk_created_at`	datetime	NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `mk_diet_date`	date	NOT NULL DEFAULT (CURRENT_DATE),
	`user_num`	int	NOT NULL
);

CREATE TABLE `user_privacy` (
	`user_num`	int	primary key NOT NULL,
	`up_gender`	enum('M', 'F', '?')	NOT NULL default '?',
	`up_height`	float	NULL,
	`up_weight`	float	NULL,
	`up_target_weight`	float	NULL,
	`up_daily_kcal`	int	NULL,
	`up_daily_carbs`	int	NULL,
	`up_daily_protein`	int	NULL,
	`up_daily_fat`	int	NULL,
	`up_daily_natrium`	int	NULL,
	`up_age`	int	NULL,
	`up_act`	float	NULL,
    `up_model`	enum('0', '1', '2', '3', '4')	NOT NULL default '0'
);

CREATE TABLE `weight_history` (
	`wh_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`user_num`	int	NOT NULL,
	`wh_weight`	float	NULL,
	`wh_recorded_at`	date	NOT NULL DEFAULT (CURRENT_DATE)
);

CREATE TABLE `allergy_food` (
	`af_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`fo_num`	int	NOT NULL,
	`al_num`	int	NOT NULL
);

CREATE TABLE `highest_exp` (
	`he_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`he_level`	int	UNIQUE NOT NULL,
	`he_exp`	int	NOT NULL default 0
);

CREATE TABLE `food_favorite` (
	`ff_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`ff_favorite_food`	boolean	NOT NULL default 0,
	`user_num`	int	NOT NULL,
	`fo_num`	int	NOT NULL
);

CREATE TABLE `meal_month` (
	`mm_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`mm_kcal`	int	NOT NULL default 0,
	`mm_score`	ENUM('A', 'B', 'C', 'D', 'E', 'F')	NOT NULL default 'F',
	`mm_created_at`	date	NOT NULL DEFAULT (CURRENT_DATE),
	`mm_year`	int	NOT NULL default 0,
	`mm_month`	int	NOT NULL default 0,
	`user_num`	int	NOT NULL
);

CREATE TABLE `user_social_accounts` (
	`usa_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`usa_provider`	enum('카톡')	NOT NULL,
	`usa_provider_user_id`	varchar(50)	NOT NULL,
	`user_num`	int	NOT NULL
);

CREATE TABLE `notification_type` (
	`nt_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`nt_type`	ENUM ('식단알림','추천알림','챗봇알림','시스템알림') NOT NULL,
	`nt_time`	datetime	NOT NULL
);

CREATE TABLE `meal_day` (
	`mday_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`mday_kcal`	int	NOT NULL default 0,
	`mday_score`	ENUM('A', 'B', 'C', 'D', 'E', 'F')	NOT NULL default 'F',
	`mday_review`	text	NULL,
	`mday_created_at`	date	NOT NULL DEFAULT (CURRENT_DATE),
	`md_day`	int	NOT NULL,
	`mw_num`	int	NULL
);

CREATE TABLE `body_cam` (
	`bc_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`bc_image_path`	VARCHAR(255)	NOT NULL,
	`bc_date`	DATE	NOT NULL DEFAULT (CURRENT_DATE),
	`bc_type`	ENUM('pose','outline')	NOT NULL,
	`bc_ai_result`	TEXT	NULL,
	`bc_created_at`	DATETIME	NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`user_num`	int	NOT NULL
);

ALTER TABLE body_cam MODIFY bc_ai_result LONGTEXT; ALTER TABLE body_cam MODIFY bc_type VARCHAR(20) NOT NULL;

-- 1. 게시글 테이블 (이미지 경로 컬럼 추가)
CREATE TABLE `post` (
    `post_num`          int           PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `user_num`          int           NOT NULL,
    `post_title`        varchar(255)  NOT NULL,
    `post_content`      text          NOT NULL,
    `post_img_path`     text          NULL, -- 게시글 대표 이미지 (조회 효율성 위해 추가)
    `post_views`        int           NOT NULL DEFAULT 0,
    `post_created_at`   datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `post_updated_at`   datetime      NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `FK_user_TO_post` FOREIGN KEY (`user_num`) REFERENCES `user` (`user_num`) ON DELETE CASCADE
);

-- 2. 게시글 이미지 테이블 (다중 이미지 업로드 대비용 유지)
CREATE TABLE `post_image` (
    `pi_num`        int           PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `post_num`      int           NOT NULL,
    `pi_path`       text          NOT NULL,
    `pi_created_at` datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `FK_post_TO_pi` FOREIGN KEY (`post_num`) REFERENCES `post` (`post_num`) ON DELETE CASCADE
);

-- 3. 댓글 및 대댓글 테이블
CREATE TABLE `post_comment` (
    `pc_num`        int           PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `post_num`      int           NOT NULL,
    `user_num`      int           NOT NULL,
    `pc_content`    text          NOT NULL,
    `parent_pc_num` int           NULL, -- 대댓글용 부모 번호
    `pc_created_at` datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `pc_is_deleted` boolean       NOT NULL DEFAULT 0, -- 삭제 여부 (아까 MyBatis 에러 방지용)
    CONSTRAINT `FK_post_TO_pc` FOREIGN KEY (`post_num`) REFERENCES `post` (`post_num`) ON DELETE CASCADE,
    CONSTRAINT `FK_user_TO_pc` FOREIGN KEY (`user_num`) REFERENCES `user` (`user_num`) ON DELETE CASCADE,
    CONSTRAINT `FK_pc_TO_pc` FOREIGN KEY (`parent_pc_num`) REFERENCES `post_comment` (`pc_num`) ON DELETE CASCADE
);

-- 4. 게시글 추천 테이블
CREATE TABLE `post_like` (
    `pl_num`        int           PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `post_num`      int           NOT NULL,
    `user_num`      int           NOT NULL,
    `pl_created_at` datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_user_post_like` (`user_num`, `post_num`), -- 중복 추천 방지
    CONSTRAINT `FK_post_TO_pl` FOREIGN KEY (`post_num`) REFERENCES `post` (`post_num`) ON DELETE CASCADE,
    CONSTRAINT `FK_user_TO_pl` FOREIGN KEY (`user_num`) REFERENCES `user` (`user_num`) ON DELETE CASCADE
);

-- 인증실패테이블 --
CREATE TABLE failed_predict (
    fp_num INT AUTO_INCREMENT PRIMARY KEY,
    fp_image TEXT NOT NULL,          -- 저장된 사진 경로 (/uploads/...)
    user_input_name VARCHAR(100),    -- 사용자가 직접 입력한 음식 이름 (폴더명이 될 이름)
    user_num INT,                    -- 어떤 사용자가 제보했는지
    is_learned BOOLEAN DEFAULT FALSE,-- 나중에 자동학습 완료 여부 체크용
    created_at DATETIME DEFAULT NOW(),
    FOREIGN KEY (user_num) REFERENCES user(user_num)
);

CREATE TABLE recipe (
    rcp_num INT AUTO_INCREMENT PRIMARY KEY,

    -- OpenAPI 원본 번호
    rcp_api_seq VARCHAR(30) NOT NULL UNIQUE,

    -- 기본 정보
    rcp_name VARCHAR(100) NOT NULL,
    rcp_way VARCHAR(50),
    rcp_type VARCHAR(50),

    -- 1인분 기준량
    rcp_weight VARCHAR(30),

    -- 영양 정보
    rcp_kcal DECIMAL(8,2),
    rcp_carbs DECIMAL(8,2),
    rcp_protein DECIMAL(8,2),
    rcp_fat DECIMAL(8,2),
    rcp_natrium DECIMAL(8,2),

    -- 대표 이미지
    rcp_image VARCHAR(500),

    -- 재료 전체 문자열
    rcp_parts TEXT,

    -- 생성일
    rcp_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE recipe_step (
    step_num INT AUTO_INCREMENT PRIMARY KEY,

    rcp_num INT NOT NULL,

    step_order INT NOT NULL,

    step_text TEXT NOT NULL,

    CONSTRAINT fk_recipe_step
        FOREIGN KEY (rcp_num)
        REFERENCES recipe(rcp_num)
        ON DELETE CASCADE
);

ALTER TABLE `user_privacy` ADD CONSTRAINT `FK_user_TO_user_privacy_1` FOREIGN KEY (
	`user_num`
)
REFERENCES `user` (
	`user_num`
);

ALTER TABLE `weight_history` ADD CONSTRAINT `FK_user_privacy_TO_weight_history_1` FOREIGN KEY (
	`user_num`
)
REFERENCES `user_privacy` (
	`user_num`
);


-- 1. 소셜 계정 → 사용자 연결 (어떤 사용자의 소셜 계정인가)
ALTER TABLE `user_social_accounts` ADD CONSTRAINT `FK_user_TO_usa` FOREIGN KEY (
	`user_num`
) REFERENCES `user` (`user_num`) ON DELETE CASCADE;

-- 2. 식단 상세 → 식단 로그 연결 (어떤 식사 사진/메모에 대한 상세 음식인가)
ALTER TABLE `meal_detail` ADD CONSTRAINT `FK_meal_log_TO_md` FOREIGN KEY (
	`mk_num`
) REFERENCES `meal_log` (`mk_num`) ON DELETE CASCADE;

-- 3. 식단 상세 → 음식 공공데이터 연결 (이 음식의 영양 성분 정보는 무엇인가)
ALTER TABLE `meal_detail` ADD CONSTRAINT `FK_food_TO_md` FOREIGN KEY (
	`fo_num`
) REFERENCES `food` (`fo_num`);

-- 4. 식단 상세 → 식단 하루 요약 연결 (이 상세 기록은 어느 날의 기록인가)
ALTER TABLE `meal_detail` ADD CONSTRAINT `FK_meal_day_TO_md` FOREIGN KEY (
	`mday_num`
) REFERENCES `meal_day` (`mday_num`) ON DELETE CASCADE;

-- 5. 식단 하루 요약 → 식단 주간 통계 연결
ALTER TABLE `meal_day` 
ADD CONSTRAINT `FK_meal_week_TO_meal_day` 
FOREIGN KEY (`mw_num`) REFERENCES `meal_week` (`mw_num`) 
ON DELETE SET NULL;

ALTER TABLE `meal_week` 
ADD CONSTRAINT `FK_meal_month_TO_meal_week` 
FOREIGN KEY (`mm_num`) REFERENCES `meal_month` (`mm_num`) 
ON DELETE CASCADE;

-- 6. 식단 로그 → 사용자 연결 (누가 이 식사 사진을 올렸는가)
ALTER TABLE `meal_log` ADD CONSTRAINT `FK_user_TO_meal_log` FOREIGN KEY (
	`user_num`
) REFERENCES `user` (`user_num`) ON DELETE CASCADE;

DELIMITER $$

CREATE TRIGGER after_insert_user
AFTER INSERT ON user
FOR EACH ROW
BEGIN
  INSERT INTO user_privacy (user_num)
  VALUES (NEW.user_num);

  INSERT INTO weight_history (user_num)
  VALUES (NEW.user_num);
  
  INSERT INTO user_allergy (user_num)
  VALUES (NEW.user_num);
END$$

DELIMITER ;


INSERT INTO `nnp`.`allergy` (`al_name`) VALUES ('우유류');
INSERT INTO `nnp`.`allergy` (`al_name`) VALUES ('달걀류');
INSERT INTO `nnp`.`allergy` (`al_name`) VALUES ('견과류');
INSERT INTO `nnp`.`allergy` (`al_name`) VALUES ('생선류');
INSERT INTO `nnp`.`allergy` (`al_name`) VALUES ('대두류');
INSERT INTO `nnp`.`allergy` (`al_name`) VALUES ('없음');

-- 1. 기존 데이터 초기화 (중복 방지 및 초기 세팅)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE highest_exp;
TRUNCATE TABLE exp_details;
TRUNCATE TABLE character_grow;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. 레벨별 목표 경험치 설정 (highest_exp)
INSERT INTO highest_exp (he_level, he_exp) VALUES 
(1, 0), 
(11, 2000), 
(31, 7000), 
(61, 22000), 
(91, 50000), 
(99, 60000);

-- 3. 경험치 지급 기준 설정 (exp_details)
INSERT INTO exp_details (ed_type, ed_exp) VALUES 
('식단평가A', 50),
('식단평가B', 30),
('식단평가C', 15),
('식단평가D', 5),
('식단평가F', 0),
('주간보상', 200),
('월간보상', 1000);

-- 4. 캐릭터별 성장 단계 명칭 및 이미지 (character_grow)
-- 냠냠이, 로로, 탄탄이, 꿈꿈이 각 4종 x 6단계 = 총 24개 행
INSERT INTO character_grow (cg_name, cg_img, he_num) VALUES 
-- 1. 냠냠이 시리즈 (Type 1)
('식단 병아리 냠냠이', 'nyam_lv1.png', 1),
('쑥쑥 자라요 냠냠이', 'nyam_lv2.png', 2),
('프로 식단러 냠냠이', 'nyam_lv3.png', 3),
('건강 마스터 냠냠이', 'nyam_lv4.png', 4),
('다이어트 신 냠냠이', 'nyam_lv5.png', 5),
('전설의 냠냠이', 'nyam_lv6.png', 6),

-- 2. 로로 시리즈 (Type 2)
('식단 병아리 로로', 'roro_lv1.png', 1),
('쑥쑥 자라요 로로', 'roro_lv2.png', 2),
('프로 식단러 로로', 'roro_lv3.png', 3),
('건강 마스터 로로', 'roro_lv4.png', 4),
('다이어트 신 로로', 'roro_lv5.png', 5),
('전설의 로로', 'roro_lv6.png', 6),

-- 3. 탄탄이 시리즈 (Type 3)
('식단 병아리 탄탄이', 'tan_lv1.png', 1),
('쑥쑥 자라요 탄탄이', 'tan_lv2.png', 2),
('프로 식단러 탄탄이', 'tan_lv3.png', 3),
('건강 마스터 탄탄이', 'tan_lv4.png', 4),
('다이어트 신 탄탄이', 'tan_lv5.png', 5),
('전설의 탄탄이', 'tan_lv6.png', 6),

-- 4. 꿈꿈이 시리즈 (Type 4)
('식단 병아리 꿈꿈이', 'kku_lv1.png', 1),
('쑥쑥 자라요 꿈꿈이', 'kku_lv2.png', 2),
('프로 식단러 꿈꿈이', 'kku_lv3.png', 3),
('건강 마스터 꿈꿈이', 'kku_lv4.png', 4),
('다이어트 신 꿈꿈이', 'kku_lv5.png', 5),
('전설의 꿈꿈이', 'kku_lv6.png', 6);

-- 5. 회원가입 시 캐릭터 자동 생성을 위한 트리거 갱신
DROP TRIGGER IF EXISTS after_insert_user;

DELIMITER $$

CREATE TRIGGER after_insert_user
AFTER INSERT ON user
FOR EACH ROW
BEGIN
    -- 1) 개인정보 기본행 생성
    INSERT INTO user_privacy (user_num) VALUES (NEW.user_num);

    -- 2) 체중 기록 기본행 생성
    INSERT INTO weight_history (user_num) VALUES (NEW.user_num);
    
    -- 3) 알러지 기본행 생성
    INSERT INTO user_allergy (user_num) VALUES (NEW.user_num);
    
    -- 4) 신규 유저 캐릭터 기본 생성
    -- cg_num은 1번(냠냠이 1단계)을 기본값으로 설정
    INSERT INTO `character` (ch_level, ch_exp, user_num, cg_num) 
    VALUES (1, 0, NEW.user_num, 1);
END$$

DELIMITER ;

-- 6. 기존 가입 유저 캐릭터 일괄 생성 (캐릭터 데이터가 없는 경우만)
INSERT INTO `character` (ch_level, ch_exp, user_num, cg_num)
SELECT 1, 0, user_num, 1 
FROM user 
WHERE user_num NOT IN (SELECT user_num FROM `character`);

-- mk_diet_date, mk_meal_type, user_num의 조합은 유일해야 한다
ALTER TABLE meal_log 
ADD UNIQUE KEY unique_meal_per_day (mk_diet_date, mk_meal_type, user_num);

-- 5월 14 박하님 추가 --
-- 1. exp_history 테이블 구조 개선
-- 'Field' 컬럼명을 'eh_type_name'으로 변경하고, 레벨 관련 컬럼 추가
ALTER TABLE `exp_history` 
    CHANGE COLUMN `Field` `eh_type_name` VARCHAR(50) NOT NULL DEFAULT '경험치 획득',
    ADD COLUMN `eh_current_lv` INT NOT NULL DEFAULT 1 COMMENT '획득 시점의 레벨',
    ADD COLUMN `eh_is_level_up` BOOLEAN NOT NULL DEFAULT 0 COMMENT '레벨업 여부';

-- 2. exp_details 데이터 보강 (프론트 요구사항 반영)
-- 기존 ENUM에 '게시글작성', '레벨업 달성!'이 없다면 추가가 필요합니다.
ALTER TABLE `exp_details` 
    MODIFY COLUMN `ed_type` ENUM(
        '로그인', '사진분석활용', '식단평가A', '식단평가B', 
        '식단평가C', '식단평가D', '식단평가F', '주간보상', 
        '월간보상', '게시글작성', '레벨업 달성!'
    ) NOT NULL DEFAULT '식단평가A';

-- 3. 기초 보상 데이터 삽입 및 수정
-- 이미 데이터가 있다면 중복되지 않게 주의하세요.
INSERT INTO exp_details (ed_type, ed_exp)
VALUES
    ('게시글작성', 5),
    ('레벨업 달성!', 0)
AS new
ON DUPLICATE KEY UPDATE
    ed_exp = new.ed_exp;

-- 4. (선택사항) 성능 최적화를 위한 인덱스 추가
-- 유저별로 히스토리를 조회할 때 속도가 빨라집니다.
CREATE INDEX idx_exp_history_ch_num ON exp_history(ch_num);

/* =========================================================
   1. BADGE MASTER TABLE
========================================================= */
CREATE TABLE badge (
    badge_id VARCHAR(50) PRIMARY KEY,
    badge_name VARCHAR(100) NOT NULL,
    badge_category VARCHAR(30) NOT NULL,
    description TEXT,
    max_level INT NOT NULL
);

/* =========================================================
   2. BADGE LEVEL RULE TABLE
========================================================= */
CREATE TABLE badge_level (
    badge_level_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    badge_id VARCHAR(50) NOT NULL,
    level INT NOT NULL,

    requirement_type VARCHAR(50) NOT NULL,
    requirement_value INT NOT NULL,

    title VARCHAR(100),

    CONSTRAINT fk_badge_level
    FOREIGN KEY (badge_id) REFERENCES badge(badge_id)
);

/* =========================================================
   3. USER BADGE STATE
========================================================= */
CREATE TABLE user_badge (
    user_badge_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_num INT NOT NULL,
    badge_id VARCHAR(50) NOT NULL,

    level INT DEFAULT 0,
    progress BIGINT DEFAULT 0,

    equipped BOOLEAN DEFAULT FALSE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_user_badge (user_num, badge_id)
);

/* =========================================================
   4. EVENT LOG (CONNECTS TO YOUR EXISTING SYSTEM)
========================================================= */
CREATE TABLE user_event_log (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_num INT NOT NULL,

    event_type VARCHAR(50) NOT NULL,
    event_value INT DEFAULT 1,

    event_date DATE NOT NULL DEFAULT (CURRENT_DATE),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* =========================================================
   5. BADGE MASTER DATA (YOUR SYSTEM MATCHED)
========================================================= */

INSERT INTO badge VALUES
('login_streak','연속 출석','attendance','연속 로그인 (하루라도 끊기면 리셋)',6),
('login_total','누적 출석','attendance','총 로그인 누적',5),

('meal_streak','연속 식단','meal','하루 1회 기준 연속 식단 기록',6),
('meal_total','누적 식단','meal','총 식단 기록 누적',5),

('post_total','게시글','community','게시글 작성 횟수',5),

('like_received','추천받기','community','내 글 추천 받은 횟수',5),
('like_given','추천주기','community','다른 글 추천한 횟수',5),

('pet_level','냠냠이','pet','캐릭터 성장 레벨',6),

('reward_d','식단보상D','reward','D등급 보상 획득',5),
('reward_c','식단보상C','reward','C등급 보상 획득',5),
('reward_b','식단보상B','reward','B등급 보상 획득',5),
('reward_a','식단보상A','reward','A등급 보상 획득',5);

/* =========================================================
   6. LOGIN STREAK (0 RESET SYSTEM)
========================================================= */
INSERT INTO badge_level
(
    badge_level_id,
    badge_id,
    level,
    title,
    requirement_type,
    requirement_value
)
VALUES
(NULL,'login_streak',1,'첫 출석','LOGIN_STREAK',1),
(NULL,'login_streak',2,'3일','LOGIN_STREAK',3),
(NULL,'login_streak',3,'7일','LOGIN_STREAK',7),
(NULL,'login_streak',4,'30일','LOGIN_STREAK',30),
(NULL,'login_streak',5,'100일','LOGIN_STREAK',100),
(NULL,'login_streak',6,'365일','LOGIN_STREAK',365);

/* =========================================================
   7. MEAL STREAK (DAILY ONCE ONLY RULE)
========================================================= */
INSERT INTO badge_level
(
    badge_level_id,
    badge_id,
    level,
    title,
    requirement_type,
    requirement_value
)
VALUES
(NULL,'meal_streak',1,'첫 식단','MEAL_STREAK',1),
(NULL,'meal_streak',2,'3일','MEAL_STREAK',3),
(NULL,'meal_streak',3,'7일','MEAL_STREAK',7),
(NULL,'meal_streak',4,'30일','MEAL_STREAK',30),
(NULL,'meal_streak',5,'100일','MEAL_STREAK',100),
(NULL,'meal_streak',6,'365일','MEAL_STREAK',365);

/* =========================================================
   8. LOGIN TOTAL
========================================================= */
INSERT INTO badge_level
(
    badge_level_id,
    badge_id,
    level,
    title,
    requirement_type,
    requirement_value
)
VALUES
(NULL,'login_total',1,'10일','LOGIN_TOTAL',10),
(NULL,'login_total',2,'30일','LOGIN_TOTAL',30),
(NULL,'login_total',3,'100일','LOGIN_TOTAL',100),
(NULL,'login_total',4,'200일','LOGIN_TOTAL',200),
(NULL,'login_total',5,'365일','LOGIN_TOTAL',365);

/* =========================================================
   9. MEAL TOTAL (DAILY COUNT ONLY ONCE)
========================================================= */
INSERT INTO badge_level
(
    badge_level_id,
    badge_id,
    level,
    title,
    requirement_type,
    requirement_value
)
VALUES
(NULL,'meal_total',1,'10회','MEAL_TOTAL',10),
(NULL,'meal_total',2,'30회','MEAL_TOTAL',30),
(NULL,'meal_total',3,'100회','MEAL_TOTAL',100),
(NULL,'meal_total',4,'200회','MEAL_TOTAL',200),
(NULL,'meal_total',5,'365회','MEAL_TOTAL',365);

/* =========================================================
   10. POST / COMMUNITY
========================================================= */
INSERT INTO badge_level
(
    badge_level_id,
    badge_id,
    level,
    title,
    requirement_type,
    requirement_value
)
VALUES
(NULL,'post_total',1,'1개','POST_TOTAL',1),
(NULL,'post_total',2,'10개','POST_TOTAL',10),
(NULL,'post_total',3,'50개','POST_TOTAL',50),
(NULL,'post_total',4,'100개','POST_TOTAL',100),
(NULL,'post_total',5,'300개','POST_TOTAL',300);

/* =========================================================
   11. LIKE RECEIVED (PLUS / MINUS SUPPORT)
========================================================= */
INSERT INTO badge_level
(
    badge_level_id,
    badge_id,
    level,
    title,
    requirement_type,
    requirement_value
)
VALUES
(NULL,'like_received',1,'10회','LIKE_RECEIVED',10),
(NULL,'like_received',2,'50회','LIKE_RECEIVED',50),
(NULL,'like_received',3,'100회','LIKE_RECEIVED',100),
(NULL,'like_received',4,'300회','LIKE_RECEIVED',300),
(NULL,'like_received',5,'500회','LIKE_RECEIVED',500);

/* =========================================================
   12. LIKE GIVEN
========================================================= */
INSERT INTO badge_level
(
    badge_level_id,
    badge_id,
    level,
    title,
    requirement_type,
    requirement_value
)
VALUES
(NULL,'like_given',1,'10회','LIKE_GIVEN',10),
(NULL,'like_given',2,'50회','LIKE_GIVEN',50),
(NULL,'like_given',3,'100회','LIKE_GIVEN',100),
(NULL,'like_given',4,'300회','LIKE_GIVEN',300),
(NULL,'like_given',5,'500회','LIKE_GIVEN',500);

/* =========================================================
   13. PET LEVEL (YOUR character TABLE CONNECT)
========================================================= */
INSERT INTO badge_level
(
    badge_level_id,
    badge_id,
    level,
    title,
    requirement_type,
    requirement_value
)
VALUES
(NULL,'pet_level',1,'1레벨','PET_LEVEL',1),
(NULL,'pet_level',2,'11레벨','PET_LEVEL',11),
(NULL,'pet_level',3,'31레벨','PET_LEVEL',31),
(NULL,'pet_level',4,'61레벨','PET_LEVEL',61),
(NULL,'pet_level',5,'91레벨','PET_LEVEL',91),
(NULL,'pet_level',6,'99레벨','PET_LEVEL',99);

/* =========================================================
   14. EXP / REWARD BADGES (FROM exp_history & exp_details)
========================================================= */
INSERT INTO badge_level
(
    badge_level_id,
    badge_id,
    level,
    title,
    requirement_type,
    requirement_value
)
VALUES
(NULL,'reward_d',1,'3회','REWARD_D',3),
(NULL,'reward_d',2,'10회','REWARD_D',10),
(NULL,'reward_d',3,'50회','REWARD_D',50),
(NULL,'reward_d',4,'100회','REWARD_D',100),
(NULL,'reward_d',5,'300회','REWARD_D',300),

(NULL,'reward_c',1,'3회','REWARD_C',3),
(NULL,'reward_c',2,'10회','REWARD_C',10),
(NULL,'reward_c',3,'50회','REWARD_C',50),
(NULL,'reward_c',4,'100회','REWARD_C',100),
(NULL,'reward_c',5,'300회','REWARD_C',300),

(NULL,'reward_b',1,'3회','REWARD_B',3),
(NULL,'reward_b',2,'10회','REWARD_B',10),
(NULL,'reward_b',3,'50회','REWARD_B',50),
(NULL,'reward_b',4,'100회','REWARD_B',100),
(NULL,'reward_b',5,'300회','REWARD_B',300),

(NULL,'reward_a',1,'3회','REWARD_A',3),
(NULL,'reward_a',2,'10회','REWARD_A',10),
(NULL,'reward_a',3,'50회','REWARD_A',50),
(NULL,'reward_a',4,'100회','REWARD_A',100),
(NULL,'reward_a',5,'300회','REWARD_A',300);

-- user_social_accounts 테이블의 카카오 아이디(usa_provider_user_id)에 UNIQUE 제약조건 추가
ALTER TABLE `user_social_accounts` 
ADD UNIQUE KEY `unique_kakao_user` (`usa_provider_user_id`);

INSERT INTO `yummy`.`allergy` (`al_num`, `al_name`) VALUES ('1', '우유류');
INSERT INTO `yummy`.`allergy` (`al_num`, `al_name`) VALUES ('2', '달걀류');
INSERT INTO `yummy`.`allergy` (`al_num`, `al_name`) VALUES ('3', '견과류');
INSERT INTO `yummy`.`allergy` (`al_num`, `al_name`) VALUES ('4', '생선류');
INSERT INTO `yummy`.`allergy` (`al_num`, `al_name`) VALUES ('5', '대두류');

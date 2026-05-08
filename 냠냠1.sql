-- CREATE DATABASE nnp;
-- USE nnp;

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
	`al_num`	int	NOT NULL
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
	`ft_meal_type`	enum('아침','반점심','저녁')	NOT NULL default '아침',
	`fo_num`	int	NOT NULL,
	`nt_num`	int	NOT NULL,
	`user_num`	int	NOT NULL
);

CREATE TABLE `meal_favorites` (
	`mf_num`	int	primary key NOT NULL AUTO_INCREMENT,
	`user_num`	int	NOT NULL,
	`mk_num`	int	NOT NULL,
	`mf_name`	varchar(50)	NOT NULL
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
	`ed_type`	enum('로그인','사진분석활용','식단평가A','식단평가B','식단평가C','생각중')	NOT NULL default'생각중',
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
	`mk_meal_type`	enum('아침','반점심','저녁')	NOT NULL default '아침',
	`mk_usermemo`	text	NULL,
	`mk_created_at`	datetime	NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
	`up_act`	int	NULL
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

-- 5. 식단 하루 요약 → 식단 월간 통계 연결 (이 날은 어느 달의 통계에 포함되는가)
-- 주의: 우리가 아까 논의한 대로 NULL을 허용해야 하므로 mday_num이 먼저 생성될 수 있습니다.
ALTER TABLE `meal_day` ADD CONSTRAINT `FK_meal_month_TO_mday` FOREIGN KEY (
	`mw_num` -- mw_num을 mm_num 연결용으로 쓰시거나 컬럼명을 맞춰서 연결하세요.
) REFERENCES `meal_month` (`mm_num`) ON DELETE SET NULL;

-- 6. 식단 로그 → 사용자 연결 (누가 이 식사 사진을 올렸는가)
ALTER TABLE `meal_log` ADD CONSTRAINT `FK_user_TO_meal_log` FOREIGN KEY (
	`user_num`
) REFERENCES `user` (`user_num`) ON DELETE CASCADE;




-- 1. 게시글 테이블
CREATE TABLE `post` (
    `post_num`      int           PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `user_num`      int           NOT NULL,
    `post_title`    varchar(255)  NOT NULL,
    `post_content`  text          NOT NULL,
    `post_views`    int           NOT NULL DEFAULT 0,
    `post_created_at` datetime     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `post_updated_at` datetime     NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `FK_user_TO_post` FOREIGN KEY (`user_num`) REFERENCES `user` (`user_num`) ON DELETE CASCADE
);

-- 2. 게시글 이미지 테이블 (사진 첨부)
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
    `parent_pc_num` int           NULL,
    `pc_created_at` datetime      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `pc_is_deleted` boolean       NOT NULL DEFAULT 0,
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

    UNIQUE KEY `unique_user_post_like` (`user_num`, `post_num`),
    CONSTRAINT `FK_post_TO_pl` FOREIGN KEY (`post_num`) REFERENCES `post` (`post_num`) ON DELETE CASCADE,
    CONSTRAINT `FK_user_TO_pl` FOREIGN KEY (`user_num`) REFERENCES `user` (`user_num`) ON DELETE CASCADE
);


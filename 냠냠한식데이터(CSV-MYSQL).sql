-- DELETE FROM nnp.food;
LOAD DATA INFILE 'C:/ProgramData/MySQL/MySQL Server 8.0/Uploads/food_data(1g_UTF-8).csv'
INTO TABLE nnp.food
CHARACTER SET utf8mb4 -- 파일을 메모장에서 UTF-8로 저장했으므로 이걸로 맞춰야 합니다.
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\r\n'
IGNORE 1 ROWS
(fo_name, fo_base_gram, fo_kcal, fo_carbs, fo_protein, fo_fat, fo_natrium, fo_type);
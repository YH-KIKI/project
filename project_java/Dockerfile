# -------------------------
# 1단계: Spring 빌드
# -------------------------
# 이후에 이 결과를 부를 때 사용할 이름을 AS 다음에 입력
FROM gradle:8-jdk21 AS backend-build
# WORKDIR은 부트 프로젝트 폴더
WORKDIR /project_java
COPY . .

RUN chmod +x gradlew
RUN ./gradlew build -x test --no-daemon


# -------------------------
# 2단계: 실행용 이미지
# -------------------------
FROM eclipse-temurin:21-jre
# WORKDIR은 부트 프로젝트 폴더
WORKDIR /project_java
# --from=backend-build는 위 빌드 결과
COPY --from=backend-build /project_java/build/libs/*-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m","-jar", "app.jar"]
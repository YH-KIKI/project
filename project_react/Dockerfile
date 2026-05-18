# -------------------------
# 1단계: React 빌드
# -------------------------
FROM node:18 AS frontend
# WORKDIR은 리액트 프로젝트 폴더
WORKDIR /project_react
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -------------------------
# 2단계: Nginx 실행
# -------------------------
FROM nginx:alpine
# 기본 Nginx 설정 삭제
RUN rm /etc/nginx/conf.d/default.conf
# 커스텀 Nginx 설정 복사 (아래에서 만들 파일)
COPY nginx.conf /etc/nginx/conf.d/

# 리액트 빌드 결과물을 Nginx 서빙 폴더로 복사
# 아래 --from=frontend에서 frontend는 4번째 줄 AS 뒤에 작성한 frontend와 일치시켜야 함
# /frontend/build는 리액트 프로젝트 폴더/build
# /usr/share/nginx/html는 aws 서버 폴더인데 /usr/share폴더만 있음
COPY --from=frontend /project_react/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
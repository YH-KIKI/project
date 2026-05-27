# ---------------------------------------
# 1단계: 빌드 스테이지 (무거운 컴파일 도구 포함)
# ---------------------------------------
# 🌟 파이썬 버전을 3.10으로 낮춰서 설치 에러 원천 차단!
FROM python:3.10-slim AS builder

WORKDIR /project_python

# AI 라이브러리 컴파일에 필요한 도구 설치 (최종 이미지에는 포함 안 됨)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    cmake \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# --user 옵션으로 /root/.local 에 패키지들만 깔끔하게 설치
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --user -r requirements.txt

# ---------------------------------------
# 2단계: 실행 스테이지 (가볍고 깨끗한 최종 환경)
# ---------------------------------------
# 🌟 빌드 스테이지와 파이썬 버전을 똑같이 맞춰야 합니다.
FROM python:3.10-slim

WORKDIR /project_python

# OpenCV, Mediapipe 실행에 꼭 필요한 '최소한의' 그래픽 라이브러리만 쏙쏙 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 🌟 1단계(builder)에서 설치 완료된 패키지 폴더(/root/.local)만 가져오기 (이게 경량화의 핵심!)
COPY --from=builder /root/.local /root/.local

# 파이썬이 복사해온 패키지들을 인식하도록 환경 변수 설정
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUSERBASE=/root/.local

# 내 소스 코드 복사
COPY . .

EXPOSE 8000

# 최종 서버 실행 명령어
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
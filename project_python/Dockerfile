# ---------------------------------------
# 1단계: 빌드 스테이지 (컴파일 전용)
# ---------------------------------------
FROM python:3.12-slim AS builder

WORKDIR /project_python

# 빌드에 필요한 모든 시스템 도구 설치
# cmake와 python3-dev는 chromadb 빌드에 필수
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    cmake \
    python3-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# pip 환경 최신화 및 의존성 설치(가상 환경 셋팅)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir --user -r requirements.txt

# ---------------------------------------
# 2단계: 실행 스테이지 (경량화 환경)
# ---------------------------------------
FROM python:3.12-slim
RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*
WORKDIR /project_python

# 1단계에서 설치된 패키지들을 복사 (로컬 유저 사이트 경로)
COPY --from=builder /root/.local /root/.local

# 환경 변수 설정: 복사해온 패키지들을 인식하도록 함
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUSERBASE=/root/.local

# 런타임에 필요한 최소한의 라이브러리만 설치 (예: libgomp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 소스 코드 복사
COPY . .

EXPOSE 8000

# 최종 실행 명령어
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
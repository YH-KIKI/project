import axios from 'axios';

// 요청 인터셉터: 모든 요청 헤더에 자동으로 토큰 추가
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 응답 인터셉터: 토큰 만료 감지 및 재발급 시도
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 서버에서 보낸 만료 신호 확인
        if (error.response?.headers['is-token-expired'] === 'true' && !originalRequest._retry) {
            originalRequest._retry = true; // 무한 반복 방지 플래그

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                
                // [재발급 요청] 서버로 Refresh Token 전송
                const { data } = await axios.post('/api/auth/refresh', {}, {
                    headers: { Authorization: `Bearer ${refreshToken}` }
                });

                // 새 Access Token 저장
                const newToken = data.accessToken;
                if (localStorage.getItem('login_token')) {
                    localStorage.setItem('login_token', newToken);
                } else {
                    sessionStorage.setItem('login_token', newToken);
                }

                // 원래 하려던 요청을 새 토큰으로 재시도
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);

            } catch (refreshError) {
                // Refresh Token조차 만료된 경우 (로그아웃 처리)
                alert("로그인 세션이 만료되었습니다. 다시 로그인해주세요.");
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
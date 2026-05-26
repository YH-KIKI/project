import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const KakaoCallback = () => {
    const navigate = useNavigate();
    const [needEmail, setNeedEmail] = useState(false);
    const [email, setEmail] = useState("");
    const [socialInfo, setSocialInfo] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const code = new URL(window.location.href).searchParams.get("code");
        if (code) {
            console.log("🔄 카카오 인가 코드로 백엔드 요청 중...");
            
            axios.post("/api/login/kakao", { code: code })
                .then((res) => {
                    console.log("📥 백엔드 응답 데이터 수신:", res.data);

                    if (res.data.status === "NEED_EMAIL") {
                        // 📢 이메일 입력이 필요한 신규 유저 상태
                        setNeedEmail(true);
                        setSocialInfo(res.data);
                    } else if (res.data.token) {
                        // 🎉 프리패스 로그인 성공 (기존 유저 또는 이메일 통과 유저)
                        console.log("✅ 로그인 성공! 로컬 스토리지에 토큰을 저장합니다.");
                        
                        localStorage.setItem("login_token", res.data.token);
                        localStorage.setItem("refreshToken", res.data.refreshToken);
                        localStorage.setItem("user", JSON.stringify(res.data.user));
                        
                        // 🌟 기존에 원하셨던 메인 페이지("/")로 즉시 이동합니다!
                        navigate("/"); 
                    } else {
                        console.error("❌ 응답 데이터에 토큰이 존재하지 않습니다.");
                        navigate("/login");
                    }
                })
                .catch((err) => {
                    console.error("❌ 카카오 로그인 실패 에러:", err);
                    navigate("/login");
                });
        }
    }, [navigate]);

    // 사용자가 이메일 입력 후 가입 완료 버튼 누를 때 실행되는 함수
    const handleEmailSubmit = (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email) {
            setErrorMsg("이메일을 입력해 주세요!");
            return;
        }

        axios.post("/api/login/kakao/register", {
            userId: socialInfo.userId,
            userName: socialInfo.userName,
            userEmail: email,
            kakaoId: socialInfo.kakaoId
        })
        .then((res) => {
            console.log("✅ 추가 정보 입력 후 회원가입 및 로그인 성공!");
            
            localStorage.setItem("login_token", res.data.token);
            localStorage.setItem("refreshToken", res.data.refreshToken);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            
            alert("냠냠플래닛 회원가입을 축하합니다! 🎉");
            navigate("/"); // 🌟 최종 회원가입 후에도 메인 페이지("/")로 이동합니다!
        })
        .catch((err) => {
            if (err.response && err.response.data) {
                setErrorMsg(err.response.data);
            } else {
                setErrorMsg("가입 처리 중 오류가 발생했습니다.");
            }
        });
    };

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            {!needEmail ? (
                <h2>카카오 로그인 처리 중입니다. 잠시만 기다려주세요... 🔄</h2>
            ) : (
                <div style={{ border: "1px solid #ccc", padding: "30px", display: "inline-block", borderRadius: "10px" }}>
                    <h2>🌱 냠냠플래닛 추가 정보 입력</h2>
                    <p style={{ color: "#666" }}>서비스 이용을 위해 <strong>이메일 주소</strong>를 입력해 주세요.</p>
                    
                    <form onSubmit={handleEmailSubmit}>
                        <input 
                            type="email" 
                            placeholder="example@naver.com" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: "10px", width: "250px", marginRight: "10px", borderRadius: "5px", border: "1px solid #aaa" }}
                        />
                        <button type="submit" style={{ padding: "10px 20px", background: "#ff9900", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            가입 완료
                        </button>
                    </form>
                    {errorMsg && <p style={{ color: "red", marginTop: "15px" }}>{errorMsg}</p>}
                </div>
            )}
        </div>
    );
};

export default KakaoCallback;
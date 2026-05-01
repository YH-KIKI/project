import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import axios from "axios"; 
import './App.css';
import MainLayout from "./Main/MainLayout";
import LoginPage from "./Login/LoginPage";
import SignUp from "./Login/SignUp"
import Mypage from "./Mypage/Mypage"
import Information from "./Mypage/Information"

function App() {
    const [message, setMessage] = useState(''); // 사용자가 입력할 메시지 상태
    const [file, setFile] = useState(null); // 사용자가 선택할 파일 상태
    const [str, setStr] = useState(''); // 백엔드 응답 결과 상태

    // 파일 입력 변경 핸들러
    const handleFileChange = (event) => {
        setFile(event.target.files[0]); // 첫 번째 선택된 파일을 상태에 저장
    };

    // 데이터 전송 함수
    const sendData = async () => {
        try {
            if (!file || !message) {
                alert("메시지와 파일을 모두 입력해주세요.");
                return;
            }

            // 1. 데이터를 multipart/form-data 형식으로 만들기 위해 FormData 객체 생성
            const formData = new FormData();
            // 2. 백엔드 컨트롤러의 @RequestParam 이름과 일치하도록 키 설정
            formData.append('message', message);
            formData.append('file', file);

            console.log("1. [React] 스프링부트로 보낼 준비 완료 👇");
            console.log(" - 메시지:", message);
            console.log(" - 파일명:", file.name);

            // 3. axios.post를 사용하여 백엔드 엔드포인트로 전송
            // 컨트롤러의 @RequestMapping("/api/v1/ai")와 @PostMapping("/api/detect/proxy")를 합친 경로
            const response = await axios.post('http://localhost:8080/api/v1/ai/api/detect/proxy', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data' // 파일 전송에 필수 헤더
                }
            });
            // 🌟 [추가] 6. 모든 과정을 거치고 리액트로 돌아온 최종 결과 확인
            console.log("6. [React] 스프링부트로부터 최종 결과 수신 👇");
            console.log(response.data);

            // 4. axios는 response.data 안에 결과값을 자동으로 담아줍니다.
            setStr(JSON.stringify(response.data, null, 2)); 
            console.log("백엔드 응답:", response.data);

        } catch (error) {
            // 5. 에러가 발생하면 catch 블록에서 안전하게 처리합니다.
            console.error("エ러 발생:", error);
            if (error.response) {
                // 서버가 응답을 보냈지만 2xx 범위를 벗어난 경우
                console.error("서버 응답 데이터:", error.response.data);
                setStr(`서버 에러: ${error.response.status}`);
            } else if (error.request) {
                // 요청이 만들어졌지만 응답을 받지 못한 경우 (예: 서버 다운)
                console.error("서버 응답 없음");
                setStr("서버에 연결할 수 없습니다.");
            } else {
                // 요청을 설정하는 중에 에러가 발생한 경우
                console.error("요청 설정 에러:", error.message);
                setStr("요청 전송 중 에러가 발생했습니다.");
            }
        }
    };

    return (
        <Router>
            <div className="App">
                <Routes>
            {/*메인 주소*/}
                <Route path="/" element={
                    <>
                    <MainLayout/>
                        <h1>풀스택 API 연동 테스트</h1>
                        <div style={{ marginBottom: '20px' }}>
                            <label>메시지 입력: </label>
                            <input 
                                type="text" 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                placeholder="파이썬으로 보낼 메시지"
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label>파일 선택: </label>
                            <input type="file" onChange={handleFileChange} />
                        </div>
                        <button onClick={sendData} style={{ padding: '10px 20px', cursor: 'pointer' }}>
                            서버로 전송하기
                        </button>
                        <div style={{ marginTop: '30px' }}>
                            {str && <pre>✅ 파이썬 서버에서 돌아온 최종 결과: {str}</pre>}
                        </div>
                    </>
                    }/>

                    {/*로그인 주소(/login)*/}
                    <Route path="/login" element={<LoginPage />} />
                    {/*회원가입 주소(/signup)*/}
                    <Route path="/signup" element={<SignUp />} />
                    {/*마이페이지 주소(/mypage)*/}
                    <Route path="/mypage" element={<Mypage />} />
                    {/*개인정보 주소(/information)*/}
                    <Route path="/information" element={<Information />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
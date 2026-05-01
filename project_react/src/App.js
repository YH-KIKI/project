import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

import MainLayout from "./Main/MainLayout";
import Dashboard from "./Main/Dashboard"; 
import LoginPage from "./Login/LoginPage";
import DietRecommendation from "./SidebarMenu/components/DietRecommendation"; 

import SignUp from "./Login/SignUp"
import Mypage from "./Mypage/Mypage"
import Information from "./Mypage/Information"

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    
                    {/* 🌟 배경과 사이드바가 유지되는 그룹 */}
                    <Route element={<MainLayout />}>
                        {/* 기본 화면 (대시보드) */}
                        <Route path="/" element={<Dashboard />} />
                        
                        {/* 식단 추천 화면 */}
                        <Route path="/recommend" element={<DietRecommendation />} />
                    </Route>

                    {/* 배경과 사이드바가 필요 없는 단독 화면들 */}
                    <Route path="/login" element={<LoginPage />} />
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
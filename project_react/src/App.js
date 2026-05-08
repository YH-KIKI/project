import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';

import MainLayout from "./Main/MainLayout";
import Dashboard from "./Main/Dashboard"; 
import LoginPage from "./Login/LoginPage";
import DietRecommendation from "./SidebarMenu/components/DietRecommendation"; 
import MealRecordDetail from "./SidebarMenu/components/MealRecordDetail";
import FridgeRecommendation from "./SidebarMenu/components/FridgeRecommendation";

import SignUp from "./Login/SignUp"
import Mypage from "./Mypage/Mypage"
import Information from "./Mypage/Information"
import AiAnalysis from "./SidebarMenu/components/AiAnalysis";
import Analyze from "./ImageAnalyze/Analyze"
import FavoritePage from "./SidebarMenu/components/FavoritePage";
import Stats from "./SidebarMenu/components/Stats";
import BodyCheck from "./SidebarMenu/components/BodyCheck";

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
                        {/* 식단 기록 관리 */}
                        <Route path="/record" element={<MealRecordDetail />} />
                        {/* AI 분석 페이지 */}
                        <Route path="/analyze" element={<AiAnalysis />} />
                        {/* 냉장고 추천 기능 */}
                        <Route path="/fridge-recommend" element={<FridgeRecommendation />} />
                        {/* 음식 & 식단 즐겨찾기*/}
                        <Route path="/favorite" element={<FavoritePage />} />
                        {/* 통계 페이지 */}
                        <Route path="/stats" element={<Stats />} />
                        {/* 눈바디 페이지 */}
                        <Route path="/bodycheck" element={<BodyCheck />} />
                    </Route>

                    {/* 배경과 사이드바가 필요 없는 단독 화면들 */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUp />} />
                    {/*마이페이지 주소(/mypage)*/}
                    <Route path="/mypage" element={<Mypage />} />
                    {/*개인정보 주소(/information)*/}
                    <Route path="/information" element={<Information />} />
                    {/*음식사진인식 주소(/analyze)*/}
                    <Route path="/analyze" element={<Analyze />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
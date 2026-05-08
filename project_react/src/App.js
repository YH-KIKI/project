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
import Stats from "./SidebarMenu/components/Stats";
import BodyCheck from "./SidebarMenu/components/BodyCheck";

import Community from "./community/Community" //요고 추가해따잉~
import PostWrite from "./community/PostWrite"; //요고 추가해따잉~
import PostDetail from "./community/PostDetail"; //요고 추가해따잉~

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
                        {/* 통계 페이지 */}
                        <Route path="/stats" element={<Stats />} />
                        {/* 눈바디 페이지 */}
                        <Route path="/bodycheck" element={<BodyCheck />} />
                        
                        {/* 게시판 관련 추가해쏘요*/}
                        {/* 커뮤니티 게시판 */}
                        <Route path="/community" element={<Community />} />
                        {/* 커뮤니티 글쓰기 */}
                        <Route path="/community/write" element={<PostWrite />} /> 
                        {/* 커뮤니티 게시글 상세 */}
                        <Route path="/community/post/:id" element={<PostDetail />} />
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
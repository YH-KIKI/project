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
import Favorite from "./Mypage/Favorite"
import FavoriteMeal from "./Mypage/Favorite"
import MealLogPage from "./Mypage/MealLogPage"
import AiAnalysis from "./SidebarMenu/components/AiAnalysis";
import Analyze from "./ImageAnalyze/Analyze"
import FavoritePage from "./SidebarMenu/components/FavoritePage";
import Stats from "./SidebarMenu/components/Stats";
import BodyCheck from "./SidebarMenu/components/BodyCheck";


import Community from "./community/Community"; //요고 추가해따잉~
import PostWrite from "./community/PostWrite"; //요고 추가해따잉~
import PostDetail from "./community/PostDetail"; //요고 추가해따잉~
import TargetGoals from "./Mypage/TargetGoals";
import Evaluation from "./ImageAnalyze/Evaluation";

import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('login_token') || sessionStorage.getItem('login_token');

  if (!token) {
    // 토큰 없으면 로그인창으로 쫓아내기
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* 🔓 누구나 접근 가능한 페이지 */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUp />} />

                    {/* 🔒 로그인이 필요한 페이지 그룹 */}
                    <Route element={<ProtectedRoute />}>

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
                        
                        {/* 게시판 관련 추가해쏘요*/}
                        {/* 커뮤니티 게시판 */}
                        <Route path="/community" element={<Community />} />
                        {/* 커뮤니티 글쓰기 */}
                        <Route path="/community/write" element={<PostWrite />} /> 
                        {/* 커뮤니티 게시글 상세 */}
                        <Route path="/community/post/:id" element={<PostDetail />} />

                        {/*마이페이지식단즐겨찾기 주소(/favoritemeal)*/}
                        <Route path="/favoritemeal" element={<FavoriteMeal />} />
                        {/*음식사진인식 주소(/analyze)*/}
                        <Route path="/aiphoto" element={<Analyze />} />
                        {/*음식사진인식후평가 주소(/evaluation)*/}
                        <Route path="/evaluation" element={<Evaluation />} />
                        {/*개인정보 주소(/information)*/}
                        <Route path="/information" element={<Information />} />
                        {/*마이페이지 목표보기 주소(/targetgoals)*/}
                        <Route path="/targetgoals" element={<TargetGoals />} />
                    </Route>

                    {/* 배경과 사이드바가 필요 없는 단독 화면들 */}
                    {/*마이페이지 주소(/mypage)*/}
                    <Route path="/mypage" element={<Mypage />} />
                    {/*식단기록 주소(/meallogpage)*/}
                    <Route path="/meallogpage" element={<MealLogPage />} />

                    </Route>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
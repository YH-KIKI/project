import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Main/Sidebar';
import { FiTrash2, FiPlusCircle } from "react-icons/fi"; // 아이콘 활용
import './Favorite.css';

const FavoriteMeal = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedType, setSelectedType] = useState('아침');

  const confirmCopy = async () => {
    try {
      await axios.post(`/api/meal/copy?userNum=${userNum}&oldMkNum=${selectedMeal.mkNum}&newMealType=${encodeURIComponent(selectedType)}`);
      alert(`${selectedType} 식단으로 복사 완료되었습니다!`);
      setShowModal(false);
      navigate('/');
    } catch (err) {
      // [중요] err.response.data에 백엔드의 e.getMessage()가 들어옵니다!
      const errorMessage = err.response ? err.response.data : "복사 실패!";
      alert(errorMessage); 
    }
  };

  // 검색 로직: favorites가 바뀔 때마다 필터링
  const filteredFavorites = favorites.filter(fav => 
    fav.foodListStr && fav.foodListStr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userNum = user.user_num;

  const handleDelete = async (mfNum) => {
    if (window.confirm("즐겨찾기에서 삭제하시겠습니까?")) {
      try {
        await axios.post('/api/meal/favorites/delete', { mfNum });
        setFavorites(favorites.filter(fav => fav.mfNum !== mfNum));
        alert("삭제되었습니다.");
      } catch (err) {
        alert("삭제 실패");
      }
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`/api/meal/favorites?userNum=${userNum}`);
        setFavorites(res.data);
      } catch (err) {
        console.error("즐겨찾기 로드 실패", err);
      } finally {
        setLoading(false);
      }
    };
    if (userNum) fetchFavorites();
  }, [userNum]);

  // [수정] 식단 불러오기 핸들러: 나중에 복사 모달을 띄우는 함수로 연결할 곳입니다.
  const handleLoadMeal = (meal) => {
    console.log("선택된 식단:", meal);
    // 여기서 모달을 띄우거나, 필요한 정보를 넘겨주면 됩니다.
    alert(`${meal.foodListStr} 식단을 복사하시겠습니까?`);
    setSelectedMeal(meal);
    setShowModal(true);
  };


  if (loading) return <div className="loading">데이터를 가져오는 중...</div>;

  return (
    <div className="favorite-container">
      <div className="favorite-header">
        <h2>⭐ 저장한 식단 목록</h2>
        <p>자주 먹는 식단을 한눈에 확인하고 바로 기록해보세요!</p>
      </div>

      {/* [수정] 검색바 연동 */}
      <div className="search-row">
        <input 
          placeholder="즐겨찾기 음식 검색" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
      </div>
      
      <div className="food-grid">
        {/* [수정] favorites.map 대신 filteredFavorites.map 사용 */}
        {filteredFavorites.length > 0 ? (
          filteredFavorites.map((fav) => (
            <div className="food-card" key={fav.mfNum}>
              <div className="food-img-wrap">
                {fav.mkImage ? (
                  <img src={fav.mkImage} alt="식단 사진" />
                ) : (
                  <div className="no-favorite-img">사진 없음</div>
                )}
                <button className="star-btn active">★</button>
              </div>

              <div className="food-content">
                <h3 title={fav.foodListStr}>{fav.foodListStr}</h3>
                <p>영양성분 합계</p>
                <strong>{fav.totalKcal} kcal</strong>

                <div className="food-actions">
                  <button className="pink-btn" onClick={() => handleLoadMeal(fav)}>
                    식단 불러오기
                  </button>
                  <button className="meal-delete-btn" onClick={() => handleDelete(fav.mfNum)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-message">검색 결과가 없거나 저장된 식단이 없습니다.</div>
        )}
      </div>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>언제 식단으로 복사할까요?</h3>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="아침">아침</option>
              <option value="점심">점심</option>
              <option value="저녁">저녁</option>
            </select>
            <div className="btn-group">
              <button onClick={confirmCopy}>복사 시작!</button>
              <button onClick={() => setShowModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      <button className="add-large-btn" onClick={() => navigate('/meallogpage')}>
        <FiPlusCircle style={{marginRight: '8px'}} /> 새 식단 추가하기
      </button>
    </div>
  );
};

export default FavoriteMeal;
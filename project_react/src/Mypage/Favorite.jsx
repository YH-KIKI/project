// import React, { useState, useEffect } from 'react';
// import Sidebar from '../Main/Sidebar';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const FavoriteMeal = () => {
//   const [favorites, setFavorites] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1); //현재 페이지 번호
//   const itemsPerPage = 12; //한 페이지에 보여줄 개수

//   const navigate = useNavigate();
//   const user = JSON.parse(localStorage.getItem('user') || '{}');
//   const userNum = user.user_num;

//   const handlemeallogpageClick = () => {
//     navigate('/meallogpage');
//   };

//   useEffect(() => {
//     axios.get(`/api/meal/favorites?userNum=${userNum}`)
//       .then(res => setFavorites(res.data));
//   }, [userNum]);

//   //[페이지네이션 로직]
//   //현재 페이지에 보여줄 데이터의 시작과 끝 인덱스 계산
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   //현재 페이지에 해당하는 12개 데이터만 자르기
//   const currentItems = favorites.slice(indexOfFirstItem, indexOfLastItem);
//   //총 페이지 수 계산
//   const totalPages = Math.ceil(favorites.length / itemsPerPage);

//   const styles = {
//     container: { display: 'flex', backgroundColor: '#FDF7F5', minHeight: '100vh' },
//     main: { flex: 1, padding: '30px', display: 'flex', flexDirection: 'column' },
//     header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
//     grid: { 
//       display: 'grid', 
//       gridTemplateColumns: 'repeat(4, 1fr)', 
//       gap: '20px', 
//       //flex: 1을 지우거나 대신 alignContent를 추가합니다.
//       alignContent: 'start', 
//       minHeight: '500px' // 최소 높이를 주면 버튼이 너무 위로 붙지 않아요.
//     },
//     card: { 
//       backgroundColor: '#fff', 
//       borderRadius: '25px', 
//       padding: '12px', 
//       boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
//       border: '1px solid #eee', 
//       textAlign: 'center', 
//       position: 'relative',
//       //카드가 위아래로 늘어나지 않게 높이를 고정하거나 최소화합니다.
//       height: 'fit-content' 
//     },
//     imgBox: { width: '100%', aspectRatio: '1/1', borderRadius: '20px', overflow: 'hidden', marginBottom: '10px' },
//     img: { width: '100%', height: '100%', objectFit: 'cover' },
//     foodName: { fontSize: '14px', fontWeight: 'bold', margin: '5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
//     kcal: { color: '#F48FB1', fontWeight: '800', fontSize: '18px', margin: '0' },
//     pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '30px' },
//     pageBtn: { padding: '5px 12px', borderRadius: '8px', border: '1px solid #F8BBD0', backgroundColor: '#fff', color: '#F8BBD0', cursor: 'pointer', fontWeight: 'bold' },
//     activePageBtn: { backgroundColor: '#F8BBD0', color: '#fff' },
//     navBtn: { padding: '8px 20px', backgroundColor: '#F8BBD0', border: 'none', borderRadius: '15px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-end', marginBottom: '20px' }
//   };

//   return (
// 		<div className="page-background">
//       <div className="app-wrapper">
//       <Sidebar />
//       <div style={styles.main}>
//         <div style={styles.header}>
//           <h2 style={{fontSize: '22px', fontWeight: 'bold'}}>즐겨찾기 목록</h2>
//           <button style={styles.navBtn} onClick={handlemeallogpageClick}>식단기록 보러가기</button>
//         </div>

//         {/*12개씩 보여주는 그리드 */}
//         <div style={styles.grid}>
//           {currentItems.map(fav => (
//             <div key={fav.mfNum} style={styles.card}>
//               <div style={styles.imgBox}>
//                 {fav.mkImage ? (
//                   <img src={fav.mkImage} alt="식단" style={styles.img} />
//                 ) : (
//                   <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '12px'}}>No Image</div>
//                 )}
//               </div>
//               <p style={styles.foodName}>{fav.foodListStr}</p>
//               <p style={styles.kcal}>{fav.totalKcal} <span style={{fontSize: '12px'}}>kcal</span></p>
//               <button style={{...styles.navBtn, width: '100%', marginTop: '10px', marginBottom: 0}}>식단 복사</button>
//             </div>
//           ))}
//         </div>

//         {/*페이지 번호 버튼 영역 */}
//         <div style={styles.pagination}>
//           <button 
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage(prev => prev - 1)}
//             style={styles.pageBtn}
//           >이전</button>
          
//           {[...Array(totalPages)].map((_, i) => (
//             <button 
//               key={i + 1}
//               onClick={() => setCurrentPage(i + 1)}
//               style={currentPage === i + 1 ? {...styles.pageBtn, ...styles.activePageBtn} : styles.pageBtn}
//             >
//               {i + 1}
//             </button>
//           ))}

//           <button 
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage(prev => prev + 1)}
//             style={styles.pageBtn}
//           >다음</button>
//         </div>
//       </div>
//     </div>
// 		</div>
//   );
// };

// export default FavoriteMeal;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Main/Sidebar';
import { FiTrash2, FiPlusCircle } from "react-icons/fi"; // 아이콘 활용
import './Favorite.css';

const FavoriteMeal = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 로컬스토리지에서 유저 정보 가져오기
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userNum = user.user_num;

  // 데이터 불러오기
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

  // 식단 복사(불러오기) 핸들러
  const handleLoadMeal = (meal) => {
    // 여기에 나중에 식단 기록 페이지로 데이터를 넘기는 로직을 넣으세요
    console.log("식단 불러오기:", meal);
    alert(`${meal.foodListStr} 식단을 불러옵니다!`);
  };

  if (loading) return <div className="loading">데이터를 가져오는 중...</div>;

  return (
      <div className="favorite-container">
        <div className="favorite-header">
          <h2>⭐ 저장한 식단 목록</h2>
          <p>자주 먹는 식단을 한눈에 확인하고 바로 기록해보세요!</p>
          
        </div>

        <div className="search-row">
            <input placeholder="즐겨찾기 음식 검색" />
            <button>검색</button>
        </div>
        
        {/* 식단 그리드 (FavoritePage 스타일 적용) */}
        <div className="food-grid">
          {favorites.length > 0 ? (
            favorites.map((fav) => (
              <div className="food-card" key={fav.mfNum}>
                {/* 이미지 영역 */}
                <div className="food-img-wrap">
                  {fav.mkImage ? (
                    <img src={fav.mkImage} alt="식단 사진" />
                  ) : (
                    <div className="no-favorite-img">사진 없음</div>
                  )}
                  <button className="star-btn active">★</button>
                </div>

                {/* 정보 영역 */}
                <div className="food-content">
                  <h3 title={fav.foodListStr}>{fav.foodListStr}</h3>
                  <p>영양성분 합계</p>
                  <strong>{fav.totalKcal} kcal</strong>

                  {/* 버튼 영역 */}
                  <div className="food-actions">
                    <button 
                      className="pink-btn" 
                      onClick={() => handleLoadMeal(fav)}
                    >
                      식단 불러오기
                    </button>
                    <button className="meal-delete-btn">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-message">저장된 즐겨찾기가 없습니다.</div>
          )}
        </div>

        {/* 추가 버튼 (필요 시) */}
        <button className="add-large-btn" onClick={() => navigate('/meallogpage')}>
          <FiPlusCircle style={{marginRight: '8px'}} /> 새 식단 추가하기
        </button>
      </div>
  );
};

export default FavoriteMeal;
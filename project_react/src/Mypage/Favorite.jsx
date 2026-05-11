import React, { useState, useEffect } from 'react';
import Sidebar from '../Main/Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FavoriteMeal = () => {
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); //현재 페이지 번호
  const itemsPerPage = 12; //한 페이지에 보여줄 개수

  const navigate = useNavigate();
  const userNum = localStorage.getItem('user_num');

  const handlemeallogpageClick = () => {
    navigate('/meallogpage');
  };

  useEffect(() => {
    axios.get(`/api/meal/favorites?userNum=${userNum}`)
      .then(res => setFavorites(res.data));
  }, [userNum]);

  //[페이지네이션 로직]
  //현재 페이지에 보여줄 데이터의 시작과 끝 인덱스 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  //현재 페이지에 해당하는 12개 데이터만 자르기
  const currentItems = favorites.slice(indexOfFirstItem, indexOfLastItem);
  //총 페이지 수 계산
  const totalPages = Math.ceil(favorites.length / itemsPerPage);

  const styles = {
    container: { display: 'flex', backgroundColor: '#FDF7F5', minHeight: '100vh' },
    main: { flex: 1, padding: '30px', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    grid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '20px', 
      //flex: 1을 지우거나 대신 alignContent를 추가합니다.
      alignContent: 'start', 
      minHeight: '500px' // 최소 높이를 주면 버튼이 너무 위로 붙지 않아요.
    },
    card: { 
      backgroundColor: '#fff', 
      borderRadius: '25px', 
      padding: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
      border: '1px solid #eee', 
      textAlign: 'center', 
      position: 'relative',
      //카드가 위아래로 늘어나지 않게 높이를 고정하거나 최소화합니다.
      height: 'fit-content' 
    },
    imgBox: { width: '100%', aspectRatio: '1/1', borderRadius: '20px', overflow: 'hidden', marginBottom: '10px' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    foodName: { fontSize: '14px', fontWeight: 'bold', margin: '5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    kcal: { color: '#F48FB1', fontWeight: '800', fontSize: '18px', margin: '0' },
    pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '30px' },
    pageBtn: { padding: '5px 12px', borderRadius: '8px', border: '1px solid #F8BBD0', backgroundColor: '#fff', color: '#F8BBD0', cursor: 'pointer', fontWeight: 'bold' },
    activePageBtn: { backgroundColor: '#F8BBD0', color: '#fff' },
    navBtn: { padding: '8px 20px', backgroundColor: '#F8BBD0', border: 'none', borderRadius: '15px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-end', marginBottom: '20px' }
  };

  return (
		<div className="page-background">
      <div className="app-wrapper">
      <Sidebar />
      <div style={styles.main}>
        <div style={styles.header}>
          <h2 style={{fontSize: '22px', fontWeight: 'bold'}}>즐겨찾기 목록</h2>
          <button style={styles.navBtn} onClick={handlemeallogpageClick}>식단기록 보러가기</button>
        </div>

        {/*12개씩 보여주는 그리드 */}
        <div style={styles.grid}>
          {currentItems.map(fav => (
            <div key={fav.Mf_num} style={styles.card}>
              <div style={styles.imgBox}>
                {fav.Mk_image ? (
                  <img src={fav.Mk_image} alt="식단" style={styles.img} />
                ) : (
                  <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '12px'}}>No Image</div>
                )}
              </div>
              <p style={styles.foodName}>{fav.FoodListStr}</p>
              <p style={styles.kcal}>{fav.TotalKcal} <span style={{fontSize: '12px'}}>kcal</span></p>
              <button style={{...styles.navBtn, width: '100%', marginTop: '10px', marginBottom: 0}}>식단 복사</button>
            </div>
          ))}
        </div>

        {/*페이지 번호 버튼 영역 */}
        <div style={styles.pagination}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            style={styles.pageBtn}
          >이전</button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={currentPage === i + 1 ? {...styles.pageBtn, ...styles.activePageBtn} : styles.pageBtn}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={styles.pageBtn}
          >다음</button>
        </div>
      </div>
    </div>
		</div>
  );
};

export default FavoriteMeal;
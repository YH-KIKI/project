import React, { useState, useEffect } from 'react';
import Sidebar from '../Main/Sidebar';
import axios from 'axios';

	const MealLogPage = () => {
		const [logs, setLogs] = useState([]);

		//Application 탭에 있는 'user_num'이라는 키값으로 가져오기
	const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userNum = user.user_num;

	useEffect(() => {
			axios.get(`/api/meal/logs?userNum=${userNum}`)
				.then(res => {
					console.log("실제 넘어온 데이터 1개:", res.data[0]); 
					setLogs(res.data);
				});
	}, [userNum]);

		const toggleFavorite = (mkNum) => {
			axios.post('/api/meal/favorites', { userNum, mkNum })
				.then(() => {
					alert("즐겨찾기에 추가되었습니다!");
					// 목록 새로고침 (별표 표시 업데이트를 위해)
					window.location.reload();
				});
		};

  useEffect(() => {
    axios.get(`/api/meal/logs?userNum=${userNum}`)
      .then(res => setLogs(res.data.slice(0, 12)));
  }, [userNum]);

  // 내부 스타일 정의
  const styles = {
    container: { display: 'flex', backgroundColor: '#FDF7F5', minHeight: '100vh' },
    main: { flex: 1, overflow: 'hidden' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    grid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(4, 1fr)', 
      gap: '15px', 
      overflowY: 'auto', 
      maxHeight: 'calc(100vh - 150px)',
      paddingRight: '10px'
    },
    card: { 
      backgroundColor: '#fff', 
      borderRadius: '25px', 
      padding: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #eee',
      textAlign: 'center',
      position: 'relative'
    },
    imgBox: { width: '100%', aspectRatio: '1/1', borderRadius: '20px', overflow: 'hidden', marginBottom: '10px' },
    img: { width: '100%', height: '100%', objectCover: 'cover' },
    foodName: { fontSize: '14px', fontWeight: 'bold', margin: '5px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    kcal: { color: '#F48FB1', fontWeight: '800', fontSize: '18px', margin: '0' },
    date: { fontSize: '10px', color: '#aaa', marginTop: '5px' },
    btn: { width: '100%', padding: '8px', backgroundColor: '#F8BBD0', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }
  };

  return (
      <div style={styles.main}>
        <div style={styles.header}>
          <h2 style={{fontSize: '22px', fontWeight: 'bold'}}>요즘의 식단 기록</h2>
        </div>

        <div style={styles.grid}>
          {logs.map(log => (
            <div key={log.mk_num} style={styles.card}>
              <div style={{position: 'absolute', top: '15px', right: '15px', color: log.isFav > 0 ? '#FFD700' : '#ddd'}}>★</div>
              <div style={styles.imgBox}>
                {log.Mk_image ? (
                  <img src={log.Mk_image} alt="식단" style={styles.img} />
                ) : (
                  <div style={{display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '12px'}}>No Image</div>
                )}
              </div>
              <p style={styles.foodName}>{log.foods}</p>
              <p style={styles.kcal}>{log.totalKcal} <span style={{fontSize: '12px'}}>kcal</span></p>
              <p style={styles.date}>{log.mk_date} {log.mk_time}</p>
              <button style={styles.btn} onClick={() => toggleFavorite(log.mk_num)}>즐겨찾기 추가</button>
            </div>
          ))}
        </div>
      </div>
  );
};

export default MealLogPage;

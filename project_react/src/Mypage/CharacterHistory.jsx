import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CharacterHistory.css';

// 부모 컴포넌트(CharacterInfo)로부터 userNum을 props로 받습니다.
const CharacterHistory = ({ isOpen, onClose, userNum }) => {
  const [historyData, setHistoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async (page) => {
    // userNum이 없으면 요청을 보내지 않습니다.
    if (!userNum) return;

    setIsLoading(true);
    try {
      let token = localStorage.getItem('login_token') || localStorage.getItem('token');

      if (!token) {
        const userData = localStorage.getItem('user');
        if (userData) {
          try {
            const parsed = JSON.parse(userData);
            token = parsed.token || (parsed.user && parsed.user.token);
          } catch (e) {
            console.error("유저 정보 파싱 실패:", e);
          }
        }
      }

      const response = await axios.get(
        'http://localhost:8080/api/history/list',
        {
          // params에 userNum을 추가하여 해당 유저의 데이터임을 명시합니다.
          params: { 
            page: page,
            userNum: userNum 
          },
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );

      if (response.data) {
        setHistoryData(response.data.history || []);
        setTotalPages(response.data.totalPages || 1);
      }

    } catch (error) {
      console.error("성장 히스토리를 불러오는 데 실패했습니다:", error);
      setHistoryData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userNum) {
      setCurrentPage(1);
      fetchHistory(1);
    }
  }, [isOpen, userNum]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchHistory(pageNumber);
  };

  if (!isOpen) return null;

  return (
    <div className="char-modal-overlay" onClick={onClose}>
      <div className="char-modal-content reward-modal-width history-modal-min-height" onClick={(e) => e.stopPropagation()}>
        <div className="char-modal-header">
          <h3>📜 성장 히스토리</h3>
          <button className="char-close-x" onClick={onClose}>&times;</button>
        </div>

        <div className="char-modal-body">
          {isLoading ? (
            <div className="history-empty-state"><p>데이터를 불러오는 중...</p></div>
          ) : historyData && historyData.length > 0 ? (
            <>
              <div className="history-list-container">
                {historyData.map((item, index) => (
                  <div key={item.id || index} className={`history-card ${item.isLevelUp ? 'level-up-card' : ''}`}>
                    <div className="history-info-group">
                      <div className="history-header-row">
                        <span className="history-label">{item.type}</span>
                        <span className="history-current-lv">Lv.{item.currentLv}</span>
                      </div>
                      <span className="history-timestamp">{item.date}</span>
                    </div>

                    <div className="history-point-group">
                      {item.isLevelUp ? (
                        <span className="level-up-badge">LEVEL UP!</span>
                      ) : (
                        <>
                          <span className="history-plus">+</span>
                          <span className="history-exp-val">{item.exp}</span>
                          <span className="history-unit">XP</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="history-pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                  &lt;
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={currentPage === i + 1 ? 'active' : ''}
                  >
                    {i + 1}
                  </button>
                ))}

                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                  &gt;
                </button>
              </div>
            </>
          ) : (
            <div className="history-empty-state">
              <div className="empty-icon">🌱</div>
              <p>최근 성장 내역이 없습니다.</p>
              <p className="history-sub-text">식단을 기록하고 경험치를 획득해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterHistory;
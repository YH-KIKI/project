import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './CharacterHistory.css';

// 부모 컴포넌트(CharacterInfo)로부터 userNum을 props로 받습니다.
const CharacterHistory = ({ isOpen, onClose, userNum }) => {
  const [historyData, setHistoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async (page) => {
    // 🚀 [보정] 부모가 준 userNum이 비어있다면 localStorage에서 안전하게 백업 추출합니다.
    let activeUserNum = userNum;

    if (!activeUserNum) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          activeUserNum = parsed.userNum || parsed.user_num || (parsed.user && (parsed.user.userNum || parsed.user.user_num));
        } catch (e) {
          console.error("유저 데이터 파싱 실패:", e);
        }
      }
    }

    // 최종 유저 번호조차 없으면 요청을 보내지 않습니다.
    if (!activeUserNum) return;

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

      // 🚀 [해결 방법] 로컬(localhost)과 배포(54.116.167.5) 환경 모두 유연하게 대응하기 위해
      // 브라우저가 현재 접속 중인 도메인명(window.location.hostname)을 실시간으로 감지하여 포트 8080에 바인딩합니다.
      const currentHost = window.location.hostname;
      const apiBaseUrl = `http://${currentHost}:8080`;

      const response = await axios.get(
        `${apiBaseUrl}/api/history/list`,
        {
          // params에 확실하게 확인된 유저 고유 번호를 전송합니다.
          params: { 
            page: page,
            userNum: Number(activeUserNum) 
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
  }, [userNum]); // 의존성 고정

  // 🚀 [규칙 준수] Hooks 규칙을 위반하지 않도록 고정된 크기의 의존성 배열 유지
  useEffect(() => {
    if (isOpen) {
      fetchHistory(currentPage);
    }
  }, [isOpen, currentPage, fetchHistory]);

  // 모달이 완전히 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
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
                {historyData.map((item, index) => {
                  // 🚀 [필드명 유연성 대응] DB 호환용 (isLevelUp 혹은 is_level_up 둘 다 판정 가능하게 보완)
                  const rawLevelUp = item.isLevelUp !== undefined ? item.isLevelUp : item.is_level_up;
                  const isLevelUpFlag = Number(rawLevelUp) === 1;
                  
                  const displayLv = item.currentLv !== undefined ? item.currentLv : item.current_lv;
                  const displayExp = item.exp !== undefined ? item.exp : item.experience;

                  return (
                    <div key={item.id || index} className={`history-card ${isLevelUpFlag ? 'level-up-card' : ''}`}>
                      <div className="history-info-group">
                        <div className="history-header-row">
                          <span className="history-label">{item.type}</span>
                          <span className="history-current-lv">Lv.{displayLv}</span>
                        </div>
                        <span className="history-timestamp">{item.date}</span>
                      </div>

                      <div className="history-point-group">
                        {isLevelUpFlag ? (
                          <span className="level-up-badge">LEVEL UP!</span>
                        ) : (
                          <>
                            <span className="history-plus">+</span>
                            <span className="history-exp-val">{displayExp}</span>
                            <span className="history-unit">XP</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 🚀 CSS 파일 클래스명(.page-arrow, .page-num) 완벽 일치화 */}
              <div className="history-pagination">
                <button 
                  className="page-arrow" 
                  onClick={() => paginate(currentPage - 1)} 
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`page-num ${currentPage === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button 
                  className="page-arrow" 
                  onClick={() => paginate(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                >
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
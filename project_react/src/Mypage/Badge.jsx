import { useState, useMemo } from 'react';
import './Badge.css';

const Badge = ({ isOpen, onClose }) => {
  // =========================
  // 50개 뱃지 자동 생성 설정
  // =========================
  const baseBadgeConfig = [
    {
      badgeId: 'login_streak',
      name: '연속 출석',
      category: 'attendance_streak',
      max: 365,
      steps: [1, 3, 7, 30, 100, 365],
      description: '매일 로그인하면 연속 출석이 증가합니다.'
    },
    {
      badgeId: 'login_total',
      name: '누적 출석',
      category: 'attendance_total',
      max: 365,
      steps: [10, 30, 100, 200, 365],
      description: '로그인한 총 일수입니다.'
    },
    {
      badgeId: 'meal_streak',
      name: '연속 식단',
      category: 'meal_streak',
      max: 365,
      steps: [1, 3, 7, 30, 100, 365],
      description: '하루 1회 식단 기록 기준 연속 기록입니다.'
    },
    {
      badgeId: 'meal_total',
      name: '누적 식단',
      category: 'meal_total',
      max: 365,
      steps: [10, 30, 100, 200, 365],
      description: '총 식단 기록 횟수입니다.'
    },
    {
      badgeId: 'post_total',
      name: '게시글',
      category: 'post',
      max: 300,
      steps: [1, 10, 50, 100, 300],
      description: '게시글 작성 횟수입니다.'
    },
    {
      badgeId: 'like_received',
      name: '추천받기',
      category: 'like_received',
      max: 500,
      steps: [10, 50, 100, 300, 500],
      description: '내 게시글이 받은 추천 수입니다.'
    },
    {
      badgeId: 'like_given',
      name: '추천주기',
      category: 'like_given',
      max: 500,
      steps: [10, 50, 100, 300, 500],
      description: '다른 글에 추천한 횟수입니다.'
    },
    {
      badgeId: 'pet_level',
      name: '냠냠이',
      category: 'pet',
      max: 99,
      steps: [1, 11, 31, 61, 91, 99],
      description: '캐릭터 성장 레벨입니다.'
    },
    {
      badgeId: 'reward_d',
      name: '식단보상 D',
      category: 'reward_d',
      max: 300,
      steps: [3, 10, 50, 100, 300],
      description: 'D등급 보상 횟수'
    },
    {
      badgeId: 'reward_c',
      name: '식단보상 C',
      category: 'reward_c',
      max: 300,
      steps: [3, 10, 50, 100, 300],
      description: 'C등급 보상 횟수'
    }
  ];

  // =========================
  // MOCK USER STATE (API로 교체 예정)
  // =========================
  const [userState, setUserState] = useState({
    loginStreak: 5,
    loginTotal: 42,
    mealStreak: 2,
    mealTotal: 18,
    postTotal: 3,
    likeReceived: 12,
    likeGiven: 20,
    petLevel: 31,
    rewardD: 7,
    rewardC: 2
  });

  const [selectedBadge, setSelectedBadge] = useState(null);
  const [equippedBadgeId, setEquippedBadgeId] = useState('login_streak');

  // =========================
  // 50개 뱃지 생성 (조건문보다 무조건 위에 선언되어야 함)
  // =========================
  const badges = useMemo(() => {
    const list = [];

    baseBadgeConfig.forEach((b) => {
      b.steps.forEach((step, idx) => {
        const progressMap = {
          login_streak: userState.loginStreak,
          login_total: userState.loginTotal,
          meal_streak: userState.mealStreak,
          meal_total: userState.mealTotal,
          post_total: userState.postTotal,
          like_received: userState.likeReceived,
          like_given: userState.likeGiven,
          pet_level: userState.petLevel,
          reward_d: userState.rewardD,
          reward_c: userState.rewardC
        };

        const current = progressMap[b.badgeId];
        const isOwned = current >= step;

        list.push({
          badgeId: `${b.badgeId}_${idx}`,
          parentId: b.badgeId,
          name: `${b.name} Lv.${idx + 1}`,
          level: idx + 1,
          maxLevel: b.steps.length,
          requirement: step,
          progress: current,
          isOwned,
          equipped: `${b.badgeId}_${idx}` === equippedBadgeId,
          description: b.description
        });
      });
    });

    return list;
  }, [userState, equippedBadgeId]);

  // 중요: 모든 Hook(useState, useMemo) 선언이 끝난 뒤 조건부 렌더링을 처리해야 에러가 발생하지 않습니다.
  if (!isOpen) return null;

  // =========================
  // UTIL
  // =========================
  const ownedCount = badges.filter(b => b.isOwned).length;

  const getProgressPercent = (p, t) =>
    t ? Math.min((p / t) * 100, 100) : 0;

  const handleEquip = (id) => {
    setEquippedBadgeId(id);
    
    // 대표 뱃지 변경 시 하단 상세 패널 데이터도 즉시 리렌더링 반영
    setSelectedBadge(prev => prev ? { ...prev, equipped: prev.badgeId === id } : null);
  };

  return (
    <div className="badge-modal-overlay" onClick={onClose}>
      <div className="badge-modal-content" onClick={(e) => e.stopPropagation()}>

        <button className="badge-modal-close" onClick={onClose}>×</button>

        <div className="badge-modal-header">
          <h2>🏅 뱃지 도감</h2>
          <div>획득 {ownedCount} / {badges.length}</div>
        </div>

        <div className="badge-modal-body">

          <div className="badge-grid">

            {badges.map((badge) => {
              const percent = getProgressPercent(badge.progress, badge.requirement);

              return (
                <div
                  key={badge.badgeId}
                  className={`badge-card ${badge.isOwned ? 'owned' : 'locked'} ${badge.badgeId === selectedBadge?.badgeId ? 'active' : ''}`}
                  onClick={() => setSelectedBadge(badge)}
                >

                  <div className="badge-icon">
                    {badge.isOwned ? '🏅' : '🔒'}
                  </div>

                  <div className="badge-name">{badge.name}</div>

                  <div className="badge-level">
                    Lv.{badge.level}/{badge.maxLevel}
                  </div>

                  {badge.isOwned ? (
                    <div className="badge-progress-bar">
                      <div
                        className="badge-progress-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  ) : (
                    <div className="badge-locked-text">
                      필요: {badge.requirement}
                    </div>
                  )}

                  {badge.equipped && (
                    <div className="badge-equipped">⭐ 대표</div>
                  )}
                </div>
              );
            })}

          </div>

          {selectedBadge && (
            <div className="badge-detail-panel">

              <h3>{selectedBadge.name}</h3>
              <p>{selectedBadge.description}</p>

              <p>
                진행: {selectedBadge.progress} / {selectedBadge.requirement}
              </p>

              {selectedBadge.isOwned && (
                <button
                  className="equip-btn"
                  disabled={selectedBadge.badgeId === equippedBadgeId}
                  onClick={() => handleEquip(selectedBadge.badgeId)}
                >
                  {selectedBadge.badgeId === equippedBadgeId ? '⭐ 장착됨' : '대표 뱃지 설정'}
                </button>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Badge;

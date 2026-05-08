import React, { useState, useEffect, useRef } from 'react';
import './Community.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Community = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('제목');
  const dropdownRef = useRef(null);

  const [keyword, setKeyword] = useState('');
  const [activeSearch, setActiveSearch] = useState({ category: 'title', keyword: '' });

  const categories = [
    { id: 'title', label: '제목' },
    { id: 'title_content', label: '제목+내용' },
    { id: 'author', label: '작성자' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/community/posts`, {
          params: {
            page: currentPage,
            category: activeSearch.category,
            keyword: activeSearch.keyword
          }
        });
        setPosts(response.data.posts);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류가 발생했습니다:", error);
      }
    };

    fetchPosts();
  }, [currentPage, activeSearch]);

  const handleSearch = () => {
    const selectedCat = categories.find(c => c.label === searchCategory);
    
    setActiveSearch({
      category: selectedCat ? selectedCat.id : 'title',
      keyword: keyword
    });
    setCurrentPage(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const ymd = date.toLocaleDateString('ko-KR').replace(/\. /g, '.').replace(/\.$/, '');
    const hm = date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${ymd} ${hm}`;
  };

  const handleWriteClick = () => {
    const userData = localStorage.getItem('user');
    let userNum = null;

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        userNum = parsedUser.user_num || parsedUser.userNum;
      } catch (e) {
        console.error("로컬스토리지 파싱 에러:", e);
      }
    }

    if (!userNum) {
        userNum = localStorage.getItem('user_num') || localStorage.getItem('userNum');
    }
    
    if (!userNum) {
      if (window.confirm('로그인이 필요한 서비스입니다. 로그인 하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
    navigate('/community/write');
  };

  const pageGroupSize = 5;
  const currentGroup = Math.ceil(currentPage / pageGroupSize);
  const startPage = (currentGroup - 1) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="community-container">
      <header className="community-header">
        <h2 className="community-title">커뮤니티 💬</h2>
      </header>

      <div className="post-list">
        {posts.map(post => (
          <div key={post.post_num} className="post-card" onClick={() => navigate('/community/post/' + post.post_num)}>
            <div className="post-info">
              <h3>
                {post.post_num}. {post.post_title}
                {(post.post_img_path || (post.post_content && post.post_content.includes('<img'))) && (
                  <span className="image-icon"> 🖼️</span>
                )}
              </h3>
              <div className="post-meta">
                <span className="author-name">{post.user_name}</span>
                <span className="post-date">{formatDate(post.post_created_at)}</span>
              </div>
            </div>
            <div className="post-stats">
              <span className="stat-item stat-views">👁️ {post.post_views}</span>
              <span className="stat-item stat-like">❤️ {post.like_count}</span>
              <span className="stat-item stat-comment">💬 {post.comment_count}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button 
          className="page-arrow" 
          disabled={startPage === 1}
          onClick={() => setCurrentPage(startPage - 1)}
        >‹</button>

        {pageNumbers.map(pageNum => (
          <button 
            key={pageNum} 
            className={`page-num ${currentPage === pageNum ? 'active' : ''}`}
            onClick={() => setCurrentPage(pageNum)}
          >
            {pageNum}
          </button>
        ))}

        <button 
          className="page-arrow"
          disabled={endPage === totalPages}
          onClick={() => setCurrentPage(endPage + 1)}
        >›</button>
      </div>

      <footer className="community-footer">
        <div className="search-area">
          <div className="search-spacer"></div>

          <div className="custom-select" ref={dropdownRef}>
            <div 
              className={`select-header ${isDropdownOpen ? 'active' : ''}`} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{searchCategory}</span>
              <span className={`arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
            </div>
            {isDropdownOpen && (
              <ul className="select-options">
                {categories.map((cat) => (
                  <li 
                    key={cat.id} 
                    onClick={() => {
                      setSearchCategory(cat.label);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {cat.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="search-box">
            <input 
              type="text" 
              placeholder="검색어 입력" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <span className="search-icon" onClick={handleSearch}>🔍</span>
          </div>

          <div className="search-spacer"></div>
        </div>

        <button className="write-btn" onClick={handleWriteClick}>글쓰기</button>
      </footer>
    </div>
  );
};

export default Community;
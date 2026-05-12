import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import './PostWrite.css';
import axios from 'axios';

const PostWrite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const quillRef = useRef(null);
  const editPost = location.state?.post;

  const [title, setTitle] = useState(editPost ? editPost.postTitle : '');
  const [content, setContent] = useState(editPost ? editPost.postContent : '');
  const [attachedFileNames, setAttachedFileNames] = useState([]);

  useEffect(() => {
    const imgCount = (content.match(/<img/g) || []).length;
    if (imgCount === 0) {
      setAttachedFileNames([]);
    } else if (imgCount < attachedFileNames.length) {
      setAttachedFileNames(prev => prev.slice(0, imgCount));
    }
  }, [content, attachedFileNames.length]);

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        // [수정] 업로드 엔드포인트 유지
        const response = await axios.post('http://localhost:8080/api/community/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // [수정] 백엔드 리턴값(전체 URL)을 이미지 주소로 사용
        const imageUrl = response.data;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        
        quill.insertEmbed(range ? range.index : quill.getLength(), 'image', imageUrl);
        quill.setSelection((range ? range.index : quill.getLength()) + 1);

        setAttachedFileNames(prev => [...prev, file.name]);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드 중 오류가 발생했습니다.");
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['image', 'link'], 
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  }), [imageHandler]);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post('http://localhost:8080/api/community/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        const imageUrl = response.data;
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection();
        const insertIdx = range ? range.index : quill.getLength();
        
        quill.insertEmbed(insertIdx, 'image', imageUrl);
        quill.setSelection(insertIdx + 1);

        setAttachedFileNames(prev => [...prev, file.name]);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }
    
    const doc = new DOMParser().parseFromString(content, 'text/html');
    const firstImg = doc.querySelector('img');
    let firstImgPath = "";
    
    if (firstImg) {
        const fullSrc = firstImg.getAttribute('src');
        // [수정] /upload/ 와 /uploads/ 둘 다 대응할 수 있도록 수정
        const parts = fullSrc.split('/');
        firstImgPath = parts[parts.length - 1];
    }

    const userData = localStorage.getItem('user');
    let userNum = 0;

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        userNum = Number(parsedUser.userNum || parsedUser.user_num || 0);
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error);
      }
    }

    if (userNum === 0) {
        alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
        return;
    }

    const postData = {
      postNum: editPost ? Number(editPost.postNum) : 0, 
      userNum: userNum,
      postTitle: title,
      postContent: content,
      postImgPath: firstImgPath, 
      postImgPos: firstImgPath ? "top" : "none" 
    };

    try {
      let response;
      if (editPost) {
        response = await axios.put('http://localhost:8080/api/community/update', postData);
      } else {
        response = await axios.post('http://localhost:8080/api/community/write', postData);
      }
      
      if (response.data === "success" || response.status === 200) {
        alert(editPost ? '게시글이 수정되었습니다!' : '게시글이 등록되었습니다!');
        navigate('/community');
      }
    } catch (error) {
      console.error("처리 중 오류:", error);
      alert('처리에 실패했습니다.');
    }
  };

  return (
    <div className="post-write-container">
      <header className="post-write-header">
        <button className="back-btn" type="button" onClick={() => navigate(-1)}>‹</button>
        <h2 className="post-write-title">{editPost ? '글 수정하기 📝' : '새 글 쓰기 ✍️'}</h2>
      </header>

      <form className="post-write-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            className="write-title-input"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="input-group" style={{ marginBottom: '50px' }}>
          <ReactQuill 
            ref={quillRef}
            theme="snow" 
            value={content} 
            onChange={setContent} 
            modules={modules}
            style={{ height: '400px' }}
            placeholder="자유로운 대화를 할 수 있는 커뮤니티 입니다!"
          />
        </div>

        <div className="file-upload-area">
          <label htmlFor="file-input" className="file-label" style={{ cursor: 'pointer', display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', padding: '10px' }}>
            <span className="file-icon">📷</span>
            <span style={{ fontSize: '13px', marginLeft: '10px' }}>
              {attachedFileNames.length > 0 
                ? attachedFileNames.join(', ') 
                : '사진 첨부하기'}
            </span>
            <input 
              id="file-input" 
              type="file" 
              multiple 
              style={{ display: 'none' }} 
              onChange={handleFileChange} 
              accept="image/*" 
            />
          </label>
        </div>

        <div className="write-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>취소</button>
          <button type="submit" className="submit-btn">{editPost ? '수정완료' : '등록하기'}</button>
        </div>
      </form>
    </div>
  );
};

export default PostWrite;
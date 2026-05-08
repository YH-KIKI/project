import React, { useState, useMemo, useRef, useEffect } from 'react';
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

  const [title, setTitle] = useState(editPost ? editPost.post_title : '');
  const [content, setContent] = useState(editPost ? editPost.post_content : '');
  const [attachedFileNames, setAttachedFileNames] = useState([]);

  useEffect(() => {
    const imgCount = (content.match(/<img/g) || []).length;
    if (imgCount === 0) {
      setAttachedFileNames([]);
    } else if (imgCount < attachedFileNames.length) {
      setAttachedFileNames(prev => prev.slice(0, imgCount));
    }
  }, [content, attachedFileNames.length]);

  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['image', 'link'], 
      ['clean']
    ],
  }), []);

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

        const editor = quillRef.current.getEditor();
        const range = editor.getSelection();
        const insertIdx = range ? range.index : editor.getLength();
        
        editor.insertEmbed(insertIdx, 'image', imageUrl);
        editor.setSelection(insertIdx + 1);

        setAttachedFileNames(prev => [...prev, file.name]);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드 중 오류가 발생했습니다.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const userData = localStorage.getItem('user');
    let userNum = null;

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        userNum = parsedUser.user_num;
      } catch (error) {
        console.error("사용자 정보 파싱 오류:", error);
      }
    }

    const postData = {
      post_num: editPost ? editPost.post_num : null,
      user_num: userNum,
      post_title: title,
      post_content: content
    };

    try {
      let response;
      if (editPost) {
        response = await axios.put('http://localhost:8080/api/community/update', postData);
      } else {
        response = await axios.post('http://localhost:8080/api/community/write', postData);
      }
      
      if (response.data === "success") {
        alert(editPost ? '게시글이 수정되었습니다!' : '게시글이 등록되었습니다!');
        navigate('/community');
      }
    } catch (error) {
      console.error("게시글 처리 중 오류가 발생했습니다:", error);
      alert('처리에 실패했습니다. 서버 상태를 확인해주세요.');
    }
  };

  return (
    <div className="post-write-container">
      <header className="post-write-header">
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
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

        <div className="file-upload-area" style={{ cursor: 'pointer', minHeight: '60px' }}>
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
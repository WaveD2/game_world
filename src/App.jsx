import React, { useState, useRef, useEffect } from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import { Play, Pause, Check, X, RotateCcw, Lightbulb } from 'lucide-react';
import { questions } from './data';
import './App.css';

const CELL_SIZE = 42; 
const CELL_GAP = 8;
const UNIT_WIDTH = CELL_SIZE + CELL_GAP;

function App() {
  const [activeQ, setActiveQ] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    return () => { audioRef.current.pause(); };
  }, []);

  const handleOpen = (q) => {
    audioRef.current.pause();
    setIsPlaying(false);
    setShowHint(false);
    
    setActiveQ(q);
    audioRef.current.src = q.audioUrl;
    
    audioRef.current.load();
  };

  const handleClose = () => {
    audioRef.current.pause();
    setIsPlaying(false);
    setShowHint(false);
    setActiveQ(null);
  };

  const togglePlay = async () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error("Chi tiết lỗi Audio:", err);
        handleAudioError(err);
      }
    }
  };

  const handleReplay = async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        handleAudioError(err);
      }
    }
  };

  const handleSolve = () => {
    if (activeQ && !solvedIds.includes(activeQ.id)) {
      setSolvedIds(prev => [...prev, activeQ.id]);
    }
  };

  const handleAudioError = (err) => {
    if (err.name === "NotSupportedError") {
      alert("Lỗi: Đường dẫn nhạc bị hỏng hoặc định dạng không hỗ trợ!");
    } else if (err.name === "NotAllowedError") {
      alert("Lỗi: Trình duyệt chặn tự phát nhạc. Hãy tương tác với trang web trước!");
    } else {
      alert("Không thể phát nhạc: " + err.message);
    }
  };

  return (
    <div className="game-container">
      <motion.div className="title-box" initial={{ y: -50 }} animate={{ y: 0 }}>
        <h1>GIAI ĐIỆU THÂN QUEN 🎶</h1>
      </motion.div>

      <div className="board-wrapper">
        <div className="grid-board">
          {questions.map((q) => (
            <div key={q.id} className="row-container">
              
              <div className="question-col">
                <button 
                  className={`question-btn ${solvedIds.includes(q.id) ? 'solved' : ''}`}
                  onClick={() => handleOpen(q)}
                >
                  {q.id}
                </button>
              </div>

              <div 
                className="cells-row"
                style={{ 
                  marginLeft: `${q.offset * UNIT_WIDTH}px` 
                }}
              >
                {q.answer.split('').map((char, idx) => (
                  <motion.div 
                    key={idx}
                    className={`cell ${idx === q.keyPosition ? 'key-cell' : ''}`}
                    initial={{ rotateX: 0 }}
                    animate={{ 
                      rotateX: solvedIds.includes(q.id) ? 360 : 0,
                      backgroundColor: idx === q.keyPosition
                        ? '#e74c3c'
                        : solvedIds.includes(q.id)
                          ? '#ffe66d'
                          : '#fff',
                      color: solvedIds.includes(q.id) 
                        ? (idx === q.keyPosition ? '#fff' : '#2d3436')
                        : 'transparent'
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                  >
                    {char}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeQ && (
          <div className="modal-overlay" onClick={handleClose}>
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* <button 
                className="close-btn"
                onClick={handleClose}
              >
                <X size={20} style={{color: 'red'}}/>
              </button> */}

              <h2>Câu {activeQ.id}</h2>
              
              {showHint && (
                <div className="hint-box">
                  <p>"{activeQ.hint}"</p>
                </div>
              )}
              
              {solvedIds.includes(activeQ.id) && (
                <div className="answer-box">
                  <h3>{activeQ.displayAnswer}</h3>
                </div>
              )}
              
              <div className="controls">
                <button className="btn btn-play" onClick={togglePlay}>
                  {isPlaying ? <Pause size={16}/> : <Play size={16}/>} 
                  <span>{isPlaying ? "Dừng" : "Phát"}</span>
                </button>

                <button className="btn btn-replay" onClick={handleReplay}>
                  <RotateCcw size={16}/> 
                  <span>Lại</span>
                </button>

                <button className="btn btn-hint" onClick={() => setShowHint(!showHint)}>
                  <Lightbulb size={16}/> 
                  <span>{showHint ? 'Ẩn' : 'Gợi ý'}</span>
                </button>
                
                <button className="btn btn-solve" onClick={handleSolve}>
                  <Check size={16}/> 
                  <span>Đáp án</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
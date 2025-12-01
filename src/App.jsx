import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Play, Pause, Check, X, RotateCcw } from 'lucide-react';
import { questions } from './data';
import './App.css';

const CELL_SIZE = 42; 
const CELL_GAP = 8;
const UNIT_WIDTH = CELL_SIZE + CELL_GAP;

function App() {
  const [activeQ, setActiveQ] = useState(null);
  const [solvedIds, setSolvedIds] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    return () => { audioRef.current.pause(); };
  }, []);

  const handleOpen = (q) => {
    audioRef.current.pause();
    setIsPlaying(false);
    
    setActiveQ(q);
    audioRef.current.src = q.audioUrl;
    
    audioRef.current.load();
  };

  const handleClose = () => {
    audioRef.current.pause();
    setIsPlaying(false);
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
        <h1>Ô CHỮ BÍ MẬT 🐞</h1>
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
                    className="cell"
                    initial={{ rotateX: 0 }}
                    animate={{ 
                      rotateX: solvedIds.includes(q.id) ? 360 : 0,
                      backgroundColor: solvedIds.includes(q.id) ? '#ffd700' : '#fff',
                      color: solvedIds.includes(q.id) ? '#2c2c2c' : 'transparent'
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
              <button 
                style={{position:'absolute', top:10, right:10, border:'none', background:'transparent', fontSize: 20, cursor:'pointer'}} 
                onClick={handleClose}
              >
                <X />
              </button>

              <h2 style={{color:'#e57e65'}}>Câu {activeQ.id}</h2>
              <p style={{color:'#e57e65'}}>"{activeQ.hint}"</p>
              
              <div className="controls">
                <button className="btn" onClick={togglePlay} style={{background:'#ffd700'}}>
                   {isPlaying ? <Pause size={18}/> : <Play size={18}/>} 
                   {isPlaying ? "Dừng" : "Phát"}
                </button>

                <button className="btn" onClick={handleReplay} style={{background:'#81d4fa'}}>
                   <RotateCcw size={18}/> Lại
                </button>

                <button className="btn" onClick={handleSolve} style={{background:'#e57e65', color:'white'}}>
                   <Check size={18}/> Đáp án
                </button>
              </div>
              
              {solvedIds.includes(activeQ.id) && (
                 <h3 style={{color:'#e57e65', marginTop: 15}}>{activeQ.displayAnswer}</h3>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
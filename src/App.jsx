import React, { useState, useEffect } from 'react';

const DIRECTIONS = {
  N: { label: 'N', dx: 0, dy: -1, rotate: 0 },
  NE: { label: 'NE', dx: 1, dy: -1, rotate: 45 },
  E: { label: 'E', dx: 1, dy: 0, rotate: 90 },
  SE: { label: 'SE', dx: 1, dy: 1, rotate: 135 },
  S: { label: 'S', dx: 0, dy: 1, rotate: 180 },
  SW: { label: 'SW', dx: -1, dy: 1, rotate: 225 },
  W: { label: 'W', dx: -1, dy: 0, rotate: 270 },
  NW: { label: 'NW', dx: -1, dy: -1, rotate: 315 },
};

const GRID_SIZE = 6;

const App = () => {
  // Game State
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('empty'))); // 'empty', 'dandelion', 'filled'
  const [usedDirections, setUsedDirections] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(1); // 1 (Place Dandelion) or 2 (Choose Wind)
  const [dandelionPos, setDandelionPos] = useState(null); // {x, y}
  const [winner, setWinner] = useState(null);
  const [log, setLog] = useState(["Welcome to Dandelion! Player 1, place your flower."]);
  const [history, setHistory] = useState([]);

  // Helper to check if a cell is valid
  const isValid = (x, y) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;

  // Save current state to history
  const saveState = () => {
    const currentState = {
      grid: grid.map(row => [...row]),
      usedDirections: [...usedDirections],
      currentPlayer,
      dandelionPos: dandelionPos ? { ...dandelionPos } : null,
      winner,
      log: [...log]
    };
    setHistory(prev => [...prev, currentState]);
  };

  // Undo last move
  const handleUndo = () => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);

    setGrid(previousState.grid);
    setUsedDirections(previousState.usedDirections);
    setCurrentPlayer(previousState.currentPlayer);
    setDandelionPos(previousState.dandelionPos);
    setWinner(previousState.winner);
    setLog(previousState.log);
    setHistory(newHistory);
    addLog("Undoing last move...");
  };

  // Player 1 Action: Place Dandelion
  const handleCellClick = (x, y) => {
    if (winner || currentPlayer !== 1) return;

    if (grid[y][x] !== 'empty') {
      addLog("Cell is occupied! Choose an empty spot.");
      return;
    }

    saveState(); // Save before mutating

    const newGrid = [...grid.map(row => [...row])];
    newGrid[y][x] = 'dandelion';
    setGrid(newGrid);
    setDandelionPos({ x, y });
    setCurrentPlayer(2);
    addLog(`Player 1 placed Dandelion at (${x + 1}, ${y + 1}). Player 2, choose wind direction!`);
  };

  // Player 2 Action: Choose Direction
  const handleDirectionClick = (dirKey) => {
    if (winner || currentPlayer !== 2) return;
    if (usedDirections.includes(dirKey)) return;

    saveState(); // Save before mutating

    const dir = DIRECTIONS[dirKey];
    const newGrid = [...grid.map(row => [...row])];

    // Apply wind from ALL dandelions
    let filledCount = 0;

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (newGrid[y][x] === 'dandelion') {
          let cx = x + dir.dx;
          let cy = y + dir.dy;

          while (isValid(cx, cy)) {
            if (newGrid[cy][cx] === 'empty') {
              newGrid[cy][cx] = 'filled';
              filledCount++;
            }
            cx += dir.dx;
            cy += dir.dy;
          }
        }
      }
    }

    setGrid(newGrid);
    setUsedDirections([...usedDirections, dirKey]);

    const nextDirs = usedDirections.length + 1;
    addLog(`Wind blew ${dirKey}! Filled ${filledCount} cells.`);

    if (nextDirs === 8) {
      checkWinner(newGrid);
    } else {
      setCurrentPlayer(1);
      setDandelionPos(null); // Reset Dandelion for next placement
      addLog("Player 1, place a new Dandelion.");
    }
  };

  const checkWinner = (finalGrid) => {
    let emptyCount = 0;
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (finalGrid[y][x] === 'empty') emptyCount++;
      }
    }

    if (emptyCount === 0) {
      setWinner("Player 1 (The Planter)");
      addLog("GAME OVER: Perfect Board! Player 1 Wins!");
    } else {
      setWinner("Player 2 (The Wind)");
      addLog(`GAME OVER: ${emptyCount} cells remain empty. Player 2 Wins!`);
    }
  };

  const addLog = (msg) => {
    setLog(prev => [msg, ...prev].slice(0, 5));
  };

  const restartGame = () => {
    setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill('empty')));
    setUsedDirections([]);
    setCurrentPlayer(1);
    setDandelionPos(null);
    setWinner(null);
    setLog(["Game Restarted. Player 1's turn."]);
    setHistory([]); // Clear history on restart
  };

  return (
    <div className="game-container">
      {/* Container Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4rem',
        maxWidth: '1200px',
        width: '100%',
        padding: '2rem',
        background: 'var(--color-glass)',
        backdropFilter: 'blur(16px)',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-glass)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>

        {/* Left Side: Player 1 Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 style={{
            color: currentPlayer === 1 ? 'var(--color-dandelion)' : 'rgba(255,255,255,0.5)',
            textShadow: currentPlayer === 1 ? '0 0 20px var(--color-dandelion)' : 'none',
            transition: 'all 0.3s'
          }}>
            Player 1: The Field
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: '8px',
            padding: '16px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px'
          }}>
            {grid.map((row, y) => (
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  onClick={() => handleCellClick(x, y)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    background: cell === 'dandelion' ? 'var(--color-dandelion)' :
                      'var(--color-cell-empty)',
                    cursor: (currentPlayer === 1 && cell === 'empty') ? 'pointer' : 'default',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '24px',
                    transition: 'all 0.3s ease',
                    boxShadow: cell === 'dandelion' ? '0 0 15px var(--color-dandelion)' : 'none',
                    transform: (currentPlayer === 1 && cell === 'empty') ? 'scale(1)' : 'scale(1)',
                  }}
                  className={cell !== 'empty' ? 'cell-anim' : ''}
                  onMouseEnter={(e) => {
                    if (currentPlayer === 1 && cell === 'empty') {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (cell === 'empty') {
                      e.currentTarget.style.background = 'var(--color-cell-empty)';
                    }
                  }}
                >
                  {cell === 'dandelion' && <span className="dandelion-anim" style={{ color: '#333' }}>✳️</span>}
                  {cell === 'filled' && <span style={{ color: 'var(--color-cell-filled)', fontSize: '50px', lineHeight: '10px' }}>•</span>}
                </div>
              ))
            ))}
          </div>

          <div style={{ marginTop: '20px', height: '100px', width: '100%', color: '#aaa', fontSize: '0.9rem', textAlign: 'center' }}>
            {log.map((l, i) => <div key={i} style={{ opacity: 1 - i * 0.2, margin: '4px 0' }}>{l}</div>)}
          </div>
        </div>

        {/* Right Side: Player 2 Compass */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <h2 style={{
            color: currentPlayer === 2 ? 'var(--color-cell-filled)' : 'rgba(255,255,255,0.5)',
            textShadow: currentPlayer === 2 ? '0 0 20px var(--color-cell-filled)' : 'none',
            transition: 'all 0.3s'
          }}>
            Player 2: The Wind
          </h2>

          <div style={{
            position: 'relative',
            width: '300px',
            height: '300px',
            marginTop: '40px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0) 70%)',
            border: '2px solid rgba(255,255,255,0.05)'
          }}>
            {/* Center Pivot */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '20px', height: '20px', background: '#fff', borderRadius: '50%', opacity: 0.2
            }} />

            {Object.entries(DIRECTIONS).map(([key, data]) => {
              const isUsed = usedDirections.includes(key);
              const radius = 110;
              // Math to position buttons in circle
              // key order in object isn't guaranteed, but map iterates. 
              // We have explicit rotate degrees.
              const rad = (data.rotate - 90) * (Math.PI / 180);
              const top = 150 + Math.sin(rad) * radius;
              const left = 150 + Math.cos(rad) * radius;

              return (
                <button
                  key={key}
                  onClick={() => handleDirectionClick(key)}
                  disabled={isUsed || currentPlayer !== 2}
                  style={{
                    position: 'absolute',
                    top: `${top}px`,
                    left: `${left}px`,
                    transform: 'translate(-50%, -50%)',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    background: isUsed ? 'rgba(0,0,0,0.5)' :
                      currentPlayer === 2 ? 'linear-gradient(135deg, #ff9966, #ff5e62)' : 'rgba(255,255,255,0.1)',
                    color: isUsed ? '#555' : '#fff',
                    fontWeight: 'bold',
                    cursor: (isUsed || currentPlayer !== 2) ? 'not-allowed' : 'pointer',
                    boxShadow: (!isUsed && currentPlayer === 2) ? '0 4px 15px rgba(255, 94, 98, 0.4)' : 'none',
                    opacity: (currentPlayer !== 2 && !isUsed) ? 0.3 : 1,
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', display: 'block' }}>{data.rotate === 0 ? '↑' : data.rotate === 180 ? '↓' : data.rotate === 90 ? '→' : data.rotate === 270 ? '←' : '•'}</span>
                  <span style={{ fontSize: '0.7rem' }}>{key}</span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
              Directions Left: {8 - usedDirections.length}
            </div>

            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              style={{
                marginTop: '10px',
                padding: '8px 16px',
                background: history.length === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                color: history.length === 0 ? 'rgba(255,255,255,0.3)' : '#fff',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                cursor: history.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ↩ Undo
            </button>

            {winner && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ color: '#4CAF50', fontSize: '2rem', margin: '10px 0' }}>{winner}</h3>
                <button
                  onClick={restartGame}
                  style={{
                    padding: '12px 24px',
                    background: '#fff',
                    color: '#1a1a2e',
                    border: 'none',
                    borderRadius: '30px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

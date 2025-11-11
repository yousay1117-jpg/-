
import React, { useState, useEffect, useCallback } from 'react';
import type { Player, Wind, GameState, GameMode, RoundLog, GameHistory, GameResultPlayer, UndoState } from './types';
import { INITIAL_PLAYERS, RON_SCORE_TABLE, TSUMO_SCORE_TABLE, FREE_MODE_PAYOUT_TABLE } from './constants';
import PlayerArea from './components/PlayerArea';
import Modal from './components/Modal';

// Helper function to create a deep copy
const deepCopy = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj));

export default function App() {
  const [players, setPlayers] = useState<Player[]>(deepCopy(INITIAL_PLAYERS));
  const [riichiSticks, setRiichiSticks] = useState(0);
  const [currentWind, setCurrentWind] = useState<'east' | 'south'>('east');
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [honba, setHonba] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('set');
  const [gameState, setGameState] = useState<GameState>('normal');
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  
  const [selectedPlayerId, setSelectedPlayerId] = useState<Wind | null>(null);
  const [agariPlayers, setAgariPlayers] = useState<Wind[]>([]);
  const [loserPlayer, setLoserPlayer] = useState<Wind | null>(null);
  const [tenpaiPlayers, setTenpaiPlayers] = useState<Wind[]>([]);
  const [multiRonAgariIndex, setMultiRonAgariIndex] = useState(0);

  const [instructionText, setInstructionText] = useState('');
  
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreModalData, setScoreModalData] = useState<{winType: 'ron' | 'tsumo', winnerId: Wind} | null>(null);
  const [selectedChips, setSelectedChips] = useState(0);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [finalResult, setFinalResult] = useState<GameResultPlayer[]>([]);
  
  const [roundLog, setRoundLog] = useState<RoundLog[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [gameStateHistory, setGameStateHistory] = useState<UndoState[]>([]);


  useEffect(() => {
    const savedHistory = localStorage.getItem('mahjongGameHistory');
    if (savedHistory) {
      setGameHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveUndoState = useCallback(() => {
    const currentState: UndoState = {
      players: deepCopy(players),
      riichiSticks: riichiSticks,
      currentWind: currentWind,
      currentRoundNumber: currentRoundNumber,
      honba: honba,
      roundLog: deepCopy(roundLog),
      isGameStarted: isGameStarted,
    };
    setGameStateHistory(prev => [...prev, currentState]);
  }, [players, riichiSticks, currentWind, currentRoundNumber, honba, roundLog, isGameStarted]);


  const startGameAction = () => {
    if (!isGameStarted) {
      setIsGameStarted(true);
    }
  };

  const resetSelection = () => {
    setSelectedPlayerId(null);
    setInstructionText('');
    setGameState('normal');
    setAgariPlayers([]);
    setLoserPlayer(null);
    setTenpaiPlayers([]);
    setMultiRonAgariIndex(0);
  };

  const handlePlayerSelect = (id: Wind) => {
    if (isGameFinished) return;

    switch (gameState) {
      case 'normal':
        setSelectedPlayerId(prev => (prev === id ? null : id));
        break;
      case 'selecting_ron_winners':
        setAgariPlayers(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
        break;
      case 'selecting_ron_loser':
        if (agariPlayers.includes(id)) { alert('和了したプレイヤーは放銃者に選べません。'); return; }
        setLoserPlayer(id);
        setMultiRonAgariIndex(0);
        setScoreModalData({ winType: 'ron', winnerId: agariPlayers[0] });
        setIsScoreModalOpen(true);
        break;
      case 'selecting_tsumo_winner':
        setAgariPlayers([id]);
        setGameState('awaiting_tsumo_score');
        setInstructionText('点数を選択してください');
        setScoreModalData({ winType: 'tsumo', winnerId: id });
        setIsScoreModalOpen(true);
        break;
      case 'selecting_tenpai_players':
        setTenpaiPlayers(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
        break;
    }
  };
  
  const handleNameChange = (id: Wind, newName: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };
  
  // This is a placeholder for a full stats modal implementation
  const handleShowStats = () => {
      alert("総合成績機能は現在開発中です。localStorageに保存された履歴データはコンソールで確認できます。");
      console.log("Game History:", gameHistory);
  };

  const getParentId = useCallback(() => players.find(p => p.wind === 'east')?.id, [players]);
  
  const endGame = useCallback(() => {
    if (isGameFinished) return;
    setIsGameFinished(true);
    setInstructionText('半荘が終了しました。');

    // --- Final Score Calculation Logic ---
    let sortedPlayers: GameResultPlayer[] = deepCopy(players).map(p => ({...p, rank: 0, finalScore: 0}));
    
    // Temporarily add riichi sticks to top player for ranking
    let tempPlayersForRanking = deepCopy(players);
    const topTempPlayer = tempPlayersForRanking.sort((a,b) => b.score - a.score)[0];
    if (topTempPlayer) {
      topTempPlayer.score += riichiSticks * 1000;
    }

    tempPlayersForRanking.sort((a, b) => b.score - a.score);
    tempPlayersForRanking.forEach((p, index) => {
        const playerInSorted = sortedPlayers.find(sp => sp.id === p.id);
        if (playerInSorted) playerInSorted.rank = index + 1;
    });

    if (gameMode === 'free') {
      // Free mode payout logic
    } else { // Set mode
        const oka = 20; // 25k start, 30k return -> 20k oka
        const uma = [30, 10, -10, -30];
        
        let totalPoints = 0;
        sortedPlayers.forEach(p => {
          const originalPlayer = tempPlayersForRanking.find(tp => tp.id === p.id);
          const score = originalPlayer?.score ?? 0;

          // Rounding logic (shishagonyu)
          const dividedScore = score / 1000;
          const decimalPart = dividedScore - Math.floor(dividedScore);
          const roundedThousandPoints = decimalPart >= 0.5 ? Math.ceil(dividedScore) : Math.floor(dividedScore);

          p.finalScore = roundedThousandPoints - 30;
          totalPoints += p.finalScore;
        });

        sortedPlayers.forEach(p => {
            p.finalScore += uma[p.rank-1];
        });

        const topPlayer = sortedPlayers.find(p => p.rank === 1);
        if (topPlayer) {
            topPlayer.finalScore += oka;
        }
    }
    
    const finalSortedPlayers = sortedPlayers.sort((a, b) => a.rank - b.rank);

    // Save game result
    const gameData: GameHistory = {
        date: new Date().toISOString(),
        players: finalSortedPlayers.map(p => ({ 
            name: p.name, 
            rank: p.rank, 
            finalScore: p.finalScore,
            chips: p.chips 
        })),
        log: roundLog
    };
    const newHistory = [...gameHistory, gameData];
    setGameHistory(newHistory);
    localStorage.setItem('mahjongGameHistory', JSON.stringify(newHistory));

    setFinalResult(finalSortedPlayers);
    setIsResultModalOpen(true);
    setRiichiSticks(0);

  }, [players, riichiSticks, gameMode, roundLog, isGameFinished, gameHistory]);

  const checkEndGameConditions = useCallback(() => {
    if (gameMode === 'free') {
        const tobiPlayer = players.find(p => p.score < 0);
        if (tobiPlayer) {
            alert(`【フリーモード】${tobiPlayer.name}の持ち点が0点を下回ったため、半荘を終了します。`);
            endGame();
            return true;
        }
        const highScorer = players.find(p => p.score >= 55000);
        if (highScorer) {
            alert(`【フリーモード】${highScorer.name}の持ち点が55,000点以上になったため、半荘を終了します。`);
            endGame();
            return true;
        }
    }
    return false;
  }, [players, gameMode, endGame]);

  const nextRound = useCallback((isAgari: boolean) => {
      const parentId = getParentId();
      const isParentAgari = isAgari && agariPlayers.some(id => id === parentId);
      const isParentTenpaiInRyuukyoku = !isAgari && tenpaiPlayers.includes(parentId!);
      const isRenchan = isParentAgari || isParentTenpaiInRyuukyoku;
  
      if (isRenchan) {
          setHonba(prev => prev + 1);
      } else { 
          const isSouth4 = currentWind === 'south' && currentRoundNumber === 4;
          if (isSouth4) {
              const topPlayer = [...players].sort((a,b) => b.score - a.score)[0];
              if (topPlayer.id !== parentId || topPlayer.score < 30000) {
                  endGame();
                  return;
              }
          }
          
          setHonba(0);
          if (currentWind === 'east' && currentRoundNumber === 4) {
              setCurrentWind('south');
              setCurrentRoundNumber(1);
          } else {
              setCurrentRoundNumber(prev => prev + 1);
          }
  
          const windOrder: Wind[] = ['east', 'south', 'west', 'north'];
          setPlayers(prevPlayers => prevPlayers.map(player => {
              const currentWindIndex = windOrder.indexOf(player.wind);
              const newWindIndex = (currentWindIndex + 3) % 4;
              return { ...player, wind: windOrder[newWindIndex] };
          }));
      }
  }, [players, getParentId, agariPlayers, tenpaiPlayers, currentWind, currentRoundNumber, endGame]);


  const handleEndOfRound = useCallback((isAgari: boolean) => {
    setPlayers(prev => prev.map(p => ({...p, isRiichi: false})));

    if (!checkEndGameConditions()) {
        nextRound(isAgari);
    }
    resetSelection();
  }, [checkEndGameConditions, nextRound]);

  const handleRon = () => {
    if (isGameFinished) return;
    if (gameState === 'normal') { saveUndoState(); }
    startGameAction();
    switch (gameState) {
        case 'normal':
            resetSelection();
            setGameState('selecting_ron_winners');
            setInstructionText('和了者を全て選択後、再度ロンボタンを押してください');
            break;
        case 'selecting_ron_winners':
            if (agariPlayers.length === 0) { alert('和了者が選択されていません。'); return; }
            setGameState('selecting_ron_loser');
            setInstructionText('放銃したプレイヤーを選択してください');
            break;
        default:
            alert('操作をキャンセルしました。');
            resetSelection();
            break;
    }
  };
  
  const handleTsumo = () => {
    if (isGameFinished) return;
    if (gameState !== 'normal') { alert('現在、他の処理が進行中です。'); resetSelection(); return; }
    saveUndoState();
    startGameAction();
    resetSelection();
    setGameState('selecting_tsumo_winner');
    setInstructionText('ツモ和了したプレイヤーを選択してください');
  };

  const handleRiichi = () => {
    if (isGameFinished || gameState !== 'normal' || !selectedPlayerId) {
      alert('リーチするプレイヤーをクリックで選択してください。');
      return;
    }
    const targetPlayer = players.find(p => p.id === selectedPlayerId);
    if (!targetPlayer) return;
    if (targetPlayer.isRiichi) { alert('このプレイヤーは既にリーチしています。'); return; }
    if (gameMode === 'free' && targetPlayer.score < 1000) {
      alert('【フリーモード】点数が1000点未満のため、リーチできません。');
      return;
    }

    saveUndoState();
    startGameAction();
    setPlayers(prev => prev.map(p => p.id === selectedPlayerId ? {...p, score: p.score - 1000, isRiichi: true} : p));
    setRiichiSticks(prev => prev + 1);
    checkEndGameConditions();
    resetSelection();
  };
  
  const handleRyuukyoku = () => {
    if (isGameFinished) return;
    if (gameState === 'normal') { saveUndoState(); }
    startGameAction();
    switch(gameState) {
        case 'normal':
            resetSelection();
            setGameState('selecting_tenpai_players');
            setInstructionText('聴牌したプレイヤーを全て選択し、再度流局ボタンを押してください');
            break;
        case 'selecting_tenpai_players':
            setRoundLog(prev => [...prev, { type: 'ryuukyoku', tenpai: tenpaiPlayers.map(id => players.find(p => p.id === id)!.name) }]);
            const numTenpai = tenpaiPlayers.length;
            if (numTenpai > 0 && numTenpai < 4) {
                const pointsToPay = 3000 / (4 - numTenpai);
                const pointsToReceive = 3000 / numTenpai;
                setPlayers(prev => prev.map(player => ({
                    ...player,
                    score: player.score + (tenpaiPlayers.includes(player.id) ? pointsToReceive : -pointsToPay)
                })));
            }
            handleEndOfRound(false);
            break;
        default:
            alert('操作をキャンセルしました。');
            resetSelection();
            break;
    }
  };

  const handleSpecialRyuukyoku = () => {
    if (isGameFinished || gameState !== 'normal') return;
    if(confirm('特殊流局（九種九牌など）として処理しますか？\n（親は流れず、本場が1つ増えます）')) {
      saveUndoState();
      startGameAction();
      setHonba(prev => prev + 1);
      setPlayers(prev => prev.map(p => ({...p, isRiichi: false})));
      setRoundLog(prev => [...prev, { type: 'special_ryuukyoku' }]);
      resetSelection();
    }
  };
  
  const handleUndo = () => {
    if (gameStateHistory.length === 0) return;
    const lastState = gameStateHistory[gameStateHistory.length - 1];
    setPlayers(deepCopy(lastState.players));
    setRiichiSticks(lastState.riichiSticks);
    setCurrentWind(lastState.currentWind);
    setCurrentRoundNumber(lastState.currentRoundNumber);
    setHonba(lastState.honba);
    setRoundLog(deepCopy(lastState.roundLog));
    setIsGameStarted(lastState.isGameStarted);
    if(isGameFinished) setIsGameFinished(false);

    resetSelection();
    setGameStateHistory(prev => prev.slice(0, -1));
  };
  
  const initializeGame = () => {
    setPlayers(deepCopy(INITIAL_PLAYERS));
    setRiichiSticks(0);
    setCurrentWind('east');
    setCurrentRoundNumber(1);
    setHonba(0);
    setIsGameFinished(false);
    setIsGameStarted(false);
    setRoundLog([]);
    setGameStateHistory([]);
    resetSelection();
    setIsResultModalOpen(false);
  };
  
  const processRonScore = (score: number) => {
    const winnerId = agariPlayers[multiRonAgariIndex];
    if (!winnerId || !loserPlayer) return;

    if (multiRonAgariIndex === 0) {
      setRoundLog(prev => [...prev, {
        type: 'ron',
        winners: agariPlayers.map(id => players.find(p => p.id === id)!.name),
        loser: players.find(p => p.id === loserPlayer)!.name
      }]);
    }
    
    const honbaBonus = honba * 300;
    
    setPlayers(prev => prev.map(p => {
        if (p.id === winnerId) return { ...p, score: p.score + score + honbaBonus, chips: p.chips + selectedChips };
        if (p.id === loserPlayer) return { ...p, score: p.score - (score + honbaBonus), chips: p.chips - selectedChips };
        return p;
    }));
    
    const nextIndex = multiRonAgariIndex + 1;
    if (nextIndex < agariPlayers.length) {
      setMultiRonAgariIndex(nextIndex);
      setScoreModalData({ winType: 'ron', winnerId: agariPlayers[nextIndex]});
    } else {
      // Atama-hane logic
      const windOrder: Wind[] = ['east', 'south', 'west', 'north'];
      const loserWindIndex = windOrder.indexOf(players.find(p => p.id === loserPlayer)!.wind);
      let atamaHaneWinnerId: Wind | undefined;
      for (let i = 1; i < windOrder.length; i++) {
        const nextWind = windOrder[(loserWindIndex + i) % 4];
        const nextPlayer = players.find(p => p.wind === nextWind);
        if (nextPlayer && agariPlayers.includes(nextPlayer.id)) {
            atamaHaneWinnerId = nextPlayer.id;
            break;
        }
      }
      if (!atamaHaneWinnerId) atamaHaneWinnerId = agariPlayers[0]; // fallback
      
      const riichiGain = riichiSticks * 1000;
      setPlayers(prev => prev.map(p => p.id === atamaHaneWinnerId ? {...p, score: p.score + riichiGain} : p));
      setRiichiSticks(0);

      setIsScoreModalOpen(false);
      handleEndOfRound(true);
    }
  };
  
  const processTsumoScore = (scoreData: any) => {
    const winnerId = agariPlayers[0];
    if (!winnerId) return;

    setRoundLog(prev => [...prev, {
      type: 'tsumo',
      winner: players.find(p => p.id === winnerId)!.name,
      losers: players.filter(p => p.id !== winnerId).map(p => p.name)
    }]);

    const winner = players.find(p => p.id === winnerId)!;
    const isWinnerParent = winner.wind === 'east';
    const honbaBonusPerPlayer = honba * 100;
    let totalGain = 0;
    let totalChipsGained = 0;

    const newPlayers = players.map(p => {
      if (p.id === winnerId) return p;
      let payment = 0;
      if (isWinnerParent) {
        payment = scoreData.payment + honbaBonusPerPlayer;
      } else {
        payment = (p.wind === 'east' ? scoreData.parentPayment : scoreData.childPayment) + honbaBonusPerPlayer;
      }
      totalGain += payment;
      totalChipsGained += selectedChips;
      return {...p, score: p.score - payment, chips: p.chips - selectedChips};
    });

    const finalPlayers = newPlayers.map(p => {
      if (p.id === winnerId) {
        return {...p, score: p.score + totalGain + (riichiSticks * 1000), chips: p.chips + totalChipsGained};
      }
      return p;
    });

    setPlayers(finalPlayers);
    setRiichiSticks(0);
    setIsScoreModalOpen(false);
    handleEndOfRound(true);
  };

  const roundWindMap = { 'east': '東', 'south': '南' };
  const currentWinner = scoreModalData ? players.find(p => p.id === scoreModalData.winnerId) : null;
  const isWinnerParent = currentWinner?.wind === 'east';
  
  const renderScoreButtons = () => {
    if(!scoreModalData || !currentWinner) return null;
    if(scoreModalData.winType === 'ron') {
        const table = isWinnerParent ? RON_SCORE_TABLE.parent : RON_SCORE_TABLE.child;
        return table.map(item => (
            <button key={item.label} onClick={() => processRonScore(item.score)} className="p-2 sm:p-3 text-sm sm:text-base cursor-pointer bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                {item.label}
            </button>
        ));
    } else { // tsumo
        const table = isWinnerParent ? TSUMO_SCORE_TABLE.parent : TSUMO_SCORE_TABLE.child;
        return table.map(item => (
            <button key={item.label} onClick={() => processTsumoScore(item)} className="p-2 sm:p-3 text-sm sm:text-base cursor-pointer bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
                {item.label}
            </button>
        ));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <main className="w-[350px] h-[350px] bg-green-800 border-[10px] border-gray-800 rounded-lg relative text-white mt-[50px]">
        {/* Mode Toggle */}
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 z-10 text-gray-800 bg-white px-3 py-1 rounded-full flex items-center text-sm shadow">
          <span className="mr-2">モード:</span>
          <button id="mode-toggle-button" disabled={isGameStarted} onClick={() => setGameMode(prev => prev === 'set' ? 'free' : 'set')}
            className="px-4 py-1 text-sm cursor-pointer border border-gray-300 rounded-full bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60">
            {gameMode === 'set' ? 'セット' : 'フリー'}
          </button>
        </div>

        {/* Center Area */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-900 p-3 rounded-md text-center w-40">
          <div className="text-lg">
            <span>{roundWindMap[currentWind]}{currentRoundNumber}局</span>
            <span className="ml-2">{honba}本場</span>
          </div>
          <div className="text-base">
            <p>供託: {riichiSticks}</p>
          </div>
          <p className="mt-2.5 text-yellow-300 font-bold h-5 text-xs">{instructionText}</p>
        </div>

        {/* Player Areas */}
        {players.map(player => (
            <PlayerArea
                key={player.id}
                player={player}
                position={player.id}
                isSelected={selectedPlayerId === player.id || agariPlayers.includes(player.id) || tenpaiPlayers.includes(player.id)}
                isGameStarted={isGameStarted}
                onSelect={handlePlayerSelect}
                onNameChange={handleNameChange}
            />
        ))}

        {/* Action Buttons */}
        <div className="absolute bottom-[-80px] w-full flex justify-around">
            <button onClick={handleRon} className="action-btn">ロン</button>
            <button onClick={handleTsumo} className="action-btn">ツモ</button>
            <button onClick={handleRiichi} className="action-btn">リーチ</button>
            <button onClick={handleRyuukyoku} className="action-btn">流局</button>
            <button onClick={handleSpecialRyuukyoku} className="action-btn">特殊流局</button>
        </div>
        
        {/* Utility Buttons */}
        <div className="absolute bottom-[-140px] w-full flex justify-center items-center gap-4">
            <button onClick={handleShowStats} className="utility-btn">総合成績を見る</button>
            <button onClick={handleUndo} disabled={gameStateHistory.length === 0} className="utility-btn">1局戻る</button>
        </div>
        
        {/* Fix: Removed non-standard 'jsx' prop from style tag. */}
        <style>{`
            .action-btn {
                padding: 10px 12px;
                font-size: 0.9em;
                cursor: pointer;
                background-color: #e5e7eb; /* bg-gray-200 */
                color: black;
                border-radius: 6px;
                transition: background-color 0.2s;
            }
            .action-btn:hover {
                background-color: #d1d5db; /* bg-gray-300 */
            }
            .utility-btn {
                padding: 10px 20px;
                font-size: 1em;
                cursor: pointer;
                background-color: #e5e7eb; /* bg-gray-200 */
                color: black;
                border-radius: 6px;
                transition: background-color 0.2s;
            }
            .utility-btn:hover {
                 background-color: #d1d5db; /* bg-gray-300 */
            }
            .utility-btn:disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }
        `}</style>

      </main>

        {/* Score Modal */}
        <Modal 
            isOpen={isScoreModalOpen} 
            onClose={() => setIsScoreModalOpen(false)}
            title={currentWinner ? `${currentWinner.name} (${isWinnerParent ? '親' : '子'}) の和了点` : '点数を選択'}
        >
          {gameMode === 'free' && (
              <div className="text-center mb-4 text-base">
                  <label htmlFor="chip-select" className="mr-2">獲得チップ:</label>
                  <select id="chip-select" value={selectedChips} onChange={(e) => setSelectedChips(parseInt(e.target.value, 10))} className="p-1 text-base border rounded">
                      {Array.from({length: 11}, (_, i) => <option key={i} value={i}>{i}枚</option>)}
                  </select>
              </div>
          )}
          <div className="grid grid-cols-2 gap-2.5 mt-5">
              {renderScoreButtons()}
          </div>
        </Modal>

        {/* Result Modal */}
        <Modal
          isOpen={isResultModalOpen}
          title="半荘終了 - 最終結果"
        >
            <div className="text-left max-h-[60vh] overflow-y-auto">
                {finalResult.map(p => (
                    <div key={p.id} className="mb-3">
                        <p><strong>{p.rank}位: {p.name}</strong></p>
                        <p className="ml-4">持ち点: {p.score.toLocaleString()}点</p>
                        <p className="ml-4">最終スコア: {gameMode === 'free' ? `${p.finalScore.toLocaleString()} 円` : `${p.finalScore > 0 ? '+' : ''}${p.finalScore.toFixed(0)}`}</p>
                        {gameMode === 'free' && <p className="ml-4">最終チップ: {p.chips}枚</p>}
                    </div>
                ))}
            </div>
            <button onClick={initializeGame} className="w-full mt-5 p-3 text-lg cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                新しいゲームを開始する
            </button>
        </Modal>
    </div>
  );
}
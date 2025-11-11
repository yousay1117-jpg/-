
import React, { useState, useEffect, useRef } from 'react';
import type { Player, Wind } from '../types';

interface PlayerAreaProps {
  player: Player;
  position: 'south' | 'east' | 'west' | 'north';
  isSelected: boolean;
  isGameStarted: boolean;
  onSelect: (id: Wind) => void;
  onNameChange: (id: Wind, newName: string) => void;
}

const positionClasses = {
  south: 'top-[5px] left-1/2 -translate-x-1/2',
  east: 'right-[5px] top-1/2 -translate-y-1/2 -rotate-90',
  west: 'left-[5px] top-1/2 -translate-y-1/2 rotate-90',
  north: 'bottom-[5px] left-1/2 -translate-x-1/2',
};

const windMap = { east: '東', south: '南', west: '西', north: '北' };

const PlayerArea: React.FC<PlayerAreaProps> = ({ player, position, isSelected, isGameStarted, onSelect, onNameChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(player.name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    
    useEffect(() => {
        setName(player.name);
    }, [player.name]);

    const handleNameSave = () => {
        const newName = name.trim();
        if (newName) {
            onNameChange(player.id, newName);
        } else {
            setName(player.name); // Revert if empty
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleNameSave();
        }
    };

    return (
        <div 
            className={`absolute w-32 p-2.5 bg-black bg-opacity-50 rounded-md text-center cursor-pointer transition-all duration-300 ${positionClasses[position]} ${isSelected ? 'shadow-[0_0_15px_theme(colors.yellow.300)]' : ''}`}
            onClick={() => onSelect(player.id)}
        >
            <div className="text-sm">
                {isEditing ? (
                    <input
                        ref={inputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleNameSave}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 text-sm bg-gray-100 text-gray-800 border border-gray-300 rounded text-center"
                    />
                ) : (
                    <>
                        <span className="player-name">{player.name}</span>
                        {!isGameStarted && (
                            <button
                                className="cursor-pointer mx-1 text-xs inline-block hover:opacity-70"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(true);
                                }}
                            >
                                ✏️
                            </button>
                        )}
                        {player.isRiichi && <span className="text-red-500 ml-1 font-bold">●</span>}
                    </>
                )}
                <span className="player-wind">({windMap[player.wind]})</span>
            </div>
            <div className="text-2xl font-bold">{player.score}</div>
            <div className="text-xs mt-0.5 text-gray-200">チップ: {player.chips}</div>
        </div>
    );
};

export default PlayerArea;

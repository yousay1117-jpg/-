
export type Wind = 'east' | 'south' | 'west' | 'north';

export interface Player {
  id: Wind;
  name: string;
  score: number;
  isRiichi: boolean;
  wind: Wind;
  chips: number;
}

export type GameState =
  | 'normal'
  | 'selecting_ron_winners'
  | 'selecting_ron_loser'
  | 'selecting_tsumo_winner'
  | 'awaiting_tsumo_score'
  | 'selecting_tenpai_players';

export type GameMode = 'set' | 'free';

export interface GameResultPlayer extends Player {
    rank: number;
    finalScore: number;
}

export interface RoundLog {
    type: 'ron' | 'tsumo' | 'ryuukyoku' | 'special_ryuukyoku';
    winners?: string[];
    loser?: string;
    winner?: string;
    losers?: string[];
    tenpai?: string[];
}

export interface GameHistory {
    date: string;
    players: {
        name: string;
        rank: number;
        finalScore: number;
        chips: number;
    }[];
    log: RoundLog[];
}

export interface UndoState {
    players: Player[];
    riichiSticks: number;
    currentWind: 'east' | 'south';
    currentRoundNumber: number;
    honba: number;
    roundLog: RoundLog[];
    isGameStarted: boolean;
}

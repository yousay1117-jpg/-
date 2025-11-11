
import type { Player } from './types';

// Fix: Add Player[] type to INITIAL_PLAYERS to ensure `id` and `wind` properties match the `Wind` type.
export const INITIAL_PLAYERS: Player[] = [
  { id: 'east', name: '東家', score: 25000, isRiichi: false, wind: 'east', chips: 0 },
  { id: 'south', name: '南家', score: 25000, isRiichi: false, wind: 'south', chips: 0 },
  { id: 'west', name: '西家', score: 25000, isRiichi: false, wind: 'west', chips: 0 },
  { id: 'north', name: '北家', score: 25000, isRiichi: false, wind: 'north', chips: 0 }
];

export const RON_SCORE_TABLE = {
    parent: [
        { label: '1500点', score: 1500 }, { label: '2000点', score: 2000 }, { label: '2400点', score: 2400 },
        { label: '2900点', score: 2900 }, { label: '3900点', score: 3900 }, { label: '4800点', score: 4800 },
        { label: '5800点', score: 5800 }, { label: '6800点', score: 6800 }, { label: '7700点', score: 7700 },
        { label: '8700点', score: 8700 }, { label: '9600点', score: 9600 }, { label: '10600点', score: 10600 },
        { label: '満貫 12000点', score: 12000 },
        { label: '跳満 18000点', score: 18000 },
        { label: '倍満 24000点', score: 24000 },
        { label: '三倍満 36000点', score: 36000 },
        { label: '役満 48000点', score: 48000 }
    ],
    child: [
        { label: '1000点', score: 1000 }, { label: '1300点', score: 1300 }, { label: '1600点', score: 1600 },
        { label: '2000点', score: 2000 }, { label: '2600点', score: 2600 }, { label: '3200点', score: 3200 },
        { label: '3900点', score: 3900 }, { label: '4500点', score: 4500 }, { label: '5200点', score: 5200 },
        { label: '5800点', score: 5800 }, { label: '6400点', score: 6400 }, { label: '7100点', score: 7100 },
        { label: '満貫 8000点', score: 8000 },
        { label: '跳満 12000点', score: 12000 },
        { label: '倍満 16000点', score: 16000 },
        { label: '三倍満 24000点', score: 24000 },
        { label: '役満 32000点', score: 32000 }
    ]
};

export const TSUMO_SCORE_TABLE = {
    parent: [
        { label: '500オール', payment: 500 }, { label: '700オール', payment: 700 }, { label: '800オール', payment: 800 },
        { label: '1000オール', payment: 1000 }, { label: '1300オール', payment: 1300 }, { label: '1600オール', payment: 1600 },
        { label: '2000オール', payment: 2000 }, { label: '2600オール', payment: 2600 }, { label: '3200オール', payment: 3200 },
        { label: '満貫 4000オール', payment: 4000 },
        { label: '跳満 6000オール', payment: 6000 },
        { label: '倍満 8000オール', payment: 8000 },
        { label: '三倍満 12000オール', payment: 12000 },
        { label: '役満 16000オール', payment: 16000 }
    ],
    child: [
        { label: '300-500', parentPayment: 500, childPayment: 300 },
        { label: '400-700', parentPayment: 700, childPayment: 400 },
        { label: '400-800', parentPayment: 800, childPayment: 400 },
        { label: '500-1000', parentPayment: 1000, childPayment: 500 },
        { label: '700-1300', parentPayment: 1300, childPayment: 700 },
        { label: '800-1600', parentPayment: 1600, childPayment: 800 },
        { label: '1000-2000', parentPayment: 2000, childPayment: 1000 },
        { label: '1300-2600', parentPayment: 2600, childPayment: 1300 },
        { label: '1600-3200', parentPayment: 3200, childPayment: 1600 },
        { label: '満貫 2000-4000', parentPayment: 4000, childPayment: 2000 },
        { label: '跳満 3000-6000', parentPayment: 6000, childPayment: 3000 },
        { label: '倍満 4000-8000', parentPayment: 8000, childPayment: 4000 },
        { label: '三倍満 6000-12000', parentPayment: 12000, childPayment: 6000 },
        { label: '役満 8000-16000', parentPayment: 16000, childPayment: 8000 }
    ]
};

export const FREE_MODE_PAYOUT_TABLE: { [key: number]: { 2: number, 3: number, 4: number } } = {
    49000: { 2: 1950, 3: 0, 4: 0 }, 48000: { 2: 1900, 3: 0, 4: 0 },
    47000: { 2: 1850, 3: 0, 4: 0 }, 46000: { 2: 1800, 3: 0, 4: 0 },
    45000: { 2: 1750, 3: 0, 4: 0 }, 44000: { 2: 1700, 3: 0, 4: 0 },
    43000: { 2: 1650, 3: 0, 4: 0 }, 42000: { 2: 1600, 3: 0, 4: 0 },
    41000: { 2: 1550, 3: 0, 4: 0 }, 40000: { 2: 1500, 3: 500, 4: 0 },
    39000: { 2: 1450, 3: 550, 4: 0 }, 38000: { 2: 1400, 3: 600, 4: 0 },
    37000: { 2: 1350, 3: 650, 4: 0 }, 36000: { 2: 1300, 3: 700, 4: 0 },
    35000: { 2: 1250, 3: 750, 4: 0 }, 34000: { 2: 1200, 3: 800, 4: 0 },
    33000: { 2: 1150, 3: 850, 4: 0 }, 32000: { 2: 1100, 3: 900, 4: 0 },
    31000: { 2: 1050, 3: 950, 4: 0 }, 30000: { 2: 1000, 3: 1000, 4: 2000 },
    29000: { 2: 950, 3: 1050, 4: 2050 }, 28000: { 2: 900, 3: 1100, 4: 2100 },
    27000: { 2: 850, 3: 1150, 4: 2150 }, 26000: { 2: 800, 3: 1200, 4: 2200 },
    25000: { 2: 750, 3: 1250, 4: 2250 }, 24000: { 2: 700, 3: 1300, 4: 2300 },
    23000: { 2: 650, 3: 1350, 4: 2350 }, 22000: { 2: 600, 3: 1400, 4: 2400 },
    21000: { 2: 550, 3: 1450, 4: 2450 }, 20000: { 2: 500, 3: 1500, 4: 2500 },
    19000: { 2: 450, 3: 1550, 4: 2550 }, 18000: { 2: 400, 3: 1600, 4: 2600 },
    17000: { 2: 350, 3: 1650, 4: 2650 }, 16000: { 2: 300, 3: 1700, 4: 2700 },
    15000: { 2: 250, 3: 1750, 4: 2750 }, 14000: { 2: 200, 3: 1800, 4: 2800 },
    13000: { 2: 150, 3: 1850, 4: 2850 }, 12000: { 2: 100, 3: 1900, 4: 2900 },
    11000: { 2: 50, 3: 1950, 4: 2950 }, 10000: { 2: 0, 3: 2000, 4: 3000 },
    9000:  { 2: 50, 3: 2050, 4: 3050 }, 8000:  { 2: 100, 3: 2100, 4: 3100 },
    7000:  { 2: 150, 3: 2150, 4: 3150 }, 6000:  { 2: 200, 3: 2200, 4: 3200 },
    5000:  { 2: 250, 3: 2250, 4: 3250 }, 4000:  { 2: 300, 3: 2300, 4: 3300 },
    3000:  { 2: 350, 3: 2350, 4: 3350 }, 2000:  { 2: 400, 3: 2400, 4: 3400 },
    1000:  { 2: 450, 3: 2450, 4: 3450 }, 0:     { 2: 500, 3: 2500, 4: 3500 }
};
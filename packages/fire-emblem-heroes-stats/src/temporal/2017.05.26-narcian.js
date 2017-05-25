// @flow
import type { Hero } from '..';

// Times were entered in PDT (UTC - 7)
// End time is currently approximated based on previous GHB reruns.
const startTime = new Date('2017-05-26T00:00:00-07:00');
const endTime = new Date('2017-06-02T23:59:00-07:00');

const unitList: Array<Hero> = [
  {
    'shortName': 'Narcian',
    'name': 'Narcian (Narcian GHB)',
    'moveType': 'Flying',
    'weaponType': 'Green Axe',
    'skills': [
      {
        'name': 'Emerald Axe+',
        'rarity': '-',
      },
      {
        'name': 'Vengeance',
        'rarity': '-',
      },
      {
        'name': 'Lancebreaker 3',
        'rarity': '-',
      },
      {
        'name': 'Savage Blow 3',
        'rarity': '-',
      },
    ],
    'stats': {
      '1': {
        '5': {
          'hp': '-',
          'atk': '-',
          'spd': '-',
          'def': '-',
          'res': '-',
        },
      },
      '40': {
        '5': {
          'hp': [48],
          'atk': [25],
          'spd': [24],
          'def': [28],
          'res': [22],
        },
      },
    },
  },
  {
    'shortName': 'Fighter',
    'name': 'Bow Fighter (Narcian GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Neutral Bow',
    'skills': [
      {
        'name': 'Brave Bow',
        'rarity': '-',
      },
      {
        'name': 'Reprisal',
        'rarity': '-',
      },
      {
        'name': 'Death Blow 2',
        'rarity': '-',
      },
      {
        'name': 'Savage Blow 3',
        'rarity': '-',
      },
    ],
    'stats': {
      '1': {
        '5': {
          'hp': '-',
          'atk': '-',
          'spd': '-',
          'def': '-',
          'res': '-',
        },
      },
      '40': {
        '5': {
          'hp': [41],
          'atk': [28],
          'spd': [25],
          'def': [24],
          'res': [13],
        },
      },
    },
  },
  {
    'shortName': 'Cavalier',
    'name': 'Blue Cavalier (Narcian GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Blue Tome',
    'skills': [
      {
        'name': 'Thoron',
        'rarity': '-',
      },
      {
        'name': 'Ardent Sacrifice',
        'rarity': '-',
      },
      {
        'name': 'Triangle Adept 2',
        'rarity': '-',
      },
      {
        'name': 'Swordbreaker 3',
        'rarity': '-',
      },
    ],
    'stats': {
      '1': {
        '5': {
          'hp': '-',
          'atk': '-',
          'spd': '-',
          'def': '-',
          'res': '-',
        },
      },
      '40': {
        '5': {
          'hp': [31],
          'atk': [31],
          'spd': [21],
          'def': [14],
          'res': [30],
        },
      },
    },
  },
  {
    'shortName': 'Cavalier',
    'name': 'Green Cavalier (Narcian GHB)',
    'moveType': 'Cavalry',
    'weaponType': 'Green Tome',
    'skills': [
      {
        'name': 'Gronnraven',
        'rarity': '-',
      },
      {
        'name': 'Reprisal',
        'rarity': '-',
      },
      {
        'name': 'Death Blow 2',
        'rarity': '-',
      },
    ],
    'stats': {
      '1': {
        '5': {
          'hp': '-',
          'atk': '-',
          'spd': '-',
          'def': '-',
          'res': '-',
        },
      },
      '40': {
        '5': {
          'hp': [31],
          'atk': [31],
          'spd': [21],
          'def': [14],
          'res': [30],
        },
      },
    },
  },
  {
    'shortName': 'Fighter',
    'name': 'Sword Fighter (Narcian GHB)',
    'moveType': 'Infantry',
    'weaponType': 'Red Sword',
    'skills': [
      {
        'name': 'Silver Sword',
        'rarity': '-',
      },
      {
        'name': 'Escutcheon',
        'rarity': '-',
      },
      {
        'name': 'Axebreaker 3',
        'rarity': '-',
      },
      {
        'name': 'Threaten Res 2',
        'rarity': '-',
      },
    ],
    'stats': {
      '1': {
        '5': {
          'hp': '-',
          'atk': '-',
          'spd': '-',
          'def': '-',
          'res': '-',
        },
      },
      '40': {
        '5': {
          'hp': [42],
          'atk': [27],
          'spd': [26],
          'def': [26],
          'res': [18],
        },
      },
    },
  },
];

export default {unitList, startTime, endTime};

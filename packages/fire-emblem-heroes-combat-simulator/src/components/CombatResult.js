// @flow
import React from 'react';
import type { Hero } from 'fire-emblem-heroes-stats';

import { calculateResult } from '../damageCalculation';


type Props = {
  leftHero: ?Hero;
  rightHero: ?Hero;
};

const printDamage = (damage, numAttacks) => (
  numAttacks > 1
    ? `${damage} × ${numAttacks}`
    : numAttacks > 0
      ? `${damage}`
      : ''
);

const CombatResult = ({ leftHero, rightHero }: Props) => {
  let result;
  if (leftHero && rightHero) result = calculateResult(leftHero, rightHero);

  return (
    <div className="root">
      <style jsx>{`
        .root {
          height: 80px;
        }
        .container {
          display: flex;
          justify-content: space-between;
          margin: 0 auto;
          width: 320px;
        }
        h1 {
          color: white;
          font-family: 'Mandali', sans-serif;
          line-height: 1;
          margin: 0 0 10px;
          text-align: center;
        }
        h2 {
          color: white;
          font-family: 'Mandali', sans-serif;
          line-height: 1;
          margin: 0 0 10px;
          text-align: center;
        }
      `}</style>
      {leftHero && rightHero && result
        ? (
          <div className="container">
            <div>
              <h1>{`${leftHero.hp} → ${result.attackerHpRemaining}`}</h1>
              <h2>{printDamage(result.attackerDamage, result.attackerNumAttacks)}</h2>
            </div>
            <div>
              <h1>{`${rightHero.hp} → ${result.defenderHpRemaining}`}</h1>
              <h2>{printDamage(result.defenderDamage, result.defenderNumAttacks)}</h2>
            </div>
          </div>
        )
        : null}
    </div>
  );
}

export default CombatResult;

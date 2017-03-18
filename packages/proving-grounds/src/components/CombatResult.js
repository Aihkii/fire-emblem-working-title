// @flow
import React from 'react';
import type { Hero } from 'fire-emblem-heroes-stats';

import { calculateResult, getStat } from '../damageCalculation';


type Props = {
  leftHero: ?Hero;
  rightHero: ?Hero;
};

const printDamage = (damage, numAttacks) => (
  isNaN(damage)
    ? '?'
    : numAttacks > 1
      ? `${damage} × ${numAttacks}`
      : numAttacks > 0
        ? `${damage}`
        : ''
);

const CombatResult = ({ leftHero, rightHero }: Props) => {
  let result = leftHero && rightHero
    ? calculateResult(leftHero, rightHero)
    : undefined;

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
          margin: 10px 0 0;
          text-align: center;
        }
        h2 {
          color: white;
          font-family: 'Mandali', sans-serif;
          line-height: 1;
          margin: 10px 0 0;
          text-align: center;
        }
      `}</style>
      {leftHero && rightHero && result
        ? (
          <div className="container">
            <div>
              <h1>{`${
                !isNaN(getStat(leftHero, 'hp')) ? getStat(leftHero, 'hp') : '?'
              } → ${
                !isNaN(result.attackerHpRemaining) ? result.attackerHpRemaining : '?'
              }`}</h1>
              <h2>{printDamage(result.attackerDamage, result.attackerNumAttacks)}</h2>
            </div>
            <div>
              <h1>{`${
                !isNaN(getStat(rightHero, 'hp')) ? getStat(rightHero, 'hp') : '?'
              } → ${
                !isNaN(result.defenderHpRemaining) ? result.defenderHpRemaining : '?'
              }`}</h1>
              <h2>{printDamage(result.defenderDamage, result.defenderNumAttacks)}</h2>
            </div>
          </div>
        )
        : null}
    </div>
  );
}

export default CombatResult;

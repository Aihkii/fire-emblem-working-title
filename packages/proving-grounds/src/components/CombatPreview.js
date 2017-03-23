// @flow
import React from 'react';
import Router from 'next/router';

import Hero from './Hero';
import { colors } from '../theme';
import { lookupStats } from '../heroHelpers';
import type { Dispatch } from '../reducer';


type Props = {
  activeSlot: ?number;
  dispatch: Dispatch;
  leftHero: ?Object;
  rightHero: ?Object;
};

const CombatPreview = ({ activeSlot, dispatch, leftHero, rightHero }: Props) => (
  <div className="root">
    <style jsx>{`
      .root {
        margin: 0 auto;
        width: ${56 * 3}px
      }
      .arrow-left {
        cursor: pointer;
        outline: none;
        padding: 5px 10px;
      }
      .arrow-left::after {
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        border-left: 10px solid white;
        content: "";
        display: block;
      }
      .container {
        align-items: center;
        display: flex;
        height: ${56 * 1.5}px;
        justify-content: space-between;
      }
      .hero-slot {
        background: ${colors.frostedGlass};
        cursor: pointer;
        height: 56px;
        position: relative;
        transition: box-shadow 0.2s;
        user-select: none;
        width: 56px;
      }
      .hero-slot:hover {
        box-shadow: 0 5px 20px rgba(70, 183, 227, 0.5);
      }
      .active {
        box-shadow: 0 0 8px 4px rgba(255, 255, 255, 0.5), 0 0 2px 4px rgba(223, 110, 134, 0.9);
      }
      .active:hover {
        box-shadow: 0 0 8px 4px rgba(255, 255, 255, 0.5), 0 0 2px 4px rgba(223, 110, 134, 0.9);
      }
    `}</style>
    <div
      className="container"
    >
      <div
        className={`${activeSlot === 0 ? 'active' : ''} hero-slot`}
        onClick={(event) => {
          event.stopPropagation();
          dispatch({ type: 'SELECT_SLOT', slot: 0 });
        }}
        onContextMenu={event => {
          event.preventDefault();
          dispatch({ type: 'SELECT_SLOT', slot: 0 });
          Router.push('/configure');
        }}
      >
        {leftHero
          ? <Hero
            name={leftHero.name}
            weaponType={lookupStats(leftHero.name).weaponType}
            rarity={leftHero.rarity}
          />
          : null}
      </div>
      <div
        className="arrow-left"
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          dispatch({ type: 'TOGGLE_AGGRESSOR' });
        }}
      />
      <div
        className={`${activeSlot === 1 ? 'active' : ''} hero-slot`}
        onClick={(event) => {
          event.stopPropagation();
          dispatch({ type: 'SELECT_SLOT', slot: 1 });
        }}
        onContextMenu={event => {
          event.preventDefault();
          dispatch({ type: 'SELECT_SLOT', slot: 1 });
          Router.push('/configure');
        }}
      >
        {rightHero
          ? <Hero
            name={rightHero.name}
            weaponType={lookupStats(rightHero.name).weaponType}
            rarity={rightHero.rarity}
          />
          : null}
      </div>
    </div>
  </div>
);

export default CombatPreview;

// @flow
import React from 'react';
import { replace } from 'ramda';

import Frame from './Frame';
import { colors, gridSize } from '../theme';
import { staticUrl } from '../../config';

type Rarity = 1 | 2 | 3 | 4 | 5;

type Props = {
  name: string;
  weaponType: ?string;
  rarity?: Rarity;
};

const HeroPortrait = ({ name, weaponType, rarity = 5 }: Props) => {
  const weaponTypeUri = weaponType ? replace(' ', '_', weaponType) : '';

  return (
    <div className="root">
      <style jsx>{`
        .root {
          position: relative;
          width: ${gridSize}px;
        }
        .backing {
          background-image: linear-gradient(170deg, ${colors.fadedJade}, ${colors.aquaIsland});
          height: ${gridSize}px;
          width: ${gridSize}px;
        }
        .class {
          left: -2px;
          position: absolute;
          top: -2px;
        }
        .portrait {
          display: block;
          height: ${gridSize}px;
          left: 0;
          margin: 0 auto;
          position: absolute;
          top: 0;
          width: ${gridSize}px;
        }
        .frame {
          pointer-events: none;
          position: absolute;
          top: ${-(0.07 * gridSize)}px;
          left: ${-(0.07 * gridSize)}px;
          width: ${1.14 * gridSize}px;
        }
      `}</style>
      <div className="backing" />
      <img
        className="portrait"
        title={name}
        alt={name}
        src={`${staticUrl}75px-Icon_Portrait_${encodeURIComponent(name)}.png`}
        srcSet={`
          ${staticUrl}113px-Icon_Portrait_${encodeURIComponent(name)}.png 113w,
          ${staticUrl}150px-Icon_Portrait_${encodeURIComponent(name)}.png 150w
        `}
        sizes={`${gridSize}px`}
      />
      <div className="frame">
        <Frame rarity={rarity} />
      </div>
      {weaponType && <img
        className="class"
        title={weaponType}
        src={`${staticUrl}35px-Icon_Class_${weaponTypeUri}.png`}
        srcSet={`
          ${staticUrl}35px-Icon_Class_${weaponTypeUri}.png 35w,
          ${staticUrl}Icon_Class_${weaponTypeUri}.png 56w
        `}
        sizes="20px"
      />}
    </div>
  );
};

export default HeroPortrait;

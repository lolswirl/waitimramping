import type spell from '@data/spells/spell';
import type { Stats } from '@data/shared/stats';
import type { SpecTalentConfig } from '@data/specs/monk/mistweaver/defaultTalents';
import type CorePassive from '@data/core-passives/core-passive';
import MISTWEAVER from '@data/specs/monk/mistweaver';
import DISCIPLINE from '@data/specs/priest/discipline';
import HOLY_PRIEST from '@data/specs/priest/holy';
import RESTO_DRUID from '@data/specs/druid/restoration/druid';
import RESTO_SHAMAN from '@data/specs/shaman/restoration';
import PRESERVATION from '@data/specs/evoker/preservation';
import HOLY_PALADIN from '@data/specs/paladin/holy';
import type { Bug } from '@data/bugs';

type ClassInfo<TSpecs extends Record<string, specialization>> = {
  name: string;
  color: string;
  SPECS: TSpecs;
}

export interface specialization {
  key: string; // unique key - class + spec name, e.g. "monk_mistweaver"
  spells: Record<string, spell>;
  talents?: Record<string, spell>;
  icon: string;
  name: string;
  class: string;
  color: string;
  stats: Stats;
  masteryCoefficient: number;
  corePassives?: CorePassive[];
  defaultTalents?: SpecTalentConfig;
  tierSet?: Map<spell, boolean>;
  buffs?: (spellList: spell[]) => spell[];

  getSpell?: (spellName: string) => spell | undefined;
  getTalent?: (talentName: string) => spell | undefined;

  rotations?: Record<string, spell[]>;
  bugs?: Bug[];
}

export const CLASSES = {
  MONK: {
    name: 'Monk',
    color: '#00cc77',
    SPECS: {
      MISTWEAVER: MISTWEAVER,
    },
  },
  PRIEST: {
    name: 'Priest',
    color: '#fffff6',
    SPECS: {
      DISCIPLINE: DISCIPLINE,
      HOLY: HOLY_PRIEST,
    },
  },
  DRUID: {
    name: 'Druid',
    color: '#ff7c0a',
    SPECS: {
      RESTORATION: RESTO_DRUID,
    },
  },
  SHAMAN: {
    name: 'Shaman',
    color: '#0070dd',
    SPECS: {
      RESTORATION: RESTO_SHAMAN,
    },
  },
  EVOKER: {
    name: 'Evoker',
    color: '#33937f',
    SPECS: {
      PRESERVATION: PRESERVATION,
    },
  },
  PALADIN: {
    name: 'Paladin',
    color: '#f48cba',
    SPECS: {
      HOLY: HOLY_PALADIN,
    },
  },
} satisfies Record<string, ClassInfo<Record<string, specialization>>>;

export function getSpec(className: keyof typeof CLASSES, specName: string) {
  const classData = CLASSES[className];
  if (!classData) {
    return undefined;
  }

  const spec = classData[specName as keyof typeof classData];
  return spec;
}

export function getSpecs(): specialization[] {
  return Object.values(CLASSES).flatMap(c => Object.values(c.SPECS));
}

export const getSpecializationByKey = (key: string): specialization | undefined => {
  for (const classData of Object.values(CLASSES)) {
    for (const spec of Object.values(classData.SPECS)) {
      if (spec.key === key) {
        return spec;
      }
    }
  }
  return undefined;
};


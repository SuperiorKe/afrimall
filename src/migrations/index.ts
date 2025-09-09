import * as migration_20250909_183009 from './20250909_183009';

export const migrations = [
  {
    up: migration_20250909_183009.up,
    down: migration_20250909_183009.down,
    name: '20250909_183009'
  },
];

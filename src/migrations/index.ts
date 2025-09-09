import * as migration_20250909_185048 from './20250909_185048';

export const migrations = [
  {
    up: migration_20250909_185048.up,
    down: migration_20250909_185048.down,
    name: '20250909_185048'
  },
];

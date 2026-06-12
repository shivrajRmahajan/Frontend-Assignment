import { SeedUser } from '../models/user.model';

/**
 * Mock user "table" — stands in for a backend users table.
 *
 * Passwords are stored ONLY as SHA-256 hex digests (Web Crypto), never plain
 * text. Login hashes the typed password and compares digests. The plain-text
 * values below are documented in the README for demo purposes only.
 *
 *   aisha@store.example / Admin@123   (admin)
 *   rohan@store.example / Admin@234   (admin)
 *   priya@store.example / User@123    (user)
 *   karan@store.example / User@234    (user)
 */
export const SEED_USERS: readonly SeedUser[] = [
  {
    email: 'aisha@store.example',
    name: 'Aisha Khan',
    role: 'admin',
    passwordHash: 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7',
  },
  {
    email: 'rohan@store.example',
    name: 'Rohan Mehta',
    role: 'admin',
    passwordHash: 'db77ad54c2a5c4f0e9cc39a4ed3abf309ad9e1dd957222ed891b75de6d44a66d',
  },
  {
    email: 'priya@store.example',
    name: 'Priya Sharma',
    role: 'user',
    passwordHash: '3e7c19576488862816f13b512cacf3e4ba97dd97243ea0bd6a2ad1642d86ba72',
  },
  {
    email: 'karan@store.example',
    name: 'Karan Patel',
    role: 'user',
    passwordHash: '4681a821b209f408c1ba30608640063766b9d46d278710a843fa7cb9f4c6687d',
  },
];

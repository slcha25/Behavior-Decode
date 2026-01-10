
import { User } from '../types';

const USERS_DB_KEY = 'behaviordecode_users_db';
const SESSION_KEY = 'behaviordecode_current_session';

export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 1000));
  
  const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
  if (db[email]) throw new Error('User already exists');

  const names = name.split(' ');
  const firstName = names[0] || '';
  const lastName = names.slice(1).join(' ') || '';

  const newUser: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name,
    firstName,
    lastName,
    phone: '',
    createdAt: new Date().toISOString()
  };

  db[email] = { ...newUser, password }; // In real app, never store plain text password
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  await new Promise(r => setTimeout(r, 1000));
  
  const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
  const user = db[email];

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }

  const { password: _, ...userWithoutPassword } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
  return userWithoutPassword as User;
};

export const updateUserProfile = async (updatedData: Partial<User>): Promise<User> => {
  await new Promise(r => setTimeout(r, 800));
  const current = getCurrentUser();
  if (!current) throw new Error('Not logged in');

  const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
  const userRecord = db[current.email];
  
  const updatedUser = { ...userRecord, ...updatedData };
  updatedUser.name = `${updatedUser.firstName} ${updatedUser.lastName}`.trim() || updatedUser.name;
  
  db[current.email] = updatedUser;
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  
  const { password: _, ...userWithoutPassword } = updatedUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
  return userWithoutPassword as User;
};

export const changePassword = async (email: string, newPassword: string): Promise<boolean> => {
  await new Promise(r => setTimeout(r, 1200));
  const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
  if (!db[email]) throw new Error('User not found');
  
  db[email].password = newPassword;
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(db));
  return true;
};

export const resetPassword = async (email: string): Promise<boolean> => {
  await new Promise(r => setTimeout(r, 1500));
  const db = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
  if (!db[email]) throw new Error('User not found');
  // Simulate sending email
  return true;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

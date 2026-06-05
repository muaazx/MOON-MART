import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/lib/data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface IMockDb {
  categories: any[];
  products: any[];
  users: any[];
  orders: any[];
}

const defaultDb: IMockDb = {
  categories: [],
  products: [],
  users: [],
  orders: [],
};

// Helper to read database
export function readDb(): IMockDb {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
      return defaultDb;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading mock database:', error);
    return defaultDb;
  }
}

// Helper to write database
export function writeDb(data: IMockDb): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing mock database:', error);
  }
}

// Check if MongoDB is actually working
let isDbConnectedReal = false;
let hasCheckedConnection = false;

export async function checkRealDbConnection(): Promise<boolean> {
  if (hasCheckedConnection) {
    return isDbConnectedReal;
  }
  
  const dbConnect = (await import('@/lib/db')).default;
  try {
    // Attempt real database connection with a 3 second timeout
    const connPromise = dbConnect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timeout')), 3000)
    );
    
    await Promise.race([connPromise, timeoutPromise]);
    isDbConnectedReal = true;
    console.log('MongoDB Atlas: Successfully connected.');
  } catch (error) {
    isDbConnectedReal = false;
    console.warn('MongoDB Atlas connection failed. Falling back to local Mock JSON database.');
  }
  
  hasCheckedConnection = true;
  return isDbConnectedReal;
}

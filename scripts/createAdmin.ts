import bcrypt from 'bcryptjs';
import { readDb, writeDb } from '../src/lib/mockDb';

const createAdmin = async () => {
  const email = 'admin@moonmart.com';
  const password = 'AdminPassword123!';
  
  const db = readDb();
  
  // Check if admin already exists
  const existingUserIndex = db.users.findIndex(u => u.email === email);
  
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  if (existingUserIndex >= 0) {
    db.users[existingUserIndex].password = passwordHash;
    db.users[existingUserIndex].role = 'admin';
    console.log('Updated existing admin user.');
  } else {
    db.users.push({
      _id: `user_admin_${Date.now()}`,
      name: 'Administrator',
      email: email,
      password: passwordHash,
      role: 'admin',
      addresses: [],
      createdAt: new Date().toISOString(),
    });
    console.log('Created new admin user.');
  }
  
  writeDb(db);
  console.log(`Admin Email: ${email}`);
  console.log(`Admin Password: ${password}`);
};

createAdmin();

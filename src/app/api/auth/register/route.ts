import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { checkRealDbConnection, readDb, writeDb } from '@/lib/mockDb';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Please provide all details' }, { status: 400 });
    }

    const emailLower = email.toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const isRealDbConnected = await checkRealDbConnection();

    if (isRealDbConnected) {
      await dbConnect();
      const existingUser = await User.findOne({ email: emailLower });

      if (existingUser) {
        return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
      }

      const user = await User.create({
        name,
        email: emailLower,
        password: passwordHash,
        role: 'customer',
        addresses: [],
      });

      return NextResponse.json({
        success: true,
        message: 'Account registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } else {
      const db = readDb();
      const existingUser = db.users.find((u) => u.email.toLowerCase() === emailLower);

      if (existingUser) {
        return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
      }

      const newUser = {
        _id: `user_${Date.now()}`,
        name,
        email: emailLower,
        password: passwordHash,
        role: 'customer',
        addresses: [],
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);
      writeDb(db);

      return NextResponse.json({
        success: true,
        message: 'Local mock account registered successfully',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

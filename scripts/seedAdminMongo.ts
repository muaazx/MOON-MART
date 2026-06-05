import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


// Simple User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'customer' },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const seedAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected.');

    const email = 'admin@moonmart.com';
    const password = 'AdminPassword123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.password = passwordHash;
      existingUser.role = 'admin';
      await existingUser.save();
      console.log('Admin user updated in MongoDB.');
    } else {
      await User.create({
        name: 'Administrator',
        email,
        password: passwordHash,
        role: 'admin',
      });
      console.log('New admin user created in MongoDB.');
    }

    console.log(`Credentials: ${email} / ${password}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

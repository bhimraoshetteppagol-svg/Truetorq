import mongoose from 'mongoose';

const uri = 'mongodb+srv://user:user@truetorq.qitevte.mongodb.net/?appName=TrueTorq';
const dbName = 'protorq';

const names = [
  'Aarav Sharma',
  'Vivaan Patel',
  'Aditya Rao',
  'Rohan Mehta',
  'Karan Malhotra',
  'Ananya Gupta',
  'Priya Nair',
  'Sneha Iyer',
  'Rahul Verma',
  'Neha Kapoor',
  'Siddharth Jain',
  'Ishita Sen',
  'Arjun Kulkarni',
  'Pooja Singh',
  'Nikhil Desai',
  'Meera Joshi',
  'Akash Bansal',
  'Ritika Das',
  'Varun Khanna',
  'Kavya Menon',
];

const pickName = () => names[Math.floor(Math.random() * names.length)];

async function run() {
  await mongoose.connect(uri, { dbName });
  const users = mongoose.connection.db.collection('users');

  const allUsers = await users.find({}).toArray();
  let updatedUsers = 0;

  for (const user of allUsers) {
    if (!user.name || String(user.name).trim() === '') {
      await users.updateOne({ _id: user._id }, { $set: { name: pickName() } });
      updatedUsers += 1;
    }
  }

  const sample = await users
    .find({}, { projection: { email: 1, role: 1, name: 1 } })
    .limit(10)
    .toArray();

  console.log(
    JSON.stringify(
      {
        totalUsers: allUsers.length,
        updatedUsers,
        sample,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore
  }
  process.exit(1);
});

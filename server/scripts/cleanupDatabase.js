import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export async function purgeMockData() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devpulse';
  console.log(`\n🧹 Starting Database Purge on: ${mongoURI}`);

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 10000 });
      console.log('✓ Connected to MongoDB');
    }

    const db = mongoose.connection.db;

    // 1. Identify Demo Users to permanently remove
    const demoNames = [
      'Aditya Sharma',
      'Priya Verma',
      'Rohan Mehta',
      'Ananya Rao',
      'Karan Singh',
      'Neha Patel'
    ];
    const demoEmails = ['umesh@example.com'];
    const fakeProblemCounts = [2341, 1980, 1876, 1284, 1120, 1045, 982];

    const deleteFilter = {
      $or: [
        { name: { $in: demoNames } },
        { email: { $in: demoEmails } },
        { 'stats.problemsSolved': { $in: fakeProblemCounts } }
      ]
    };

    const usersToDelete = await db.collection('users').find(deleteFilter).toArray();
    console.log(`Found ${usersToDelete.length} seeded/mock users to purge:`);
    const deletedUserIds = [];

    for (const u of usersToDelete) {
      // Don't delete real user if by any chance their email matches real user
      if (u.email === 's.umeshsaihanumaprasad@gmail.com') {
        console.log(`⚠️ Preserving real authenticated user: ${u.email}`);
        continue;
      }
      deletedUserIds.push(u._id);
      console.log(`  - Deleting mock user: ${u.name} (${u.email || 'no-email'}) ID: ${u._id}`);
    }

    if (deletedUserIds.length > 0) {
      const userDelResult = await db.collection('users').deleteMany({ _id: { $in: deletedUserIds } });
      console.log(`✓ Deleted ${userDelResult.deletedCount} mock users from 'users' collection.`);

      // Also delete associated platformstats
      const statsDelResult = await db.collection('platformstats').deleteMany({
        userId: { $in: deletedUserIds }
      });
      console.log(`✓ Deleted ${statsDelResult.deletedCount} platform stats entries belonging to mock users.`);
    }

    // Also delete any orphan platformstats with handles from seedData
    const demoHandles = ['umesh-dev', 'umesh_algo', 'umesh_cc', 'umesh_hr', 'umesh_gfg', 'umesh_atc'];
    const handleDelResult = await db.collection('platformstats').deleteMany({
      handle: { $in: demoHandles }
    });
    if (handleDelResult.deletedCount > 0) {
      console.log(`✓ Deleted ${handleDelResult.deletedCount} demo platformstats by seed handle.`);
    }

    // Also purge hardcoded fallback problems ('Two Sum', 'LRU Cache Implementation', 'Reverse Linked List', 'Valid Parentheses')
    const fallbackProblemTitles = ['Two Sum', 'LRU Cache Implementation', 'Reverse Linked List', 'Valid Parentheses'];
    const problemDelResult = await db.collection('problems').deleteMany({
      $or: [
        { problemId: { $in: ['p1', 'p2', 'p3', 'p4'] } },
        { title: { $in: fallbackProblemTitles }, isCustom: { $ne: true } },
        { title: { $in: fallbackProblemTitles }, userId: null }
      ]
    });
    if (problemDelResult.deletedCount > 0) {
      console.log(`✓ Deleted ${problemDelResult.deletedCount} hardcoded fallback problems.`);
    }

    // 2. Clean up real users: remove hardcoded Vishnu default and calculate real rating
    const realUsers = await db.collection('users').find({}).toArray();
    for (const rUser of realUsers) {
      const updates = {};
      // If college is still the fake seeded Vishnu string, clear or reset
      if (rUser.college === 'B.Tech CSE (AI & ML) • Vishnu Institute of Technology') {
        updates.college = '';
      }

      // Check if rating was hardcoded to 1845
      if (rUser.stats) {
        const solved = rUser.stats.problemsSolved || 0;
        const streak = rUser.stats.currentStreak || 0;
        const repos = rUser.stats.totalRepositories || 0;
        
        let newRating = rUser.stats.rating;
        if (newRating === 1845 && solved !== 1284) {
          // Recalculate real rating based on actual stats
          const easy = rUser.stats.easySolved || Math.round(solved * 0.55);
          const med = rUser.stats.mediumSolved || Math.round(solved * 0.4);
          const hard = rUser.stats.hardSolved || Math.max(0, solved - easy - med);
          newRating = Math.round(easy * 8 + med * 18 + hard * 35 + streak * 5 + Math.min(repos * 8, 250));
          updates['stats.rating'] = newRating;
        } else if (solved === 0 && repos === 0) {
          updates['stats.rating'] = 0;
        }

        // Clean mock growth strings if present
        if (rUser.stats.problemsGrowth === '+12% this month' && solved === 0) {
          updates['stats.problemsGrowth'] = '+0%';
        }
        if (rUser.stats.streakGrowth === '+5 days' && streak === 0) {
          updates['stats.streakGrowth'] = '+0 days';
        }
      }

      // Purge any legacy demo projects (SkyGuard, ReCover, LegalMind)
      if (Array.isArray(rUser.projects) && rUser.projects.length > 0) {
        const demoTitles = ['skyguard ai', 'recover ai', 'legalmind'];
        const filteredProjects = rUser.projects.filter(p => {
          const t = (p.title || p.name || '').toLowerCase();
          return !demoTitles.some(d => t.includes(d));
        });
        if (filteredProjects.length !== rUser.projects.length) {
          updates.projects = filteredProjects;
          console.log(`✓ Purged ${rUser.projects.length - filteredProjects.length} mock projects from user: ${rUser.email}`);
        }
      }

      // Ensure clean username exists for portfolio URL
      if (!rUser.username) {
        const generatedUsername = rUser.email ? rUser.email.split('@')[0].toLowerCase() : (rUser.name ? rUser.name.toLowerCase().replace(/\s+/g, '-') : 'developer');
        updates.username = generatedUsername;
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('users').updateOne(
          { _id: rUser._id },
          { $set: updates }
        );
        console.log(`✓ Cleaned mock defaults for user: ${rUser.email}`, updates);
      }
    }

    const remainingUsers = await db.collection('users').find({}).toArray();
    console.log(`\n🎉 Purge Complete! Remaining registered real users: ${remainingUsers.length}`);
    remainingUsers.forEach(u => {
      console.log(`  - ${u.name} (${u.email}) | Problems: ${u.stats?.problemsSolved || 0} | Streak: ${u.stats?.currentStreak || 0} | Rating: ${u.stats?.rating || 0}`);
    });

    return true;
  } catch (err) {
    console.error('❌ Database Purge Error:', err.message);
    throw err;
  }
}

// Run immediately if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  purgeMockData()
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

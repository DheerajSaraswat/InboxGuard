import cron from "node-cron";
import admin from "../config/firebaseAdmin.js";
import { User } from "../schema/user.schema.js";

export const cleanupUnverifiedUsers = async () => {
  const expiry = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago

  const staleUsers = await User.find({
    emailVerified: false,
    createdAt: { $lt: expiry },
  });

  for (const user of staleUsers) {
    try {
      // Delete from Firebase
      await admin.auth().deleteUser(user.firebaseUid);

      // Delete from MongoDB
      await User.deleteOne({ _id: user._id });

      console.log(`Deleted unverified user: ${user.email}`);
    } catch (err) {
      console.error(`Failed to delete user ${user.email}:`, err);
    }
  }
};

// Run every hour on the hour
cron.schedule("0 * * * *", async () => {
  console.log("Running cleanup job...");
  await cleanupUnverifiedUsers();
});

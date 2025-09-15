import admin from "../config/firebaseAdmin.js";
import { User } from "../schema/user.schema.js";

export const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = await admin.auth().verifyIdToken(token);

    // Attach user data to request
    req.user = decoded;

    // Keep MongoDB in sync with Firebase
    if (decoded.email_verified) {
      await User.updateOne(
        { firebaseUid: decoded.uid },
        { $set: { emailVerified: true } }
      );
    }

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

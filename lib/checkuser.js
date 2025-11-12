import { currentUser } from "@clerk/nextjs/server";
import User from "@/models/User";
import { connectDB } from "./connectDB";

export const checkUser = async () => {
  try {
    await connectDB();

    const clerkUser = await currentUser();

    if (!clerkUser) {
      console.log("❌ No authenticated user found");
      return null;
    }
    let user = await User.findOne({ clerkUserId: clerkUser.id });

    if (!user) {
      console.log("ℹ️ User not found in DB, creating new user");

      user = await User.create({
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        imageUrl: clerkUser.imageUrl,
      });
      return user;
    } else {
      console.log("✅ Existing user found:", user.email);
    }

    return user;
  } catch (error) {
    console.error("❌ Error in checkUser:", error.message);
  }
};

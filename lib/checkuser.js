import { currentUser } from "@clerk/nextjs/server";
import User from "@/models/User";
import { connectDB } from "./connectDB";

export const checkUser = async () => {
  try {
    await connectDB();

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }
    let user = await User.findOne({ clerkUserId: clerkUser.id });

    if (!user) {

      user = await User.create({
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        imageUrl: clerkUser.imageUrl,
      });
      return user;
    } else {
    }

    return user;
  } catch (error) {
    
  }
};

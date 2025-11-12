"use client";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "@/store/features/userSlice";
import { checkUser } from "@/lib/checkuser"; 

export default function UserProvider() {
  const { user, isSignedIn } = useUser();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleUser = async () => {
      if (isSignedIn && user) {
        const dbUser = await checkUser(user);
        dispatch(setUser(dbUser));
      } else {
        dispatch(clearUser());
      }
    };
    handleUser();
  }, [isSignedIn, user, dispatch]);

  return null;
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { getFilePreview } from "@/lib/appwrite/api";

const Topbar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  // Convert fileId to URL if needed
  useEffect(() => {
    if (user?.imageUrl) {
      const imageUrlValue = Array.isArray(user.imageUrl) 
        ? user.imageUrl[0]
        : user.imageUrl;

      if (imageUrlValue) {
        // If it's not already a URL, convert it
        if (!String(imageUrlValue).startsWith("http")) {
          try {
            const url = getFilePreview(String(imageUrlValue));
            if (url) {
              setProfileImageUrl(url);
            }
          } catch (error) {
            setProfileImageUrl(imageUrlValue);
          }
        } else {
          setProfileImageUrl(String(imageUrlValue));
        }
      }
    }
  }, [user?.imageUrl]);

  return (
    <section className="topbar">
      <div className="flex-between py-4 px-5">
        <Link to="/" className="flex gap-3 items-center">
        </Link>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            className="shad-button_ghost"
            onClick={() => signOut()}>
            <img src="/assets/icons/logout.svg" alt="logout" />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
            <img
              src={profileImageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profile"
              className="h-8 w-8 rounded-full object-cover"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;

import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { Button } from "../ui/button";
import { getFilePreview } from "@/lib/appwrite/api";
import { useUserContext } from "@/context/AuthContext";
import { useFollowUser, useUnfollowUser } from "@/lib/react-query/queries";

type UserCardProps = {
  user: Models.Document;
};

const UserCard = ({ user }: UserCardProps) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [isFollowing, setIsFollowing] = useState(false);
  const { user: currentUser } = useUserContext();
  const { mutate: followUser } = useFollowUser();
  const { mutate: unfollowUser } = useUnfollowUser();

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

    // Check if current user is following this user
    if (currentUser?.id && user?.followers) {
      setIsFollowing(user.followers.includes(currentUser.id));
    }
  }, [user?.imageUrl, user?.followers, currentUser?.id]);

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser?.id || !user?.$id) return;

    if (isFollowing) {
      unfollowUser({ followerId: currentUser.id, followingId: user.$id });
    } else {
      followUser({ followerId: currentUser.id, followingId: user.$id });
    }

    setIsFollowing(!isFollowing);
  };

  return (
    <Link to={`/profile/${user.$id}`} className="user-card">
      <img
        src={profileImageUrl || "/assets/icons/profile-placeholder.svg"}
        alt="creator"
        className="rounded-full w-14 h-14 object-cover object-center"
      />

      <div className="flex-center flex-col gap-1">
        <p className="base-medium text-light-1 text-center line-clamp-1">
          {user.name}
        </p>
        <p className="small-regular text-light-3 text-center line-clamp-1">
          @{user.username}
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        className={`${isFollowing ? "shad-button_ghost" : "shad-button_primary"} px-5`}
        onClick={handleFollow}
      >
        {isFollowing ? "Following" : "Follow"}
      </Button>
    </Link>
  );
};

export default UserCard;

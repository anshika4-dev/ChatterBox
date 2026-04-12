import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui";
import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useGetUserPosts } from "@/lib/react-query/queries";
import { GridPostList, Loader } from "@/components/shared";
import { getFilePreview } from "@/lib/appwrite/api";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");

  const { data: currentUser } = useGetUserById(id || "");
  const { data: userPosts } = useGetUserPosts(id || "");

  // Convert fileId to preview URL if needed
  useEffect(() => {
    if (currentUser?.imageUrl) {
      const imageUrlValue = Array.isArray(currentUser.imageUrl) 
        ? currentUser.imageUrl[0] 
        : currentUser.imageUrl;

      if (imageUrlValue) {
        // If it looks like a fileId (short string without http), convert it to URL
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
          // It's already a full URL
          setProfileImageUrl(String(imageUrlValue));
        }
      }
    }
  }, [currentUser?.imageUrl]);

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const posts = userPosts?.documents || [];

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={
              profileImageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full object-cover object-center"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser?.name || ""}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser?.username || ""}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={posts.length} label="Posts" />
              <StatBlock value={0} label="Followers" />
              <StatBlock value={0} label="Following" />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user?.id !== currentUser?.$id && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser?.$id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${
                  user?.id !== currentUser?.$id && "hidden"
                }`}>
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Edit Profile
                </p>
              </Link>
            </div>
            <div className={`${user?.id === id && "hidden"}`}>
              <Button type="button" className="shad-button_primary px-8">
                Follow
              </Button>
            </div>
          </div>
        </div>
      </div>

      {currentUser?.$id === user?.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Liked Posts
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={
            posts && Array.isArray(posts) ? (
              <GridPostList 
                posts={posts.filter((post: any) => post && post?.$id)} 
                showUser={false} 
              />
            ) : (
              <p className="text-light-4">No posts yet</p>
            )
          }
        />
        {currentUser?.$id === user?.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;

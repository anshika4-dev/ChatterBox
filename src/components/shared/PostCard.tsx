import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { PostStats } from "@/components/shared";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { databases } from "@/lib/appwrite/config";
import { appwriteConfig } from "@/lib/appwrite/config";
import { getFilePreview } from "@/lib/appwrite/api";

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const [creator, setCreator] = useState<any>(post.creator || null);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (post.creator) {
      setCreator(post.creator);
    } else if (post.userId) {
      // Fetch creator info if not embedded
      databases
        .getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, post.userId)
        .then((userData) => {
          setCreator(userData);
        })
        .catch((error) => {
          console.log("Error fetching creator:", error);
          // Set fallback creator if fetch fails
          setCreator({ $id: post.userId, name: "Unknown User", imageUrl: "" });
        });
    }
  }, [post]);

  // Get image URL from imageId or imageUrl
  useEffect(() => {
    if (post.imageId || post.imageUrl) {
      const imageId = post.imageId || post.imageUrl;
      try {
        // Get the download URL from Appwrite
        const url = getFilePreview(imageId);
        if (url) {
          console.log("Setting image URL for post:", post.$id, "Image ID:", imageId, "URL:", url);
          setImageUrl(url);
        }
      } catch (error) {
        console.log("Error getting image preview:", error);
      }
    }
  }, [post.imageId, post.imageUrl]);

  return (
    <div className="post-card">
      <div className="flex-between">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${creator?.$id || ""}`}>
            <img
              src={
                creator?.imageUrl?.[0] 
                  ? getFilePreview(creator.imageUrl[0])
                  : "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                console.log("PFP failed to load. Creator data:", creator);
                console.log("PFP imageUrl[0]:", creator?.imageUrl?.[0]);
                (e.target as HTMLImageElement).src = "/assets/icons/profile-placeholder.svg";
              }}
            />
          </Link>

          <div className="flex flex-col">
            <p className="base-medium lg:body-bold text-light-1">
              {creator?.name || "Loading..."}
            </p>
            <div className="flex-center gap-2 text-light-3">
              <p className="subtle-semibold lg:small-regular ">
                {multiFormatDateString(post.$createdAt)}
              </p>
              •
              <p className="subtle-semibold lg:small-regular">
                {post.location || ""}
              </p>
            </div>
          </div>
        </div>

        <Link
          to={`/update-post/${post.$id}`}
          className={`${user?.id !== creator?.$id && "hidden"}`}>
          <img
            src={"/assets/icons/edit.svg"}
            alt="edit"
            width={20}
            height={20}
          />
        </Link>
      </div>

      <Link to={`/posts/${post.$id}`}>
        <div className="small-medium lg:base-medium py-5">
          <p>{post.caption}</p>
          <ul className="flex gap-1 mt-2">
            {(typeof post.tags === "string" 
              ? post.tags.split(",").filter(Boolean) 
              : post.tags || []
            ).map((tag: string, index: string) => (
              <li key={`${tag}${index}`} className="text-light-3 small-regular">
                #{tag}
              </li>
            ))}
          </ul>
        </div>

        <img
          src={imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="post image"
          className="post-card_img"
          crossOrigin="anonymous"
          onError={(e) => {
            console.log("Image failed to load:", imageUrl);
            (e.target as HTMLImageElement).src = "/assets/icons/profile-placeholder.svg";
          }}
        />
      </Link>

      <PostStats post={post} userId={user?.id || ""} />
    </div>
  );
};

export default PostCard;

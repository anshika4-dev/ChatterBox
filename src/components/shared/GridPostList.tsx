import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { PostStats } from "@/components/shared";
import { useUserContext } from "@/context/AuthContext";
import { getFilePreview } from "@/lib/appwrite/api";

type GridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
  const { user } = useUserContext();

  // Filter out undefined posts
  const validPosts = (posts || []).filter(post => post && post.$id);

  return (
    <ul className="grid-container">
      {validPosts.map((post) => (
        <GridPostItem 
          key={post.$id} 
          post={post} 
          showUser={showUser} 
          showStats={showStats}
          userId={user?.id || ""}
        />
      ))}
    </ul>
  );
};

const GridPostItem = ({ 
  post, 
  showUser, 
  showStats, 
  userId 
}: {
  post: Models.Document;
  showUser: boolean;
  showStats: boolean;
  userId: string;
}) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    if (post?.imageId || post?.imageUrl) {
      const imageId = post.imageId || post.imageUrl;
      try {
        const url = getFilePreview(imageId);
        if (url) {
          setImageUrl(url);
        }
      } catch (error) {
        console.log("Error loading image:", error);
      }
    }
  }, [post?.imageId, post?.imageUrl]);

  return (
    <li className="relative min-w-80 h-80">
      <Link to={`/posts/${post?.$id}`} className="grid-post_link">
        <img
          src={imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt="post"
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="grid-post_user">
        {showUser && post?.creator && (
          <div className="flex items-center justify-start gap-2 flex-1">
            <img
              src={
                post.creator?.imageUrl?.[0]
                  ? getFilePreview(post.creator.imageUrl[0])
                  : "/assets/icons/profile-placeholder.svg"
              }
              alt="creator"
              className="w-8 h-8 rounded-full"
            />
            <p className="line-clamp-1">{post.creator?.name}</p>
          </div>
        )}
        {showStats && <PostStats post={post} userId={userId} />}
      </div>
    </li>
  );
};

export default GridPostList;

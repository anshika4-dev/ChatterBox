import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui";
import { Loader } from "@/components/shared";
import { GridPostList, PostStats } from "@/components/shared";

import {
  useGetPostById,
  useGetUserPosts,
} from "@/lib/react-query/queries";
import { multiFormatDateString } from "@/lib/utils";
import { useUserContext } from "@/context/AuthContext";
import { getFilePreview } from "@/lib/appwrite/api";
import { databases } from "@/lib/appwrite/config";
import { appwriteConfig } from "@/lib/appwrite/config";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();

  const { data: post, isLoading } = useGetPostById(id);
  const [creator, setCreator] = useState<any>(post?.creator || null);

  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.userId || creator?.$id
  );

  useEffect(() => {
    if (post?.creator) {
      setCreator(post.creator);
    } else if (post?.userId) {
      // Fetch creator info if not embedded
      databases
        .getDocument(appwriteConfig.databaseId, appwriteConfig.userCollectionId, post.userId)
        .then((userData) => {
          setCreator(userData);
        })
        .catch((error) => {
          console.log("Error fetching creator:", error);
        });
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post_details-container">
        <p className="text-light-1">Post not found</p>
      </div>
    );
  }

  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  return (
    <div className="post_details-container">
      <div className="hidden md:flex max-w-5xl w-full">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="shad-button_ghost">
          <img
            src={"/assets/icons/back.svg"}
            alt="back"
            width={24}
            height={24}
          />
          <p className="small-medium lg:base-medium">Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img
            src={
              post?.imageId
                ? getFilePreview(post.imageId)
                : post?.imageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt="creator"
            className="post_details-img"
            onError={(e) => {
              console.log("Post details image failed to load:", post?.imageUrl, post?.imageId);
              (e.target as HTMLImageElement).src = "/assets/icons/profile-placeholder.svg";
            }}
          />

          <div className="post_details-info">
            <div className="flex-between w-full">
              <Link
                to={`/profile/${creator?.$id || post?.userId}`}
                className="flex items-center gap-3">
                <img
                  src={
                    creator?.imageUrl?.[0]
                      ? getFilePreview(creator.imageUrl[0])
                      : "/assets/icons/profile-placeholder.svg"
                  }
                  alt="creator"
                  className="w-8 h-8 lg:w-12 lg:h-12 rounded-full"
                />
                <div className="flex gap-1 flex-col">
                  <p className="base-medium lg:body-bold text-light-1">
                    {creator?.name || "Unknown User"}
                  </p>
                  <div className="flex-center gap-2 text-light-3">
                    <p className="subtle-semibold lg:small-regular ">
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    •
                    <p className="subtle-semibold lg:small-regular">
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

                          </div>

            <hr className="border w-full border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {(typeof post?.tags === "string" 
                  ? post.tags.split(",").filter(Boolean) 
                  : Array.isArray(post?.tags) ? post.tags : []
                ).map((tag: string, index: number) => (
                  <li
                    key={`${tag}${index}`}
                    className="text-light-3 small-regular">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <hr className="border w-full border-dark-4/80" />

        <h3 className="body-bold md:h3-bold w-full my-10">
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;

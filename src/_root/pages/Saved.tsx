import { Models } from "appwrite";
import { useState, useEffect } from "react";

import { GridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser, useGetSavedPosts } from "@/lib/react-query/queries";
import { getPostById } from "@/lib/appwrite/api";

const Saved = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: savedPostsData, isLoading: isSavedLoading } = useGetSavedPosts(currentUser?.$id);
  const [posts, setPosts] = useState<Models.Document[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!savedPostsData?.documents || savedPostsData.documents.length === 0) {
        setPosts([]);
        return;
      }

      setIsLoadingPosts(true);
      try {
        const postPromises = savedPostsData.documents
          .map((savedPost: any) => savedPost.postId)
          .filter(Boolean)
          .map((postId: string) => getPostById(postId));

        const fetchedPosts = await Promise.all(postPromises);
        const validPosts = fetchedPosts.filter((post): post is Models.Document => post !== undefined);
        setPosts(validPosts);
      } catch (error) {
        console.log("Error fetching saved posts:", error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [savedPostsData]);

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {!currentUser || isSavedLoading || isLoadingPosts ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {posts.length === 0 ? (
            <p className="text-light-4">No saved posts</p>
          ) : (
            <GridPostList posts={posts} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default Saved;

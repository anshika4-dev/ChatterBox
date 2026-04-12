import { GridPostList, Loader } from "@/components/shared";
import { useGetCurrentUser, useGetLikedPosts } from "@/lib/react-query/queries";

const LikedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();
  const { data: likedPosts, isLoading: isLikedPostsLoading } = useGetLikedPosts(currentUser?.$id);

  if (!currentUser || isLikedPostsLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const posts = likedPosts?.documents || [];

  return (
    <>
      {posts.length === 0 && (
        <p className="text-light-4">No liked posts</p>
      )}

      <GridPostList posts={posts} showStats={false} />
    </>
  );
};

export default LikedPosts;

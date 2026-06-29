import { useEffect, useState } from "react";
import useSocialStore from "../../stores/social-store";
import useAuthStore from "../../stores/auth-store";
import useStudyStore from "../../stores/study-store";
import CreatePostForm from "../../components/social/CreatePostForm";
import PostCard from "../../components/social/PostCard";
import CommentSection from "../../components/social/CommentSection";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Rss, RefreshCw } from "lucide-react";

export default function FeedPage() {
  const { feed, feedLoading, fetchFeed, likePost, deletePost } = useSocialStore();
  const { importNote } = useStudyStore();
  const user = useAuthStore((s) => s.user);
  const [openCommentsPostId, setOpenCommentsPostId] = useState(null);

  const handleImportNote = async (postId) => {
    try {
      await importNote(postId);
      alert("Successfully imported shared note into your AI Notebook!");
    } catch (err) {
      alert(err.message || "Failed to import note");
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  const handleToggleComments = (postId) => {
    setOpenCommentsPostId(openCommentsPostId === postId ? null : postId);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Student Feed</h1>
        <p className="text-xs text-zinc-500">See what your classmates are working on, ask questions, or share study materials.</p>
      </div>

      <CreatePostForm user={user} />

      <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Latest Activity</span>
        <button
          onClick={() => fetchFeed(1)}
          disabled={feedLoading}
          className="cursor-pointer text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold disabled:opacity-40"
        >
          <RefreshCw className={`h-3 w-3 ${feedLoading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {feedLoading && feed.length === 0 ? (
        <LoadingSpinner message="Fetching post feed..." />
      ) : feed.length === 0 ? (
        <EmptyState
          icon={Rss}
          title="Feed is empty"
          description="Be the first to post something, share an achievement, or ask a question!"
        />
      ) : (
        <div className="space-y-4">
          {feed.map((post) => (
            <div key={post._id} className="space-y-2">
              <PostCard
                post={post}
                currentUserId={user?._id}
                onLike={likePost}
                onDelete={deletePost}
                onToggleComments={handleToggleComments}
                onImportNote={handleImportNote}
              />
              {openCommentsPostId === post._id && (
                <div className="px-4">
                  <CommentSection postId={post._id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

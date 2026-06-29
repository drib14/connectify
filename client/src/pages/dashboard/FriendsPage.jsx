import { useEffect, useState } from "react";
import useSocialStore from "../../stores/social-store";
import FriendCard from "../../components/social/FriendCard";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { Users, Search, RefreshCw } from "lucide-react";

export default function FriendsPage() {
  const {
    friends,
    friendRequests,
    friendsLoading,
    searchResults,
    fetchFriends,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
  } = useSocialStore();

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    await searchUsers(query);
    setSearching(false);
  };

  const handleSendReq = async (userId) => {
    try {
      await sendFriendRequest(userId);
      alert("Friend request sent!");
      // Clean query
      setQuery("");
      searchUsers("");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Friends & classmates</h1>
        <p className="text-xs text-zinc-500">Connect with other students, collaborate in study groups, and track streaks together.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Search & Pending */}
        <div className="space-y-5">
          {/* Search form */}
          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200">Find Students</h3>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search usernames..."
                className="flex-1 bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={searching}
                className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-900">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Search Results</span>
                {searchResults.map((u) => (
                  <FriendCard key={u._id} friend={u} onSendRequest={handleSendReq} />
                ))}
              </div>
            )}
          </div>

          {/* Requests */}
          <div className="p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200">Friend Requests ({friendRequests.length})</h3>
            {friendRequests.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {friendRequests.map((req) => (
                  <FriendCard
                    key={req._id}
                    friend={req.requester}
                    relationshipId={req._id}
                    isRequest={true}
                    onAccept={acceptFriendRequest}
                    onDecline={removeFriend}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Friends List */}
        <div className="md:col-span-2 p-5 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold text-zinc-200">All Friends ({friends.length})</h3>
            <button
              onClick={fetchFriends}
              disabled={friendsLoading}
              className="cursor-pointer text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold disabled:opacity-40"
            >
              <RefreshCw className={`h-3 w-3 ${friendsLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {friendsLoading && friends.length === 0 ? (
            <LoadingSpinner message="Loading friends list..." />
          ) : friends.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No friends yet"
              description="Use the search bar on the left to find classmates and grow your study network."
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {friends.map((f) => {
                const isRequester = f.requester?._id;
                const friendInfo = isRequester ? f.recipient : f.requester;
                return (
                  <FriendCard
                    key={f._id}
                    friend={friendInfo}
                    relationshipId={f._id}
                    status="accepted"
                    onRemove={removeFriend}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

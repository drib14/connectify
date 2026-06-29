import { useEffect, useState, useRef } from "react";
import useSocialStore from "../../stores/social-store";
import useAuthStore from "../../stores/auth-store";
import GroupCard from "../../components/social/GroupCard";
import Avatar from "../../components/ui/Avatar";
import EmptyState from "../../components/ui/EmptyState";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { UsersRound, Plus, ArrowLeft, Send, RefreshCw, MessageSquare } from "lucide-react";

export default function StudyGroupsPage() {
  const {
    groups,
    groupsLoading,
    activeGroup,
    groupMessages,
    fetchGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    setActiveGroup,
    fetchGroupMessages,
    sendGroupMessage,
  } = useSocialStore();
  const user = useAuthStore((s) => s.user);

  // Form states
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [subject, setSubject] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [creating, setCreating] = useState(false);

  // Chat message input
  const [msgInput, setMsgInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Handle message list scrolling
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [groupMessages]);

  // Group chat message polling (every 5 seconds when in a group)
  useEffect(() => {
    if (!activeGroup) return;
    fetchGroupMessages(activeGroup._id);
    const interval = setInterval(() => {
      fetchGroupMessages(activeGroup._id);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeGroup, fetchGroupMessages]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;
    setCreating(true);
    try {
      await createGroup(name.trim(), desc.trim(), subject.trim(), isPublic);
      setName("");
      setDesc("");
      setSubject("");
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
  };

  const handleSendMsg = async (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeGroup || sendingMsg) return;
    const txt = msgInput.trim();
    setMsgInput("");
    setSendingMsg(true);
    try {
      await sendGroupMessage(activeGroup._id, txt);
    } catch (err) {
      console.error(err);
    }
    setSendingMsg(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Study Groups</h1>
          <p className="text-xs text-zinc-500">Collaborate with peers, ask questions, and solve assignments in real-time groups.</p>
        </div>
        {!activeGroup && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="cursor-pointer inline-flex h-9 px-4 items-center gap-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-all"
          >
            <Plus className="h-4 w-4" /> Create Group
          </button>
        )}
      </div>

      {activeGroup ? (
        /* Chat View */
        <div className="border border-zinc-900 bg-zinc-900/10 rounded-2xl p-5 flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto">
          {/* Group Header */}
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveGroup(null)}
                className="cursor-pointer text-zinc-400 hover:text-zinc-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-zinc-200">{activeGroup.name}</h3>
                <span className="text-[10px] text-zinc-500">{activeGroup.subject} Group</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to leave this group?")) {
                  leaveGroup(activeGroup._id);
                }
              }}
              className="cursor-pointer text-[10px] font-bold text-rose-500 hover:text-rose-400"
            >
              Leave Group
            </button>
          </div>

          {/* Messages Wrapper */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
            {groupMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <MessageSquare className="h-10 w-10 text-zinc-700 mb-2" />
                <p className="text-xs text-zinc-500">No messages in this group yet. Say hello to get started!</p>
              </div>
            ) : (
              groupMessages.map((m) => {
                const isMe = m.senderId?._id === user?._id;
                return (
                  <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-start gap-2.5`}>
                    {!isMe && <Avatar src={m.senderId?.avatar} name={m.senderId?.username} size="sm" />}
                    <div className={`max-w-[70%] rounded-xl px-3.5 py-2.5 text-xs ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-zinc-900 border border-zinc-850 text-zinc-200 rounded-tl-none"}`}>
                      {!isMe && <div className="text-[9px] font-bold text-indigo-400 mb-0.5">{m.senderId?.username}</div>}
                      <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat input form */}
          <form onSubmit={handleSendMsg} className="flex gap-2">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Send message to group chat..."
              className="flex-1 bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={sendingMsg || !msgInput.trim()}
              className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      ) : showCreate ? (
        /* Creator View */
        <div className="max-w-md p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-4">
          <h3 className="text-sm font-bold text-zinc-200">Create Study Group</h3>
          <form onSubmit={handleCreateGroup} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AP Calculus Study Squad"
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What will you study?"
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Math, Biology, Physics"
                className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-zinc-900 bg-zinc-950 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isPublic" className="text-xs text-zinc-400 font-semibold cursor-pointer">
                Public Group (anyone can join)
              </label>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                disabled={creating || !name || !subject}
                className="cursor-pointer flex-1 h-9 flex items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                {creating ? "Creating..." : "Create Group"}
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="cursor-pointer px-4 h-9 flex items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-xs font-semibold text-zinc-500 hover:text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Listing View */
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Browse Groups</span>
            <button
              onClick={fetchGroups}
              disabled={groupsLoading}
              className="cursor-pointer text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold disabled:opacity-40"
            >
              <RefreshCw className={`h-3 w-3 ${groupsLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {groupsLoading && groups.length === 0 ? (
            <LoadingSpinner message="Fetching groups..." />
          ) : groups.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="No study groups"
              description="Be the first to create a study group for your favorite subject."
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map((group) => (
                <GroupCard
                  key={group._id}
                  group={group}
                  currentUserId={user?._id}
                  onJoin={joinGroup}
                  onLeave={leaveGroup}
                  onOpen={setActiveGroup}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

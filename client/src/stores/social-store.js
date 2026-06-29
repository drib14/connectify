import { create } from "zustand";
import { apiFetch } from "../lib/api";

const useSocialStore = create((set, get) => ({
  // Feed
  feed: [],
  feedLoading: false,
  feedPage: 1,
  feedHasMore: true,

  fetchFeed: async (page = 1) => {
    set({ feedLoading: true });
    try {
      const res = await apiFetch(`/api/social/feed?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        if (page === 1) {
          set({ feed: data.posts, feedPage: 1, feedHasMore: data.hasMore });
        } else {
          set((s) => ({
            feed: [...s.feed, ...data.posts],
            feedPage: page,
            feedHasMore: data.hasMore,
          }));
        }
      }
    } catch (err) { console.error(err); }
    set({ feedLoading: false });
  },

  createPost: async (content, type = "study_tip", attachments = []) => {
    const res = await apiFetch("/api/social/posts", {
      method: "POST",
      body: JSON.stringify({ content, type, attachments }),
    });
    if (!res.ok) throw new Error("Failed to create post");
    const data = await res.json();
    set((s) => ({ feed: [data.post, ...s.feed] }));
    return data.post;
  },

  likePost: async (postId) => {
    const res = await apiFetch(`/api/social/posts/${postId}/like`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to like post");
    const data = await res.json();
    set((s) => ({
      feed: s.feed.map((p) => (p._id === postId ? data.post : p)),
    }));
  },

  deletePost: async (postId) => {
    const res = await apiFetch(`/api/social/posts/${postId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete post");
    set((s) => ({ feed: s.feed.filter((p) => p._id !== postId) }));
  },

  // Comments
  fetchComments: async (postId) => {
    const res = await apiFetch(`/api/social/posts/${postId}/comments`);
    if (!res.ok) throw new Error("Failed to fetch comments");
    const data = await res.json();
    return data.comments;
  },

  addComment: async (postId, content) => {
    const res = await apiFetch(`/api/social/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Failed to add comment");
    const data = await res.json();
    // Update comment count in feed
    set((s) => ({
      feed: s.feed.map((p) =>
        p._id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
      ),
    }));
    return data.comment;
  },

  // Friends
  friends: [],
  friendRequests: [],
  friendsLoading: false,
  searchResults: [],

  fetchFriends: async () => {
    set({ friendsLoading: true });
    try {
      const res = await apiFetch("/api/social/friends");
      if (res.ok) {
        const data = await res.json();
        set({ friends: data.friends || [], friendRequests: data.pendingRequests || [] });
      }
    } catch (err) { console.error(err); }
    set({ friendsLoading: false });
  },

  searchUsers: async (query) => {
    if (!query.trim()) { set({ searchResults: [] }); return; }
    try {
      const res = await apiFetch(`/api/social/friends/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        set({ searchResults: data.users || [] });
      }
    } catch (err) { console.error(err); }
  },

  sendFriendRequest: async (userId) => {
    const res = await apiFetch("/api/social/friends/request", {
      method: "POST",
      body: JSON.stringify({ recipientId: userId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to send request");
    }
    return true;
  },

  acceptFriendRequest: async (friendshipId) => {
    const res = await apiFetch(`/api/social/friends/accept/${friendshipId}`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to accept request");
    get().fetchFriends();
  },

  removeFriend: async (friendshipId) => {
    const res = await apiFetch(`/api/social/friends/${friendshipId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to remove friend");
    get().fetchFriends();
  },

  // Study Groups
  groups: [],
  groupsLoading: false,
  activeGroup: null,
  groupMessages: [],

  fetchGroups: async () => {
    set({ groupsLoading: true });
    try {
      const res = await apiFetch("/api/social/groups");
      if (res.ok) {
        const data = await res.json();
        set({ groups: data.groups || [] });
      }
    } catch (err) { console.error(err); }
    set({ groupsLoading: false });
  },

  createGroup: async (name, description, subject, isPublic) => {
    const res = await apiFetch("/api/social/groups", {
      method: "POST",
      body: JSON.stringify({ name, description, subject, isPublic }),
    });
    if (!res.ok) throw new Error("Failed to create group");
    const data = await res.json();
    set((s) => ({ groups: [data.group, ...s.groups] }));
    return data.group;
  },

  joinGroup: async (groupId) => {
    const res = await apiFetch(`/api/social/groups/${groupId}/join`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to join group");
    get().fetchGroups();
  },

  leaveGroup: async (groupId) => {
    const res = await apiFetch(`/api/social/groups/${groupId}/leave`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to leave group");
    set((s) => ({ groups: s.groups.filter((g) => g._id !== groupId), activeGroup: null }));
  },

  setActiveGroup: (group) => set({ activeGroup: group, groupMessages: [] }),

  fetchGroupMessages: async (groupId) => {
    const res = await apiFetch(`/api/social/groups/${groupId}/messages`);
    if (!res.ok) return;
    const data = await res.json();
    set({ groupMessages: data.messages || [] });
  },

  sendGroupMessage: async (groupId, content) => {
    const res = await apiFetch(`/api/social/groups/${groupId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Failed to send message");
    const data = await res.json();
    set((s) => ({ groupMessages: [...s.groupMessages, data.message] }));
    return data.message;
  },

  // Notifications
  notifications: [],
  notifLoading: false,
  unreadCount: 0,

  fetchNotifications: async () => {
    set({ notifLoading: true });
    try {
      const res = await apiFetch("/api/social/notifications");
      if (res.ok) {
        const data = await res.json();
        set({
          notifications: data.notifications || [],
          unreadCount: (data.notifications || []).filter((n) => !n.read).length,
        });
      }
    } catch (err) { console.error(err); }
    set({ notifLoading: false });
  },

  markNotifRead: async (notifId) => {
    await apiFetch(`/api/social/notifications/${notifId}/read`, { method: "POST" });
    set((s) => ({
      notifications: s.notifications.map((n) => (n._id === notifId ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  markAllRead: async () => {
    await apiFetch("/api/social/notifications/read-all", { method: "POST" });
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
}));

export default useSocialStore;

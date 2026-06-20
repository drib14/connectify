import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, Crown, Bot } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import api from './utils/api';

// Layout & UI Component Imports
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import RightSidebar from './components/layout/RightSidebar';
import Splash from './components/ui/Splash';
import Toast from './components/ui/Toast';

// Modals Imports
import StorySlideshowModal from './components/modals/StorySlideshowModal';
import AddReelModal from './components/modals/AddReelModal';
import AddAdModal from './components/modals/AddAdModal';
import AddMarketModal from './components/modals/AddMarketModal';
import AddEventModal from './components/modals/AddEventModal';
import PaymongoModal from './components/modals/PaymongoModal';

// Pages Imports
import Feed from './pages/Feed/FeedPage';
import Messages from './pages/Messages/MessagesPage';
import Spaces from './pages/Spaces/SpacesPage';
import Reels from './pages/Reels/ReelsPage';
import Groups from './pages/Groups/GroupsPage';
import Pages from './pages/Pages/PagesPage';
import Marketplace from './pages/Marketplace/MarketplacePage';
import Events from './pages/Events/EventsPage';
import Watch from './pages/Watch/WatchPage';
import Spark from './pages/Spark/SparkPage';
import Premium from './pages/Premium/PremiumPage';
import AI from './pages/AI/AIPage';
import Settings from './pages/Settings/SettingsPage';
import Profile from './pages/Profile/ProfilePage';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const {
    user,
    setUser,
    isAuthenticated,
    activeTab,
    setActiveTab,
    activeSettingsSubTab,
    setActiveSettingsSubTab,
    soundEffectsEnabled,
    handleToggleSound,
    toasts,
    showToast,
    playAlertChime,
    socket,
    onlineUsers,
    notifications,
    setNotifications,
    login,
    signup,
    logout,
  } = useAuth();

  // Splash and Screen states
  const [showSplash, setShowSplash] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'forgot', 'reset'
  
  // Credentials
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Facebook profiling states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDay, setBirthDay] = useState('1');
  const [birthMonth, setBirthMonth] = useState('1');
  const [birthYear, setBirthYear] = useState('2000');

  // App Global Data State
  const [viewingProfileUsername, setViewingProfileUsername] = useState(null);
  const [posts, setPosts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);

  // Poll state inside Create Post
  const [isPollPost, setIsPollPost] = useState(false);
  const [pollOptionsInputs, setPollOptionsInputs] = useState(['', '']);

  // Premium Hub state
  const [paymongoCheckoutUrl, setPaymongoCheckoutUrl] = useState('');
  const [paymongoSessionId, setPaymongoSessionId] = useState('');
  const [premiumThemeColor, setPremiumThemeColor] = useState('indigo'); // indigo, pink, purple, cyan, gold
  const [premiumNeonOutline, setPremiumNeonOutline] = useState(false);

  // AI Chat history state
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      sender: { username: 'Antigravity AI', profilePic: '/ai-avatar.png' },
      content: 'Hello! I am your Antigravity AI companion. Ask me to translate phrases, draft feed posts, or summarize text details!',
      createdAt: new Date(),
    }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [aiTyping, setAiTyping] = useState(false);

  // Profile management
  const [profileData, setProfileData] = useState(null);
  const [editBio, setEditBio] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [coverPicFile, setCoverPicFile] = useState(null);

  // Stories states
  const [stories, setStories] = useState([]);
  const [storySlideshowOpen, setStorySlideshowOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Groups states
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState('public');
  const [groupPostContent, setGroupPostContent] = useState('');
  const [newGroupRule, setNewGroupRule] = useState('');

  // Pages states
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [newPageName, setNewPageName] = useState('');
  const [newPageDesc, setNewPageDesc] = useState('');
  const [newPageCat, setNewPageCat] = useState('Business');
  const [pagePostContent, setPagePostContent] = useState('');

  // Marketplace states
  const [marketItems, setMarketItems] = useState([]);
  const [marketCategoryFilter, setMarketCategoryFilter] = useState('All');
  const [marketSearchText, setMarketSearchText] = useState('');
  const [newMarketTitle, setNewMarketTitle] = useState('');
  const [newMarketPrice, setNewMarketPrice] = useState('');
  const [newMarketCat, setNewMarketCat] = useState('Electronics');
  const [newMarketLoc, setNewMarketLoc] = useState('');
  const [newMarketDesc, setNewMarketDesc] = useState('');
  const [newMarketImageFile, setNewMarketImageFile] = useState(null);
  const [newMarketImagePreview, setNewMarketImagePreview] = useState(null);
  const [showAddMarketModal, setShowAddMarketModal] = useState(false);

  // Events states
  const [events, setEvents] = useState([]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLoc, setNewEventLoc] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  // Reels states
  const [reels, setReels] = useState([]);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [reelCaption, setReelCaption] = useState('');
  const [reelVideoFile, setReelVideoFile] = useState(null);
  const [showAddReelModal, setShowAddReelModal] = useState(false);
  const [showReelComments, setShowReelComments] = useState(false);
  const [newReelComment, setNewReelComment] = useState('');

  // Advertising states
  const [activeAds, setActiveAds] = useState([]);
  const [myAds, setMyAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdBudget, setNewAdBudget] = useState('');
  const [newAdRedirect, setNewAdRedirect] = useState('');
  const [newAdBannerFile, setNewAdBannerFile] = useState(null);
  const [newAdBannerPreview, setNewAdBannerPreview] = useState(null);
  const [showAddAdModal, setShowAddAdModal] = useState(false);

  // Auto-hide Splash
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Fetch lists when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    loadFeed();
    loadAllUsers();
    loadNotifications();
    loadLeaderboard();
    loadChallenges();
    loadStories();
    loadGroups();
    loadPages();
    loadMarketplace();
    loadEvents();
    loadReels();
    loadAds();
  }, [isAuthenticated, user?.id]);

  // Rotator timer for Sponsored right sidebar ads
  useEffect(() => {
    if (activeAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % activeAds.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [activeAds]);

  // Check query params for paymongo returns
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const sessionId = params.get('session_id');

    if (status === 'success' && sessionId) {
      verifyPayment(sessionId);
    }
  }, [isAuthenticated]);

  const verifyPayment = async (sessionId) => {
    try {
      const res = await api.post('/payments/verify-premium', { sessionId });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        alert('Payment verified! Welcome to Premium.');
        window.history.replaceState({}, document.title, window.location.pathname);
        setActiveTab('premium');
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
    }
  };

  const loadFeed = async () => {
    try {
      const res = await api.get('/posts/feed');
      if (res.data.success) {
        setPosts(res.data.posts);
      }
    } catch (err) {
      console.error('Feed load error:', err);
    }
  };

  const loadAllUsers = async () => {
    try {
      const res = await api.get('/users/search?query=');
      if (res.data.success) {
        setAllUsers(res.data.users);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await api.get('/users/leaderboard');
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard);
      }
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    }
  };

  const loadChallenges = async () => {
    try {
      const res = await api.get('/users/challenges');
      if (res.data.success) {
        setChallenges(res.data.dailyChallenges.goals);
      }
    } catch (err) {
      console.error('Error loading challenges:', err);
    }
  };

  const loadStories = async () => {
    try {
      const res = await api.get('/stories');
      if (res.data.success) {
        setStories(res.data.stories);
      }
    } catch (err) {
      console.error('Stories loading error:', err);
    }
  };

  const loadGroups = async () => {
    try {
      const res = await api.get('/groups');
      if (res.data.success) {
        setGroups(res.data.groups);
      }
    } catch (err) {
      console.error('Groups loading error:', err);
    }
  };

  const loadPages = async () => {
    try {
      const res = await api.get('/pages');
      if (res.data.success) {
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error('Pages loading error:', err);
    }
  };

  const loadMarketplace = async () => {
    try {
      const res = await api.get(`/marketplace?category=${marketCategoryFilter}&search=${marketSearchText}`);
      if (res.data.success) {
        setMarketItems(res.data.items);
      }
    } catch (err) {
      console.error('Marketplace loading error:', err);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await api.get('/events');
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Events loading error:', err);
    }
  };

  const loadReels = async () => {
    try {
      const res = await api.get('/reels');
      if (res.data.success) {
        setReels(res.data.reels);
      }
    } catch (err) {
      console.error('Reels load error:', err);
    }
  };

  const loadAds = async () => {
    try {
      const activeRes = await api.get('/ads/active');
      if (activeRes.data.success) {
        setActiveAds(activeRes.data.ads);
      }
      
      const myRes = await api.get('/ads/my');
      if (myRes.data.success) {
        setMyAds(myRes.data.ads);
      }
    } catch (err) {
      console.error('Ads loading error:', err);
    }
  };

  // Auth actions
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    const res = await login(email, password);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!firstName.trim() || !lastName.trim()) {
      setAuthError('First and Last names are required');
      return;
    }
    if (!gender) {
      setAuthError('Gender is required');
      return;
    }

    const dob = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;

    const res = await signup({
      username,
      email,
      password,
      firstName,
      lastName,
      gender,
      dateOfBirth: dob
    });

    if (res.success) {
      setAuthSuccess('Account created! Proceeding to Login.');
      setAuthMode('login');
      // Clear fields
      setFirstName('');
      setLastName('');
      setGender('');
    } else {
      setAuthError(res.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data.success) {
        setAuthSuccess('OTP code sent to email. Please verify code.');
        setAuthMode('reset');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Email request failed');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await api.post('/auth/reset-password', { 
        email, 
        otp, 
        newPassword 
      });
      if (res.data.success) {
        setAuthSuccess('Password updated successfully. You can log in now.');
        setAuthMode('login');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Password reset failed');
    }
  };

  // Profile detail loader
  const handleSelectProfile = async (targetUsername) => {
    try {
      const res = await api.get(`/users/profile/${targetUsername}`);
      if (res.data.success) {
        setProfileData(res.data.user);
        setEditBio(res.data.user.bio);
        setViewingProfileUsername(targetUsername);
        setActiveTab('profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Follow/Unfollow/Friend request actions
  const handleFollowToggle = async (profileUser) => {
    try {
      const isFollowing = profileUser.followers.includes(user.id);
      const url = isFollowing 
        ? `/users/unfollow/${profileUser._id}`
        : `/users/follow/${profileUser._id}`;
      
      await api.post(url);
      handleSelectProfile(profileUser.username); 
    } catch (err) {
      console.error('Error toggle follow:', err);
    }
  };

  const handleFriendRequest = async (profileUser, action = 'send') => {
    try {
      let url = `/users/friend-request/send/${profileUser._id}`;
      if (action === 'accept') {
        url = `/users/friend-request/accept/${profileUser._id}`;
      } else if (action === 'reject') {
        url = `/users/friend-request/reject/${profileUser._id}`;
      } else if (action === 'unfriend') {
        url = `/users/unfriend/${profileUser._id}`;
      }

      const res = await api.post(url);
      if (res.data.success) {
        showToast(res.data.message, 'success');
        handleSelectProfile(profileUser.username); 
      }
    } catch (err) {
      console.error('Friend action error:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('bio', editBio);
    if (profilePicFile) formData.append('profilePic', profilePicFile);
    if (coverPicFile) formData.append('coverPic', coverPicFile);

    try {
      const res = await api.put('/users/profile', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setProfileData(prev => ({ ...prev, ...res.data.user }));
        setProfilePicFile(null);
        setCoverPicFile(null);
        showToast('Profile details updated!', 'success');
      }
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  // Post creation
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const handleAddPollOption = () => {
    if (pollOptionsInputs.length < 5) {
      setPollOptionsInputs([...pollOptionsInputs, '']);
    }
  };

  const handlePollOptionChange = (index, value) => {
    const updated = [...pollOptionsInputs];
    updated[index] = value;
    setPollOptionsInputs(updated);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim() && !mediaFile && !isPollPost) return;

    const formData = new FormData();
    formData.append('content', newPostContent);
    
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    if (isPollPost) {
      formData.append('isPoll', 'true');
      const options = pollOptionsInputs.filter(opt => opt.trim().length > 0);
      formData.append('pollOptions', JSON.stringify(options));
    }

    try {
      const res = await api.post('/posts', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setPosts(prev => [res.data.post, ...prev]);
        setNewPostContent('');
        setMediaFile(null);
        setMediaPreview(null);
        setIsPollPost(false);
        setPollOptionsInputs(['', '']);
        showToast('Post shared to news feed!', 'success');
        loadChallenges();
      }
    } catch (err) {
      console.error('Error creating post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await api.delete(`/posts/${postId}`);
      if (res.data.success) {
        setPosts(prev => prev.filter(p => p._id !== postId));
        showToast('Post removed successfully.', 'success');
      }
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };


  // Stories handler
  const handleAddStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/stories`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setStories(prev => [res.data.story, ...prev]);
        showToast('Story uploaded!', 'success');
      }
    } catch (err) {
      console.error('Story upload failed:', err);
    }
  };

  const openStorySlideshow = (idx) => {
    setActiveStoryIndex(idx);
    setStorySlideshowOpen(true);
  };

  // Groups actions
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/groups`, {
        name: newGroupName,
        description: newGroupDesc,
        privacy: newGroupPrivacy
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setGroups(prev => [res.data.group, ...prev]);
        setNewGroupName('');
        setNewGroupDesc('');
        showToast('Group launched!', 'success');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Group creation failed');
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/groups/join/${groupId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Membership request processed!', 'success');
        loadGroups();
        if (selectedGroup && selectedGroup._id === groupId) {
          handleSelectGroup(groupId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/groups/leave/${groupId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Left group successfully.', 'success');
        loadGroups();
        if (selectedGroup && selectedGroup._id === groupId) {
          handleSelectGroup(groupId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectGroup = async (groupId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const groupData = groups.find(g => g._id === groupId);
      if (!groupData) return;

      const res = await axios.get(`${API_BASE}/groups/${groupId}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSelectedGroup({
          ...groupData,
          posts: res.data.posts
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostInGroup = async (e) => {
    e.preventDefault();
    if (!groupPostContent.trim() || !selectedGroup) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/groups/${selectedGroup._id}/posts`, {
        content: groupPostContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSelectedGroup(prev => ({
          ...prev,
          posts: [res.data.post, ...prev.posts]
        }));
        setGroupPostContent('');
        showToast('Post added to group feed!', 'success');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post in group');
    }
  };

  const handleApproveMember = async (pendingUserId) => {
    if (!selectedGroup) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/groups/join/${selectedGroup._id}`, { userId: pendingUserId, approve: true }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast('Member approved successfully!', 'success');
        setSelectedGroup(prev => ({
          ...prev,
          pendingMembers: prev.pendingMembers.filter(m => m !== pendingUserId),
          members: [...prev.members, pendingUserId]
        }));
      }
    } catch (e) {
      setSelectedGroup(prev => ({
        ...prev,
        pendingMembers: (prev.pendingMembers || []).filter(m => m !== pendingUserId),
        members: [...prev.members, pendingUserId]
      }));
      showToast('Simulated pending member approval!', 'success');
    }
  };

  const handleAddGroupRule = (e) => {
    e.preventDefault();
    if (!newGroupRule.trim() || !selectedGroup) return;
    setSelectedGroup(prev => ({
      ...prev,
      rules: [...(prev.rules || []), newGroupRule]
    }));
    setNewGroupRule('');
    showToast('Moderation rule added!', 'success');
  };

  // Pages actions
  const handleCreatePage = async (e) => {
    e.preventDefault();
    if (!newPageName.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/pages`, {
        name: newPageName,
        description: newPageDesc,
        category: newPageCat
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setPages(prev => [res.data.page, ...prev]);
        setNewPageName('');
        setNewPageDesc('');
        showToast('Creator page launched!', 'success');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Page creation failed');
    }
  };

  const handleFollowPage = async (pageId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/pages/follow/${pageId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showToast(res.data.message, 'success');
        loadPages();
        if (selectedPage && selectedPage._id === pageId) {
          handleSelectPage(pageId);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPage = async (pageId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const pageData = pages.find(p => p._id === pageId);
      if (!pageData) return;

      try {
        await axios.post(`${API_BASE}/pages/view/${pageId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (e) {}

      const res = await axios.get(`${API_BASE}/pages/${pageId}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSelectedPage({
          ...pageData,
          viewsCount: (pageData.viewsCount || 0) + 1, 
          posts: res.data.posts
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostInPage = async (e) => {
    e.preventDefault();
    if (!pagePostContent.trim() || !selectedPage) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/pages/${selectedPage._id}/posts`, {
        content: pagePostContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSelectedPage(prev => ({
          ...prev,
          posts: [res.data.post, ...prev.posts]
        }));
        setPagePostContent('');
        showToast('Timeline announcement published!', 'success');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post to page');
    }
  };

  // Marketplace actions
  const handleMarketImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewMarketImageFile(file);
      setNewMarketImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateMarketItem = async (e) => {
    e.preventDefault();
    if (!newMarketTitle.trim() || !newMarketPrice) return;

    const formData = new FormData();
    formData.append('title', newMarketTitle);
    formData.append('price', newMarketPrice);
    formData.append('category', newMarketCat);
    formData.append('location', newMarketLoc);
    formData.append('description', newMarketDesc);
    if (newMarketImageFile) {
      formData.append('image', newMarketImageFile);
    }

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/marketplace`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setMarketItems(prev => [res.data.item, ...prev]);
        setNewMarketTitle('');
        setNewMarketPrice('');
        setNewMarketLoc('');
        setNewMarketDesc('');
        setNewMarketImageFile(null);
        setNewMarketImagePreview(null);
        setShowAddMarketModal(false);
        showToast('Item listed successfully!', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMarketItem = async (itemId) => {
    if (!confirm('Remove this product listing?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.delete(`${API_BASE}/marketplace/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setMarketItems(prev => prev.filter(i => i._id !== itemId));
        showToast('Product listing removed.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartMarketChat = async (sellerId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/messages/room`, {
        targetUserId: sellerId,
        isGroup: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setActiveRoom(res.data.room); // Trigger loading inside ChatWindow
        setActiveTab('messages');
      }
    } catch (err) {
      // In case offline / active room setup is controlled locally, set tab
      setActiveTab('messages');
    }
  };

  // Events Actions
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/events`, {
        title: newEventTitle,
        date: newEventDate,
        location: newEventLoc,
        description: newEventDesc
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setEvents(prev => [res.data.event, ...prev]);
        setNewEventTitle('');
        setNewEventDate('');
        setNewEventLoc('');
        setNewEventDesc('');
        setShowAddEventModal(false);
        showToast('Community event scheduled!', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventRSVP = async (eventId, status) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/events/rsvp/${eventId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEvents(prev => prev.map(e => e._id === eventId ? res.data.event : e));
        showToast(`Attendance status updated to: ${status}`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Watch Reels handler
  const handleUploadReel = async (e) => {
    e.preventDefault();
    if (!reelVideoFile) return;

    const formData = new FormData();
    formData.append('video', reelVideoFile);
    formData.append('caption', reelCaption);

    try {
      const token = localStorage.getItem('accessToken');
      showToast('Uploading Reel to Cloudinary... Please wait.', 'info');
      const res = await axios.post(`${API_BASE}/reels`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setReels(prev => [res.data.reel, ...prev]);
        setReelCaption('');
        setReelVideoFile(null);
        setShowAddReelModal(false);
        showToast('Short Reel published successfully!', 'success');
      }
    } catch (err) {
      console.error('Reel upload failed:', err);
      alert('Error uploading video Reel.');
    }
  };

  const handleLikeReel = async (reelId) => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/reels/${reelId}/react`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReels(prev => prev.map(r => r._id === reelId ? { ...r, likes: res.data.likes } : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentReel = async (e, reelId) => {
    e.preventDefault();
    if (!newReelComment.trim()) return;

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/reels/${reelId}/comment`, { text: newReelComment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReels(prev => prev.map(r => {
          if (r._id === reelId) {
            return { ...r, comments: [...r.comments, res.data.comment] };
          }
          return r;
        }));
        setNewReelComment('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Advertising campaigns launchers
  const handleCreateAd = async (e) => {
    e.preventDefault();
    if (!newAdTitle.trim() || !newAdBudget || !newAdBannerFile) return;

    const formData = new FormData();
    formData.append('title', newAdTitle);
    formData.append('budget', newAdBudget);
    formData.append('redirectUrl', newAdRedirect);
    formData.append('banner', newAdBannerFile);

    try {
      const token = localStorage.getItem('accessToken');
      showToast('Publishing advertisement banner...', 'info');
      const res = await axios.post(`${API_BASE}/ads`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        setMyAds(prev => [res.data.ad, ...prev]);
        setNewAdTitle('');
        setNewAdBudget('');
        setNewAdRedirect('');
        setNewAdBannerFile(null);
        setNewAdBannerPreview(null);
        setShowAddAdModal(false);
        showToast('Ad campaign created and launched live!', 'success');
        loadAds(); 
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdClick = async (ad) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_BASE}/ads/click/${ad._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
    
    if (ad.redirectUrl) {
      window.open(ad.redirectUrl, '_blank');
    } else {
      showToast(`Redirecting to campaign landing page: ${ad.title}`, 'info');
    }
    loadAds(); 
  };


  // AI Chat handler
  const handleSendMessageToAI = async (e) => {
    e.preventDefault();
    if (!aiInputText.trim()) return;

    const userMsg = {
      sender: { username: user.username, profilePic: user.profilePic },
      content: aiInputText,
      createdAt: new Date(),
    };

    setAiChatHistory(prev => [...prev, userMsg]);
    setAiInputText('');
    setAiTyping(true);

    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/messages/ai`, {
        message: aiInputText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAiChatHistory(prev => [...prev, {
          sender: { username: 'Antigravity AI', profilePic: '/ai-avatar.png' },
          content: res.data.reply,
          createdAt: new Date()
        }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiTyping(false);
    }
  };

  // Checkout sessions trigger
  const handleUpgradeToPremium = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/payments/checkout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPaymongoCheckoutUrl(res.data.checkoutUrl);
        setPaymongoSessionId(res.data.sessionId);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Checkout initialization failed.', 'error');
    }
  };

  const getThemeVars = () => {
    switch (premiumThemeColor) {
      case 'pink': return { '--color-primary': '#ec4899', '--color-primary-hover': '#db2777', '--main-gradient': 'linear-gradient(135deg, #ec4899 0%, #ca8a04 100%)' };
      case 'purple': return { '--color-primary': '#8b5cf6', '--color-primary-hover': '#7c3aed', '--main-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #10b981 100%)' };
      case 'cyan': return { '--color-primary': '#06b6d4', '--color-primary-hover': '#0891b2', '--main-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' };
      case 'gold': return { '--color-primary': '#f59e0b', '--color-primary-hover': '#d97706', '--main-gradient': 'linear-gradient(135deg, #f59e0b 0%, #ca8a04 100%)' };
      default: return {}; 
    }
  };

  // Render Login/Signup panel
  if (!isAuthenticated) {
    if (showSplash) {
      return <Splash />;
    }

    // Dropdown options helper calculations
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 120 }, (_, i) => currentYear - i);

    return (
      <div className="split-login-container">
        
        {/* Left Side: Branding / Tagline */}
        <div className="login-brand-section">
          <img src="/logo.png" alt="Connectify Logo" className="login-brand-logo-img" />
          <h1 className="login-brand-title">Connectify</h1>
          <p className="login-brand-tagline">
            Connect with friends and the community around you on Connectify.
          </p>
        </div>

        {/* Right Side: Form Card */}
        <div className="glass-panel-heavy login-form-card">
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>
              {authMode === 'login' && 'Log In to Connectify'}
              {authMode === 'signup' && 'Create a New Account'}
              {authMode === 'forgot' && 'Find Your Account'}
              {authMode === 'reset' && 'Reset Your Password'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {authMode === 'login' && 'Please enter your account details'}
              {authMode === 'signup' && "It's quick and easy."}
              {authMode === 'forgot' && 'Enter your email to request an OTP code'}
              {authMode === 'reset' && 'Enter the OTP code from your inbox'}
            </p>
          </div>

          {authError && (
            <div style={{ display: 'flex', gap: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', color: 'var(--color-danger)', fontSize: '13px', marginBottom: '16px' }}>
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div style={{ display: 'flex', gap: '8px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', color: 'var(--color-success)', fontSize: '13px', marginBottom: '16px' }}>
              <Check size={16} />
              <span>{authSuccess}</span>
            </div>
          )}

          {authMode === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  type="text" 
                  placeholder="Email Address or Username" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  style={{ height: '48px', fontSize: '15px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  style={{ height: '48px', fontSize: '15px' }}
                />
              </div>
              
              <button type="submit" className="btn-primary" style={{ height: '48px', fontSize: '16px', fontWeight: '700', marginTop: '6px' }}>
                Log In
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button type="button" onClick={() => setAuthMode('forgot')} style={{ background: 'none', color: 'var(--color-primary)', fontSize: '14px', padding: 0 }}>
                  Forgot Password?
                </button>
              </div>

              <div className="login-separator"></div>

              <button 
                type="button" 
                onClick={() => setAuthMode('signup')} 
                className="btn-register-trigger"
                style={{ height: '46px', fontSize: '15px', fontWeight: '700', display: 'flex', margin: '0 auto' }}
              >
                Create New Account
              </button>
            </form>
          )}

          {authMode === 'signup' && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* First & Last Name */}
              <div className="input-row">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)} 
                  required 
                  style={{ height: '40px', fontSize: '14px' }}
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)} 
                  required 
                  style={{ height: '40px', fontSize: '14px' }}
                />
              </div>

              {/* Username */}
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                style={{ height: '40px', fontSize: '14px' }}
              />

              {/* Email Address */}
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                style={{ height: '40px', fontSize: '14px' }}
              />

              {/* Password */}
              <input 
                type="password" 
                placeholder="New Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                style={{ height: '40px', fontSize: '14px' }}
              />

              {/* Birthday selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Date of Birth</label>
                <div className="dob-select-row">
                  <select value={birthDay} onChange={e => setBirthDay(e.target.value)} required>
                    {days.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)} required>
                    {months.map(m => (
                      <option key={m} value={m}>
                        {new Date(2000, m - 1, 1).toLocaleString('default', { month: 'short' })}
                      </option>
                    ))}
                  </select>
                  <select value={birthYear} onChange={e => setBirthYear(e.target.value)} required>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gender Radio options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }}>Gender</label>
                <div className="gender-radio-row">
                  <label className="gender-radio-card">
                    <span>Female</span>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="female" 
                      checked={gender === 'female'} 
                      onChange={e => setGender(e.target.value)}
                    />
                  </label>
                  <label className="gender-radio-card">
                    <span>Male</span>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="male" 
                      checked={gender === 'male'} 
                      onChange={e => setGender(e.target.value)}
                    />
                  </label>
                  <label className="gender-radio-card">
                    <span>Custom</span>
                    <input 
                      type="radio" 
                      name="gender" 
                      value="custom" 
                      checked={gender === 'custom'} 
                      onChange={e => setGender(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ height: '44px', fontSize: '15px', fontWeight: '700', marginTop: '10px' }}>
                Sign Up
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button type="button" onClick={() => setAuthMode('login')} style={{ background: 'none', color: 'var(--color-primary)', fontSize: '14px', padding: 0 }}>
                  Already have an account?
                </button>
              </div>
            </form>
          )}

          {authMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  type="email" 
                  placeholder="Enter Register Email Address" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  style={{ height: '44px', fontSize: '14px' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ height: '44px', fontWeight: '700', marginTop: '10px' }}>
                Send Verification Code
              </button>
              <button type="button" onClick={() => setAuthMode('login')} className="btn-secondary" style={{ height: '44px' }}>
                Cancel
              </button>
            </form>
          )}

          {authMode === 'reset' && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  type="text" 
                  placeholder="OTP Code (6 Digits)" 
                  value={otp} 
                  onChange={e => setOtp(e.target.value)} 
                  required 
                  style={{ height: '44px', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  required 
                  style={{ height: '44px', fontSize: '14px' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ height: '44px', fontWeight: '700', marginTop: '10px' }}>
                Reset Password
              </button>
              <button type="button" onClick={() => setAuthMode('login')} className="btn-secondary" style={{ height: '44px' }}>
                Cancel
              </button>
            </form>
          )}

        </div>
      </div>
    );
  }

  // Find RSVPed Events for Right Sidebar
  const rsvpedEventsList = events.filter(ev => 
    ev.going.some(g => g._id === user.id) || ev.interested.some(i => i._id === user.id)
  );

  return (
    <div className="app-container" style={getThemeVars()}>
      
      {/* Dynamic Toast Container */}
      <Toast toasts={toasts} />

      {/* Header */}
      <Navbar 
        user={user} 
        notifications={notifications} 
        setNotifications={setNotifications}
        onLogout={handleLogout} 
        setActiveTab={setActiveTab}
        onSelectProfile={handleSelectProfile}
        API_BASE={API_BASE}
      />

      {/* Main Grid Layout */}
      <div className="app-double-layout">
        
        {/* Left Sidebar Navigation */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          onlineUsers={onlineUsers}
          allUsers={allUsers}
          onSelectProfile={handleSelectProfile}
        />

        {/* Central Scrolling Content Panel */}
        <div className="content-container">
          
          {activeTab === 'feed' && (
            <Feed 
              user={user}
              stories={stories}
              openStorySlideshow={openStorySlideshow}
              handleAddStory={handleAddStory}
              newPostContent={newPostContent}
              setNewPostContent={setNewPostContent}
              mediaPreview={mediaPreview}
              setMediaFile={setMediaFile}
              setMediaPreview={setMediaPreview}
              isPollPost={isPollPost}
              setIsPollPost={setIsPollPost}
              pollOptionsInputs={pollOptionsInputs}
              handleAddPollOption={handleAddPollOption}
              handlePollOptionChange={handlePollOptionChange}
              handleCreatePost={handleCreatePost}
              handleMediaChange={handleMediaChange}
              posts={posts}
              handleDeletePost={handleDeletePost}
              handleSelectProfile={handleSelectProfile}
              API_BASE={API_BASE}
            />
          )}

          {activeTab === 'messages' && (
            <Messages 
              user={user}
              socket={socket}
              allUsers={allUsers}
              API_BASE={API_BASE}
            />
          )}

          {activeTab === 'spaces' && (
            <Spaces 
              user={user}
              socket={socket}
              API_BASE={API_BASE}
            />
          )}

          {activeTab === 'reels' && (
            <Reels 
              reels={reels}
              activeReelIndex={activeReelIndex}
              setActiveReelIndex={setActiveReelIndex}
              setShowAddReelModal={setShowAddReelModal}
              handleLikeReel={handleLikeReel}
              showReelComments={showReelComments}
              setShowReelComments={setShowReelComments}
              handleCommentReel={handleCommentReel}
              newReelComment={newReelComment}
              setNewReelComment={setNewReelComment}
              user={user}
              showToast={showToast}
            />
          )}

          {activeTab === 'groups' && (
            <Groups 
              groups={groups}
              selectedGroup={selectedGroup}
              setSelectedGroup={setSelectedGroup}
              handleCreateGroup={handleCreateGroup}
              newGroupName={newGroupName}
              setNewGroupName={setNewGroupName}
              newGroupDesc={newGroupDesc}
              setNewGroupDesc={setNewGroupDesc}
              newGroupPrivacy={newGroupPrivacy}
              setNewGroupPrivacy={setNewGroupPrivacy}
              handleJoinGroup={handleJoinGroup}
              handleLeaveGroup={handleLeaveGroup}
              handleSelectGroup={handleSelectGroup}
              handleApproveMember={handleApproveMember}
              handleAddGroupRule={handleAddGroupRule}
              newGroupRule={newGroupRule}
              setNewGroupRule={setNewGroupRule}
              groupPostContent={groupPostContent}
              setGroupPostContent={setGroupPostContent}
              handlePostInGroup={handlePostInGroup}
              user={user}
              allUsers={allUsers}
              handleDeletePost={handleDeletePost}
              handleSelectProfile={handleSelectProfile}
              API_BASE={API_BASE}
            />
          )}

          {activeTab === 'pages' && (
            <Pages 
              pages={pages}
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
              handleCreatePage={handleCreatePage}
              newPageName={newPageName}
              setNewPageName={setNewPageName}
              newPageDesc={newPageDesc}
              setNewPageDesc={setNewPageDesc}
              newPageCat={newPageCat}
              setNewPageCat={setNewPageCat}
              handleFollowPage={handleFollowPage}
              handleSelectPage={handleSelectPage}
              pagePostContent={pagePostContent}
              setPagePostContent={setPagePostContent}
              handlePostInPage={handlePostInPage}
              user={user}
              handleDeletePost={handleDeletePost}
              handleSelectProfile={handleSelectProfile}
              API_BASE={API_BASE}
            />
          )}

          {activeTab === 'marketplace' && (
            <Marketplace 
              marketCategoryFilter={marketCategoryFilter}
              setMarketCategoryFilter={setMarketCategoryFilter}
              marketSearchText={marketSearchText}
              setMarketSearchText={setMarketSearchText}
              loadMarketplace={loadMarketplace}
              setShowAddMarketModal={setShowAddMarketModal}
              marketItems={marketItems}
              user={user}
              handleStartMarketChat={handleStartMarketChat}
              handleDeleteMarketItem={handleDeleteMarketItem}
            />
          )}

          {activeTab === 'events' && (
            <Events 
              events={events}
              setShowAddEventModal={setShowAddEventModal}
              user={user}
              handleEventRSVP={handleEventRSVP}
              rsvpedEventsList={rsvpedEventsList}
            />
          )}

          {activeTab === 'watch' && (
            <Watch 
              posts={posts}
              user={user}
              handleDeletePost={handleDeletePost}
              handleSelectProfile={handleSelectProfile}
              API_BASE={API_BASE}
            />
          )}

          {activeTab === 'spark' && (
            <Spark 
              user={user}
              challenges={challenges}
              leaderboard={leaderboard}
              handleSelectProfile={handleSelectProfile}
            />
          )}

          {activeTab === 'premium' && (
            <Premium 
              user={user}
              handleUpgradeToPremium={handleUpgradeToPremium}
              premiumThemeColor={premiumThemeColor}
              setPremiumThemeColor={setPremiumThemeColor}
              premiumNeonOutline={premiumNeonOutline}
              setPremiumNeonOutline={setPremiumNeonOutline}
            />
          )}

          {activeTab === 'ai' && (
            <AI 
              aiChatHistory={aiChatHistory}
              aiInputText={aiInputText}
              setAiInputText={setAiInputText}
              aiTyping={aiTyping}
              handleSendMessageToAI={handleSendMessageToAI}
            />
          )}

          {activeTab === 'settings' && (
            <Settings 
              activeSettingsSubTab={activeSettingsSubTab}
              setActiveSettingsSubTab={setActiveSettingsSubTab}
              user={user}
              soundEffectsEnabled={soundEffectsEnabled}
              handleToggleSound={handleToggleSound}
              playAlertChime={playAlertChime}
              myAds={myAds}
              setShowAddAdModal={setShowAddAdModal}
            />
          )}

          {activeTab === 'profile' && profileData && (
            <Profile 
              profileData={profileData}
              user={user}
              coverPicFile={coverPicFile}
              setCoverPicFile={setCoverPicFile}
              profilePicFile={profilePicFile}
              setProfilePicFile={setProfilePicFile}
              editBio={editBio}
              setEditBio={setEditBio}
              handleFollowToggle={handleFollowToggle}
              handleFriendRequest={handleFriendRequest}
              handleProfileUpdate={handleProfileUpdate}
              posts={posts}
              handleDeletePost={handleDeletePost}
              handleSelectProfile={handleSelectProfile}
              API_BASE={API_BASE}
            />
          )}

        </div>

        {/* Right Sidebar sponsored widgets */}
        <RightSidebar 
          activeAds={activeAds}
          currentAdIndex={currentAdIndex}
          handleAdClick={handleAdClick}
          rsvpedEventsList={rsvpedEventsList}
          allUsers={allUsers}
          user={user}
          onlineUsers={onlineUsers}
          onSelectProfile={handleSelectProfile}
        />

      </div>

      {/* Stories slideshow viewer modal */}
      <StorySlideshowModal 
        isOpen={storySlideshowOpen}
        stories={stories}
        activeStoryIndex={activeStoryIndex}
        setActiveStoryIndex={setActiveStoryIndex}
        setStorySlideshowOpen={setStorySlideshowOpen}
      />

      {/* Upload Video Reels modal */}
      <AddReelModal 
        isOpen={showAddReelModal}
        onClose={() => setShowAddReelModal(false)}
        reelCaption={reelCaption}
        setReelCaption={setReelCaption}
        reelVideoFile={reelVideoFile}
        setReelVideoFile={setReelVideoFile}
        handleUploadReel={handleUploadReel}
      />

      {/* Upload Advertising Campaign modal */}
      <AddAdModal 
        isOpen={showAddAdModal}
        onClose={() => setShowAddAdModal(false)}
        newAdTitle={newAdTitle}
        setNewAdTitle={setNewAdTitle}
        newAdBudget={newAdBudget}
        setNewAdBudget={setNewAdBudget}
        newAdRedirect={newAdRedirect}
        setNewAdRedirect={setNewAdRedirect}
        newAdBannerPreview={newAdBannerPreview}
        setNewAdBannerFile={setNewAdBannerFile}
        setNewAdBannerPreview={setNewAdBannerPreview}
        handleCreateAd={handleCreateAd}
      />

      {/* Marketplace Create Listing Modal */}
      <AddMarketModal 
        isOpen={showAddMarketModal}
        onClose={() => setShowAddMarketModal(false)}
        newMarketTitle={newMarketTitle}
        setNewMarketTitle={setNewMarketTitle}
        newMarketPrice={newMarketPrice}
        setNewMarketPrice={setNewMarketPrice}
        newMarketCat={newMarketCat}
        setNewMarketCat={setNewMarketCat}
        newMarketLoc={newMarketLoc}
        setNewMarketLoc={setNewMarketLoc}
        newMarketDesc={newMarketDesc}
        setNewMarketDesc={setNewMarketDesc}
        newMarketImagePreview={newMarketImagePreview}
        handleMarketImageChange={handleMarketImageChange}
        handleCreateMarketItem={handleCreateMarketItem}
      />

      {/* Events Create Modal */}
      <AddEventModal 
        isOpen={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        newEventTitle={newEventTitle}
        setNewEventTitle={setNewEventTitle}
        newEventDate={newEventDate}
        setNewEventDate={setNewEventDate}
        newEventLoc={newEventLoc}
        setNewEventLoc={setNewEventLoc}
        newEventDesc={newEventDesc}
        setNewEventDesc={setNewEventDesc}
        handleCreateEvent={handleCreateEvent}
      />

      {/* Paymongo Simulated Portal Overlay Modal */}
      <PaymongoModal 
        paymongoCheckoutUrl={paymongoCheckoutUrl}
        onClose={() => { setPaymongoCheckoutUrl(''); setPaymongoSessionId(''); }}
      />

    </div>
  );
}

import { useState } from "react";
import useAuthStore from "../../stores/auth-store";
import { apiFetch } from "../../lib/api";
import Avatar from "../../components/ui/Avatar";
import { User, Save, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    school: user?.school || "",
    grade: user?.grade || "",
    subjects: (user?.subjects || []).join(", "),
    studyGoals: user?.studyGoals || "",
    bio: user?.bio || "",
    preferredStudyTime: user?.preferredStudyTime || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pledging, setPledging] = useState(false);

  const isSuspended = user?.aiTokenSuspended;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await apiFetch("/api/study/profile", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          subjects: form.subjects.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const handlePledge = async () => {
    setPledging(true);
    try {
      const res = await apiFetch("/api/study/profile/reset-ai", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) { console.error(err); }
    setPledging(false);
  };

  const onChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center gap-4">
        <Avatar src={user?.avatar} name={user?.username} size="xl" />
        <div>
          <h1 className="text-xl font-bold text-zinc-100">{user?.username}</h1>
          <p className="text-xs text-zinc-500">{user?.email}</p>
        </div>
      </div>

      {/* AI Suspension */}
      {isSuspended && (
        <div className="p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-rose-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-rose-400">AI Access Suspended</h3>
              <p className="text-xs text-zinc-400 mt-1">{user?.aiSuspensionReason || "You attempted to use the AI to get direct answers instead of learning. This defeats the purpose of a study companion."}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 space-y-3">
            <h4 className="text-xs font-bold text-zinc-200">📖 Connectify Study Pledge</h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              I understand that Connectify's AI is designed to help me <strong>learn and understand</strong>, not to give me answers.
              I pledge to use the AI tutor to explore concepts, ask for explanations, test my understanding, and improve my study habits.
              I will not ask it to do my homework, give me test answers, or write my assignments. I am here to learn.
            </p>
            <button onClick={handlePledge} disabled={pledging}
              className="cursor-pointer w-full h-10 flex items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 gap-2">
              {pledging ? <><RefreshCw className="h-4 w-4 animate-spin" /> Processing...</> : <><CheckCircle2 className="h-4 w-4" /> I Accept — Restore My Access</>}
            </button>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="p-6 rounded-2xl border border-zinc-900 bg-zinc-900/10 space-y-5">
        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2"><User className="h-4 w-4 text-indigo-400" /> Profile Settings</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">School</label>
            <input type="text" value={form.school} onChange={onChange("school")} placeholder="Your school"
              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Grade / Year</label>
            <input type="text" value={form.grade} onChange={onChange("grade")} placeholder="e.g. Grade 10"
              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Bio</label>
          <textarea value={form.bio} onChange={onChange("bio")} placeholder="Tell others about yourself..." rows={3}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none resize-none" />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Subjects (comma-separated)</label>
          <input type="text" value={form.subjects} onChange={onChange("subjects")} placeholder="Math, Physics, Biology"
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Study Goals</label>
          <input type="text" value={form.studyGoals} onChange={onChange("studyGoals")} placeholder="Pass finals with 85%+, improve math grade"
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-zinc-500 uppercase mb-1">Preferred Study Time</label>
          <select value={form.preferredStudyTime} onChange={onChange("preferredStudyTime")}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:border-indigo-500 focus:outline-none">
            <option value="">Select...</option>
            <option value="morning">Morning (6am–12pm)</option>
            <option value="afternoon">Afternoon (12pm–5pm)</option>
            <option value="evening">Evening (5pm–9pm)</option>
            <option value="night">Night (9pm–12am)</option>
          </select>
        </div>

        <button type="submit" disabled={saving}
          className="cursor-pointer inline-flex h-10 items-center justify-center rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 gap-2">
          {saving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
          {saved && <span className="text-emerald-400 text-xs font-bold ml-2">Saved!</span>}
        </button>
      </form>
    </div>
  );
}

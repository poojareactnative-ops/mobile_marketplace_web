'use client';

import React, { useState } from 'react';
import {
  MessageSquareQuote,
  ThumbsUp,
  Sparkles,
  Share2,
  PlusCircle,
  X,
  CheckCircle2,
  User,
  ShieldCheck,
  Calendar,
  Tag,
  Star
} from 'lucide-react';

const INITIAL_STORIES = [
  {
    id: 1,
    author: 'Rajeev Sharma',
    role: 'Level-3 Micro-Soldering Technician',
    verified: true,
    title: 'Water Damaged iPhone 13 Pro Revived Without Motherboard Replacement',
    device: 'iPhone 13 Pro Max',
    category: 'Board-Level Repair',
    upvotes: 42,
    date: '2 days ago',
    content:
      'Customer brought in a submerged iPhone 13 Pro that apple service center quoted ₹48,000 for full board swap. We performed a full ultrasonic PCB wash with Branson EC, traced a shorted capacitor on the VDD_MAIN rail using a thermal camera, and replaced the damaged power IC. Saved customer ₹41,000 and recovered 100% of their photos.'
  },
  {
    id: 2,
    author: 'Priya Kulkarni',
    role: 'Verified Customer',
    verified: true,
    title: 'Same-Day Screen Glass Replacement for Galaxy S22 Ultra',
    device: 'Samsung Galaxy S22 Ultra',
    category: 'Screen Restoration',
    upvotes: 29,
    date: '5 days ago',
    content:
      'Dropped my phone while catching the metro. The display was working perfectly with no ink bleeding, but the outer glass was cracked into pieces. Local shops wanted to replace the entire OLED assembly for ₹18,000. SmartFix lab did OCA glass lamination for ₹4,200 in 2 hours! Looks completely original.'
  },
  {
    id: 3,
    author: 'Amitabh Sen',
    role: 'Senior Bench Engineer',
    verified: true,
    title: 'Solving Poco X3 Pro CPU Boot Loop Without Losing Data',
    device: 'Poco X3 Pro',
    category: 'CPU Reballing',
    upvotes: 56,
    date: '1 week ago',
    content:
      'The classic dry-solder issue on Snapdragon 860. Instead of telling the customer their phone was bricked, we lifted both the RAM and CPU, cleaned the solder pads, and reballed with 183-degree leaded solder paste. Device booted on the first attempt and passed a 48-hour burn-in stress test.'
  },
  {
    id: 4,
    author: 'Vikram Mehta',
    role: 'Verified Customer',
    verified: true,
    title: 'Fast Doorstep Battery Swap for OnePlus 9',
    device: 'OnePlus 9 5G',
    category: 'Battery Replacement',
    upvotes: 18,
    date: '2 weeks ago',
    content:
      'My phone was dying at 30% battery. Booked through the portal and the technician reached my office within 45 minutes with a genuine tested cell. Tested 65W Warp charge right in front of me. Highly recommend SmartFix!'
  }
];

const CATEGORIES = ['All', 'Board-Level Repair', 'Screen Restoration', 'CPU Reballing', 'Battery Replacement'];

export default function ExperienceSharePage() {
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [upvotedStories, setUpvotedStories] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submittedFeedback, setSubmittedFeedback] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    author: '',
    role: 'Verified Customer',
    title: '',
    device: '',
    category: 'Screen Restoration',
    content: ''
  });

  const handleUpvote = (id) => {
    if (upvotedStories[id]) return;
    setUpvotedStories((prev) => ({ ...prev, [id]: true }));
    setStories((prev) =>
      prev.map((s) => (s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s))
    );
  };

  const handleSubmitStory = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const newStory = {
      id: Date.now(),
      author: formData.author.trim() || 'Anonymous Repair Fan',
      role: formData.role,
      verified: true,
      title: formData.title.trim(),
      device: formData.device.trim() || 'Smartphone',
      category: formData.category,
      upvotes: 1,
      date: 'Just now',
      content: formData.content.trim()
    };

    setStories([newStory, ...stories]);
    setSubmittedFeedback(true);
    setTimeout(() => {
      setSubmittedFeedback(false);
      setShowSubmitModal(false);
      setFormData({
        author: '',
        role: 'Verified Customer',
        title: '',
        device: '',
        category: 'Screen Restoration',
        content: ''
      });
    }, 1500);
  };

  const filteredStories = stories.filter(
    (s) => selectedCategory === 'All' || s.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-200">
      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 mb-4">
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Community Bench Logs &amp; Stories</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white mb-4">
                Experience <span className="text-purple-500">Sharing</span>
              </h1>
              <p className="max-w-xl text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Read real-world repair stories from certified technicians and verified customers.
                Learn chip-level diagnostic secrets and post your own repair turnaround experience.
              </p>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-purple-500/20 transition self-start sm:self-auto shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share Your Story</span>
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stories Feed */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900 dark:text-white">{filteredStories.length}</strong> repair stories
          </p>
          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Verified Cases</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredStories.map((story) => {
            const hasUpvoted = !!upvotedStories[story.id];
            return (
              <article
                key={story.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg transition space-y-4"
              >
                {/* Author row */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                      {story.author[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {story.author}
                        </span>
                        {story.verified && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block">{story.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3 h-3" />
                    <span>{story.date}</span>
                  </div>
                </div>

                {/* Title & Badge */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-2">
                    <Tag className="w-2.5 h-2.5 text-purple-500" />
                    <span>{story.device}</span>
                    <span>•</span>
                    <span>{story.category}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {story.title}
                  </h3>
                </div>

                {/* Content */}
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {story.content}
                </p>

                {/* Action Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleUpvote(story.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      hasUpvoted
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-500/10 hover:text-purple-500'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({story.upvotes})</span>
                  </button>

                  <span className="text-[11px] text-slate-400 font-medium">
                    SmartFix Verified Experience
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Share Story Modal */}
      {showSubmitModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setShowSubmitModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-slate-900 dark:text-white animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Community Knowledge
              </span>
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                Share Your Repair Experience
              </h3>
              <p className="text-xs text-slate-500">
                Post diagnostic tricks, turnaround wins, or honest reviews to help the SmartFix community.
              </p>
            </div>

            {submittedFeedback ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <h4 className="font-bold text-sm">Story Published!</h4>
                <p className="text-xs">Your repair experience is now live on the community board.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitStory} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g. Ramesh K."
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    >
                      <option value="Verified Customer">Verified Customer</option>
                      <option value="Bench Technician">Bench Technician</option>
                      <option value="Chip-Level Specialist">Chip-Level Specialist</option>
                      <option value="Store Partner">Store Partner</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Device Model
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.device}
                      onChange={(e) => setFormData({ ...formData, device: e.target.value })}
                      placeholder="e.g. OnePlus 11R"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Story Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Saved ₹15,000 with simple jumper wire on backlight circuit"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Experience &amp; Takeaway
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Describe the issue, what was done, time taken, and your honest feedback..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20"
                  >
                    Publish Story
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

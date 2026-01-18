
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  LayoutGrid, 
  Dumbbell, 
  Banana, 
  User, 
  Trophy, 
  Flame, 
  Check, 
  X, 
  Clock,
  History,
  RotateCcw,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';
import { DailyEntry, TabId, TimeContext, RankTier } from './types';
import { 
  storage, 
  getLocalISODate, 
  sanitizeEntries 
} from './services/storageService';
import { 
  RANK_TIERS, 
  WORKOUT_PLANS, 
  MEALS_LIST, 
  POSTURE_LIST, 
  CHAPTER_NAMES 
} from './constants';
import { getAIInsights } from './services/geminiService';

const App: React.FC = () => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [aiInsight, setAiInsight] = useState<string>('Loading strategic review...');
  const [timer, setTimer] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Initialize Data
  useEffect(() => {
    const saved = storage.get();
    setEntries(sanitizeEntries(saved));
  }, []);

  const todayStr = useMemo(() => getLocalISODate(), []);
  
  const todayEntry = useMemo(() => {
    const found = entries.find(e => e.date === todayStr);
    if (found) return found;
    return {
      date: todayStr,
      workout_done: false,
      sleep_planned: false,
      meals: {},
      posture: {},
      exercises: {},
      daily_xp: 0
    };
  }, [entries, todayStr]);

  // Derived Stats
  const totalXP = useMemo(() => entries.reduce((acc, curr) => acc + (curr.daily_xp || 0), 0), [entries]);
  
  const currentRank = useMemo(() => {
    let best = RANK_TIERS[0];
    for (const tier of RANK_TIERS) {
      if (totalXP >= tier.minXP) best = tier;
    }
    return best;
  }, [totalXP]);

  const nextRank = useMemo(() => {
    const idx = RANK_TIERS.findIndex(t => t.name === currentRank.name);
    return RANK_TIERS[idx + 1] || null;
  }, [currentRank]);

  const streakCount = useMemo(() => {
    let count = 0;
    const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let refDate = new Date(todayStr);
    
    // Check today first
    const today = sorted.find(e => e.date === todayStr);
    if (!today || today.daily_xp === 0) {
      refDate.setDate(refDate.getDate() - 1);
    }

    for (let i = 0; ; i++) {
      const iso = refDate.toISOString().split('T')[0];
      const entry = sorted.find(e => e.date === iso);
      if (entry && entry.daily_xp > 0) {
        count++;
        refDate.setDate(refDate.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [entries, todayStr]);

  const timeCtx = useMemo((): TimeContext => {
    if (entries.length === 0) return { season: 1, chapter: 1, dayInChapter: 1, totalDays: 1 };
    const firstDate = new Date(entries[0].date);
    const today = new Date(todayStr);
    const diff = Math.floor((today.getTime() - firstDate.getTime()) / (1000 * 3600 * 24)) + 1;
    return {
      season: Math.ceil(diff / 90),
      chapter: Math.ceil(diff / 7),
      dayInChapter: ((diff - 1) % 7) + 1,
      totalDays: diff
    };
  }, [entries, todayStr]);

  // Actions
  const updateEntry = useCallback((updates: Partial<DailyEntry>) => {
    const newEntries = [...entries];
    const idx = newEntries.findIndex(e => e.date === todayStr);
    
    let entryToUpdate: DailyEntry;
    if (idx >= 0) {
      entryToUpdate = { ...newEntries[idx], ...updates };
      newEntries[idx] = entryToUpdate;
    } else {
      entryToUpdate = { ...todayEntry, ...updates };
      newEntries.push(entryToUpdate);
    }

    // Calculate XP
    const mealCount = Object.values(entryToUpdate.meals).filter(Boolean).length;
    const postureCount = Object.values(entryToUpdate.posture).filter(Boolean).length;
    const habitPercent = (mealCount + postureCount) / (MEALS_LIST.length + POSTURE_LIST.length);
    
    let xp = 0;
    if (entryToUpdate.workout_done && habitPercent > 0.75) xp = 10;
    else if (entryToUpdate.workout_done || habitPercent > 0.4) xp = 5;

    entryToUpdate.daily_xp = xp;

    setEntries(sanitizeEntries(newEntries));
    storage.set(newEntries);
  }, [entries, todayStr, todayEntry]);

  // AI Refresh
  useEffect(() => {
    if (entries.length > 0) {
      getAIInsights(entries).then(setAiInsight);
    }
  }, [totalXP]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const startTimer = (seconds: number) => {
    setTimer(seconds);
    setIsTimerActive(true);
  };

  // UI Components
  const NavItem = ({ id, icon: Icon, label }: { id: TabId, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center w-16 transition-all duration-300 ${activeTab === id ? 'opacity-100' : 'opacity-40'}`}
    >
      <Icon className={`w-6 h-6 mb-1 ${activeTab === id ? 'text-white' : 'text-gray-400'}`} />
      <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );

  const dayOfWeek = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(todayStr).getDay()];
  }, [todayStr]);

  const currentWorkout = useMemo(() => WORKOUT_PLANS[dayOfWeek], [dayOfWeek]);

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden max-w-md mx-auto relative border-x border-white/5">
      {/* Header */}
      <header className="px-6 pt-6 pb-4 flex justify-between items-center bg-[#050505]/80 backdrop-blur-xl z-20">
        <div>
          <h1 className="text-xl font-black tracking-tight leading-none uppercase">Obsidian</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Discipline System</p>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-tighter text-gray-400">
            S{timeCtx.season} : CH {timeCtx.chapter}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-24">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative flex flex-col items-center justify-center py-12 mb-8">
              <div className="absolute w-64 h-64 rounded-full bg-white/[0.02] border border-white/[0.05] shadow-[inset_0_0_40px_rgba(255,255,255,0.02)] animate-portal" />
              <div className="relative z-10 text-center">
                <div className="text-8xl font-thin tracking-tighter mb-2 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                  {todayEntry.daily_xp}
                </div>
                <div className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-500" style={{ color: currentRank.color }}>
                  {todayEntry.daily_xp >= 10 ? 'Pattern Verified' : todayEntry.daily_xp > 0 ? 'Partial Entry' : 'No Record'}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.08] rounded-3xl p-6 flex justify-between items-center mb-8 backdrop-blur-md">
              <div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Continuity</div>
                <div className="text-3xl font-light tracking-tight">{streakCount} Days</div>
              </div>
              <Flame className="w-8 h-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6">
              <h3 className="text-[11px] font-black uppercase text-gray-600 tracking-widest mb-4">AI Performance Review</h3>
              <p className="text-sm text-gray-300 leading-relaxed font-medium italic">
                "{aiInsight}"
              </p>
            </div>

            <div className="mt-8">
              <h3 className="text-[11px] font-black uppercase text-gray-600 tracking-widest mb-4">Weekly Pattern</h3>
              <div className="flex justify-between items-end h-24 gap-1.5">
                {[...Array(7)].map((_, i) => {
                  const d = new Date(todayStr);
                  d.setDate(d.getDate() - (6 - i));
                  const iso = d.toISOString().split('T')[0];
                  const entry = entries.find(e => e.date === iso);
                  const xp = entry?.daily_xp || 0;
                  const h = xp === 10 ? 'h-full' : xp > 0 ? 'h-1/2' : 'h-2';
                  const color = xp === 10 ? currentRank.color : xp > 0 ? 'bg-white/20' : 'bg-white/5';
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className={`w-full rounded-full transition-all duration-700 ${h} ${color}`} style={{ backgroundColor: xp === 10 ? currentRank.color : undefined }} />
                      <span className="text-[9px] font-bold text-gray-600">{['S','M','T','W','T','F','S'][d.getDay()]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workout' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-block px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Training Focus: {currentWorkout.muscle}
            </div>

            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 mb-6 flex justify-between items-center">
              <div className="font-mono text-3xl font-bold tracking-tighter">
                {Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startTimer(60)} className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-bold uppercase">60s</button>
                <button onClick={() => setTimer(0)} className="px-3 py-1.5 bg-white/5 text-gray-500 rounded-lg text-[10px] font-bold uppercase">Reset</button>
              </div>
            </div>

            {currentWorkout.masai && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6 text-center">
                <div className="text-amber-500 text-xs font-black uppercase tracking-widest mb-1">High Impact Session</div>
                <div className="text-[10px] text-amber-500/70">Joint loading and high CNS output expected.</div>
              </div>
            )}

            <div className="space-y-3">
              {currentWorkout.exercises.map((ex, i) => {
                const isDone = todayEntry.exercises[i] || todayEntry.workout_done;
                return (
                  <button 
                    key={i}
                    onClick={() => {
                      const newEx = { ...todayEntry.exercises };
                      newEx[i] = !newEx[i];
                      updateEntry({ exercises: newEx });
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${isDone ? 'bg-white/5 border-white/20 opacity-50' : 'bg-white/[0.02] border-white/5'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isDone ? 'bg-white border-white' : 'border-white/20'}`}>
                      {isDone && <Check className="w-4 h-4 text-black" strokeWidth={4} />}
                    </div>
                    <div>
                      <div className={`font-bold text-sm ${isDone ? 'line-through' : ''}`}>{ex.split(':')[0]}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-wider">{ex.split(':')[1]}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button 
              onClick={() => updateEntry({ workout_done: !todayEntry.workout_done })}
              className={`w-full py-5 rounded-2xl mt-8 font-black uppercase tracking-widest transition-all duration-300 ${todayEntry.workout_done ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-white text-black'}`}
            >
              {todayEntry.workout_done ? 'Session Logged' : 'Log Completion'}
            </button>
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black mb-1">Fuel</h2>
            <p className="text-sm text-gray-500 mb-8">System input verification.</p>

            <div className="space-y-3">
              {MEALS_LIST.map((meal) => {
                const isDone = todayEntry.meals[meal.id];
                return (
                  <button 
                    key={meal.id}
                    onClick={() => {
                      const newMeals = { ...todayEntry.meals };
                      newMeals[meal.id] = !newMeals[meal.id];
                      updateEntry({ meals: newMeals });
                    }}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-5 ${isDone ? 'bg-white/5 border-white/20 opacity-50' : 'bg-white/[0.02] border-white/5'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isDone ? 'bg-white border-white' : 'border-white/20'}`}>
                      {isDone && <Check className="w-4 h-4 text-black" strokeWidth={4} />}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold text-base ${isDone ? 'line-through' : ''}`}>{meal.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{meal.detail}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-12 text-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">Fuel quality dictates training output.</div>
          </div>
        )}

        {activeTab === 'alignment' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black mb-1">Structure</h2>
            <p className="text-sm text-gray-500 mb-8">Maintenance of the physical framework.</p>

            <div className="space-y-3 mb-10">
              {POSTURE_LIST.map((item) => {
                const isDone = todayEntry.posture[item.id];
                return (
                  <button 
                    key={item.id}
                    onClick={() => {
                      const newPosture = { ...todayEntry.posture };
                      newPosture[item.id] = !newPosture[item.id];
                      updateEntry({ posture: newPosture });
                    }}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-5 ${isDone ? 'bg-white/5 border-white/20 opacity-50' : 'bg-white/[0.02] border-white/5'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isDone ? 'bg-white border-white' : 'border-white/20'}`}>
                      {isDone && <Check className="w-4 h-4 text-black" strokeWidth={4} />}
                    </div>
                    <div className="font-bold text-base ${isDone ? 'line-through' : ''}">{item.label}</div>
                  </button>
                );
              })}
            </div>

            <div className={`p-8 rounded-3xl border transition-all duration-500 ${todayEntry.sleep_planned ? 'border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.1)]' : 'border-white/5 bg-white/[0.02]'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Deep Recovery</h3>
                <span className="text-2xl">🌙</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">Negotiating with fatigue is a loss. High-tier recovery is non-negotiable for sustained momentum.</p>
              <button 
                onClick={() => updateEntry({ sleep_planned: !todayEntry.sleep_planned })}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 ${todayEntry.sleep_planned ? 'bg-indigo-500 text-white' : 'bg-white/5 border border-white/10 text-white'}`}
              >
                {todayEntry.sleep_planned ? 'Recovery Logged' : 'Log Sleep Intent'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'rank' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center justify-center py-10 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl opacity-20 animate-aura" style={{ backgroundColor: currentRank.color }} />
              
              <div className={`w-40 h-40 bg-white shadow-[0_0_60px_rgba(255,255,255,0.1)] mb-10 transition-all duration-1000 ${currentRank.shape}`} style={{ backgroundColor: currentRank.color }} />

              <div className="text-center z-10">
                <div className="text-xs font-black uppercase tracking-[0.5em] mb-2" style={{ color: currentRank.color }}>{currentRank.name}</div>
                <div className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6">Standing: {timeCtx.totalDays} Days</div>
                <p className="text-2xl font-light leading-snug max-w-[80%] mx-auto">{currentRank.subtitle}</p>
              </div>

              {nextRank && (
                <div className="w-full max-w-[200px] mt-12">
                  <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-1000" 
                      style={{ 
                        width: `${Math.min(100, ((totalXP - currentRank.minXP) / (nextRank.minXP - currentRank.minXP)) * 100)}%`,
                        backgroundColor: currentRank.color
                      }} 
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-[9px] font-bold uppercase tracking-widest text-gray-600">
                    <span>{totalXP} XP</span>
                    <span>Next Rank: {nextRank.minXP}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Total Load</div>
                <div className="text-2xl font-light">{totalXP}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-1">Active Rate</div>
                <div className="text-2xl font-light">{Math.round((streakCount / (timeCtx.totalDays || 1)) * 100)}%</div>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-2 opacity-30 hover:opacity-100 transition-opacity justify-center pb-10">
              <button onClick={() => {
                const data = JSON.stringify(entries);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `obsidian_backup_${todayStr}.json`;
                a.click();
              }} className="p-2 bg-white/5 border border-white/10 rounded-lg"><Download className="w-4 h-4" /></button>
              
              <label className="p-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer">
                <Upload className="w-4 h-4" />
                <input type="file" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    try {
                      const json = JSON.parse(ev.target?.result as string);
                      const sanitized = sanitizeEntries(json);
                      setEntries(sanitized);
                      storage.set(sanitized);
                    } catch { alert("Invalid data format."); }
                  };
                  reader.readAsText(file);
                }} />
              </label>

              <button onClick={() => {
                if (window.confirm("Total system reset? All infrastructure will be purged.")) {
                  storage.clear();
                  setEntries([]);
                  window.location.reload();
                }
              }} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500"><RotateCcw className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-[#050505]/90 backdrop-blur-2xl border-t border-white/[0.08] flex items-center justify-around px-2 z-30">
        <NavItem id="dashboard" icon={LayoutGrid} label="Log" />
        <NavItem id="workout" icon={Dumbbell} label="Train" />
        <NavItem id="nutrition" icon={Banana} label="Fuel" />
        <NavItem id="alignment" icon={User} label="Align" />
        <NavItem id="rank" icon={Trophy} label="Standing" />
      </nav>
      
      {/* Background Shapes for Clip-Paths */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <clipPath id="clip-hexagon" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0 L0.933,0.25 L0.933,0.75 L0.5,1 L0.067,0.75 L0.067,0.25 Z" />
          </clipPath>
          <clipPath id="clip-diamond" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0 L1,0.5 L0.5,1 L0,0.5 Z" />
          </clipPath>
          <clipPath id="clip-crest" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0 L1,0.25 L0.8,1 L0.2,1 L0,0.25 Z" />
          </clipPath>
          <clipPath id="clip-star" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0 L0.6,0.4 L1,0.4 L0.7,0.6 L0.8,1 L0.5,0.8 L0.2,1 L0.3,0.6 L0,0.4 L0.4,0.4 Z" />
          </clipPath>
          <clipPath id="clip-crown" clipPathUnits="objectBoundingBox">
            <path d="M0,0.2 L0.2,0.5 L0.5,0 L0.8,0.5 L1,0.2 L0.85,1 L0.15,1 Z" />
          </clipPath>
        </defs>
      </svg>

      <style>{`
        .clip-hexagon { clip-path: url(#clip-hexagon); }
        .clip-diamond { clip-path: url(#clip-diamond); }
        .clip-crest { clip-path: url(#clip-crest); }
        .clip-star { clip-path: url(#clip-star); }
        .clip-crown { clip-path: url(#clip-crown); }
      `}</style>
    </div>
  );
};

export default App;

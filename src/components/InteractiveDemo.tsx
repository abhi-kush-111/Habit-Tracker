import React, { useState, useRef, useEffect } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  YAxis,
  XAxis,
} from "recharts";
import { MoveHorizontal, ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "motion/react";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

const pushToDataLayer = (event: string, data?: any) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
  }
};

const INITIAL_HABITS = [
  { id: 1, name: "GYM", goal: 28, days: Array(28).fill(false) },
  { id: 2, name: "PRACTICE CODING", goal: 28, days: Array(28).fill(false) },
  { id: 3, name: "STUDY", goal: 28, days: Array(28).fill(false) },
  { id: 4, name: "WAKE UP AT 5 A.M", goal: 28, days: Array(28).fill(false) },
  { id: 5, name: "REVISION", goal: 28, days: Array(28).fill(false) },
  { id: 6, name: "LEARN NEW SKILL", goal: 28, days: Array(28).fill(false) },
  { id: 7, name: "EVENING WALK", goal: 28, days: Array(28).fill(false) },
];

// Pre-fill some data to match the image roughly
const PREFILLED_DATA = [
  [
    true,
    true,
    false,
    true,
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ],
  [
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    false,
    false,
  ],
  Array(28).fill(true),
  Array(28).fill(true),
  [
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    false,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ],
  [
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
  ],
  [
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ],
];

INITIAL_HABITS.forEach((h, i) => {
  h.days = [...PREFILLED_DATA[i]].slice(0, 28);
});

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDaysInMonth = (monthName: string) => 28;

export default function InteractiveDemo() {
  const [habits, setHabits] = useState(INITIAL_HABITS);
  const [selectedMonth, setSelectedMonth] = useState("February");
  const [hasScrolled, setHasScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(true);
  
  // GA4 Tracking Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const viewStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 312;
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 100);
    } else {
      isProgrammaticScroll.current = false;
    }
  }, []);

  // GA4 Intersection Observer for Visibility & Time Spent
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Dashboard came into view
            if (viewStartTime.current === null) {
              pushToDataLayer('dashboard_viewed');
              viewStartTime.current = Date.now();
            }
          } else {
            // Dashboard went out of view
            if (viewStartTime.current !== null) {
              const duration = Math.round((Date.now() - viewStartTime.current) / 1000);
              pushToDataLayer('dashboard_time_spent', { duration_seconds: duration });
              viewStartTime.current = null;
            }
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (viewStartTime.current !== null) {
        const duration = Math.round((Date.now() - viewStartTime.current) / 1000);
        pushToDataLayer('dashboard_time_spent', { duration_seconds: duration });
      }
      observer.disconnect();
    };
  }, []);

  const daysInMonth = getDaysInMonth(selectedMonth);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScroll.current || hasScrolled) return;
    setHasScrolled(true);
  };

  const toggleDay = (habitId: number, dayIndex: number) => {
    pushToDataLayer('dashboard_interacted', { 
      action: 'toggle_day', 
      habit_id: habitId, 
      day_index: dayIndex + 1 
    });
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const newDays = [...h.days];
          newDays[dayIndex] = !newDays[dayIndex];
          return { ...h, days: newDays };
        }
        return h;
      }),
    );
  };

  // Calculations
  const totalGoal = habits.reduce((sum, h) => sum + h.goal, 0);
  const totalCompleted = habits.reduce(
    (sum, h) => sum + h.days.slice(0, daysInMonth).filter(Boolean).length,
    0,
  );
  const totalLeft = totalGoal - totalCompleted;
  const completionPercent = Math.round((totalCompleted / totalGoal) * 100) || 0;

  const dailyCompletion = Array(daysInMonth)
    .fill(0)
    .map((_, dayIdx) => {
      return habits.filter((h) => h.days[dayIdx]).length;
    });

  const chartData = dailyCompletion.map((val, idx) => ({
    day: idx + 1,
    value: val,
  }));

  const pieData = [
    { name: "Completed", value: totalCompleted, color: "#f3b07c" },
    { name: "Left", value: totalLeft > 0 ? totalLeft : 0, color: "#e6e6e6" },
  ];

  // Week calculations
  const weeks = [
    { start: 0, end: 7, color: "#70a4b2", bg: "#e2ecef" },
    { start: 7, end: 14, color: "#c8e6c9", bg: "#f4fbf4" },
    { start: 14, end: 21, color: "#d1c4e9", bg: "#f6f3fc" },
    { start: 21, end: 28, color: "#f8bbd0", bg: "#fdf1f5" },
  ];

  const weeklyStats = weeks.map((w) => {
    const days = dailyCompletion.slice(w.start, w.end);
    const completed = days.reduce((a, b) => a + b, 0);
    const goal = habits.length * days.length;
    return {
      completed,
      goal,
      left: goal - completed,
      percent: goal > 0 ? Math.round((completed / goal) * 100) : 0,
    };
  });

  const week5Days = daysInMonth - 28;
  const week5Completion = dailyCompletion.slice(28, daysInMonth);
  const week5Completed = week5Completion.reduce((a, b) => a + b, 0);
  const week5Goal = habits.length * week5Days;
  const week5Percent =
    week5Goal > 0 ? Math.round((week5Completed / week5Goal) * 100) : 0;

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto bg-white border border-black p-2 font-sans text-xs shadow-2xl overflow-hidden relative group">
      {/* Mobile Swipe Hint */}
      {!hasScrolled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden flex items-center justify-center gap-3 py-2 mb-2 bg-blue-50/50 border border-blue-100 rounded-lg"
        >
          <motion.div
            animate={{ x: [-4, 4, -4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <MoveHorizontal size={14} className="text-blue-600" />
          </motion.div>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-700">
            Swipe to explore dashboard
          </span>
          <motion.div
            animate={{ x: [4, -4, 4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <MoveHorizontal size={14} className="text-blue-600" />
          </motion.div>
        </motion.div>
      )}

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 will-change-scroll"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onScroll={handleScroll}
        >
          <div className="min-w-[1000px] flex flex-col gap-2">
            {/* ROW 1 */}
            <div className="flex gap-2 h-40">
              <div className="w-[304px] shrink-0 flex flex-col gap-2">
                <div className="border border-black flex flex-col text-center bg-[#fcf3d9]">
                  <div className="text-xl font-bold py-2 border-b border-black">
                    HABIT TRACKER
                  </div>
                  <div className="py-1 font-bold bg-white">
                    -{selectedMonth}-
                  </div>
                </div>
                <div className="border border-black flex flex-col text-center bg-white flex-1">
                  <div className="py-1 font-bold bg-[#fcf3d9] border-b border-black">
                    CALENDAR SETTINGS
                  </div>
                  <div className="flex border-b border-black">
                    <div className="w-1/2 py-1 font-bold border-r border-black">
                      YEAR
                    </div>
                    <div className="w-1/2 py-1 font-bold">2026</div>
                  </div>
                  <div className="flex flex-1 items-center">
                    <div className="w-1/2 py-1 font-bold border-r border-black h-full flex items-center justify-center">
                      MONTH
                    </div>
                    <div className="w-1/2 py-1 px-2 h-full flex items-center justify-center relative">
                      <select
                        className="bg-gray-200 w-full rounded px-2 py-0.5 text-left font-bold text-[10px] outline-none cursor-pointer appearance-none"
                        value={selectedMonth}
                        onChange={(e) => {
                          pushToDataLayer('dashboard_interacted', { action: 'change_month', month: e.target.value });
                          setSelectedMonth(e.target.value);
                        }}
                      >
                        {MONTHS.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <span className="text-[8px] absolute right-4 pointer-events-none">
                        ▼
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 border border-black bg-white relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f3b07c"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f3b07c"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" hide />
                    <YAxis domain={[0, 7]} hide />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f3b07c"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      isAnimationActive={false}
                    />
                    <Bar dataKey="value" fill="transparent" isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="w-48 shrink-0 border border-black bg-white flex flex-col items-center justify-center relative">
                <div className="absolute top-2 flex gap-4 text-[8px] font-bold text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#f3b07c]"></div>{" "}
                    COMPLETED
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#e6e6e6]"></div>{" "}
                    LEFT
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={35}
                      outerRadius={55}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ROW 2 */}
            <div className="flex gap-2 h-32">
              <div className="w-[304px] shrink-0 flex border border-black">
                <div className="w-1/2 flex flex-col border-r border-black">
                  <div className="h-1/2 bg-[#fcf3d9] border-b border-black flex items-center justify-center font-bold text-center px-2">
                    COMPLETION %
                  </div>
                  <div className="h-1/2 bg-white flex items-center justify-center font-bold text-3xl">
                    {completionPercent}%
                  </div>
                </div>
                <div className="w-1/2 flex flex-col">
                  <div className="h-1/2 bg-[#fcf3d9] border-b border-black flex items-center justify-center font-bold">
                    OVERVIEW
                  </div>
                  <div className="h-1/2 bg-white flex flex-col text-[9px]">
                    <div className="flex border-b border-black flex-1">
                      <div className="w-full text-center border-r border-black flex items-center justify-center font-bold">
                        COMPLETED
                      </div>
                    </div>
                    <div className="flex border-b border-black flex-1">
                      <div className="w-full text-center border-r border-black flex items-center justify-center font-bold">
                        GOAL
                      </div>
                    </div>
                    <div className="flex border-b border-black flex-1">
                      <div className="w-full text-center border-r border-black flex items-center justify-center font-bold">
                        LEFT
                      </div>
                    </div>
                    <div className="flex flex-1">
                      <div className="w-full text-center border-r border-black flex items-center justify-center font-bold">
                        WEEKLY
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 border border-black bg-white flex">
                {weeks.map((week, wIdx) => (
                  <div
                    key={wIdx}
                    className="flex-1 border-r border-black last:border-r-0 flex flex-col"
                  >
                    <div className="flex-1 flex items-end justify-around px-1 pb-1 pt-2 gap-1 border-b border-black">
                      {dailyCompletion
                        .slice(week.start, week.end)
                        .map((val, dIdx) => (
                          <div
                            key={dIdx}
                            className="w-full flex flex-col items-center justify-end h-full"
                          >
                            <div
                              className="w-full"
                              style={{
                                height: `${(val / 7) * 100}%`,
                                backgroundColor: week.color,
                              }}
                            ></div>
                          </div>
                        ))}
                    </div>
                    <div className="h-16 flex flex-col text-[9px] text-center">
                      <div className="flex border-b border-black flex-1">
                        {dailyCompletion
                          .slice(week.start, week.end)
                          .map((val, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex-1 border-r border-black last:border-r-0 flex items-center justify-center"
                            >
                              {val}
                            </div>
                          ))}
                      </div>
                      <div className="flex border-b border-black flex-1">
                        {Array(7)
                          .fill(habits.length)
                          .map((val, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex-1 border-r border-black last:border-r-0 flex items-center justify-center"
                            >
                              {val}
                            </div>
                          ))}
                      </div>
                      <div className="flex border-b border-black flex-1">
                        {dailyCompletion
                          .slice(week.start, week.end)
                          .map((val, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex-1 border-r border-black last:border-r-0 flex items-center justify-center"
                            >
                              {habits.length - val}
                            </div>
                          ))}
                      </div>
                      <div className="flex flex-1">
                        <div className="flex-1 flex items-center justify-center font-bold">
                          {weeklyStats[wIdx].completed}/{weeklyStats[wIdx].goal}
                        </div>
                      </div>
                      <div className="flex flex-1 border-t border-black relative bg-white">
                        <div
                          className="absolute top-0 left-0 h-full bg-[#f3b07c] opacity-50 transition-all duration-300"
                          style={{ width: `${weeklyStats[wIdx].percent}%` }}
                        ></div>
                        <div className="flex-1 flex items-center justify-center relative z-10">
                          {weeklyStats[wIdx].percent}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {week5Days > 0 && (
                  <div
                    className="flex flex-col"
                    style={{ flex: `${week5Days / 7} 1 0%` }}
                  >
                    <div className="flex-1 flex items-end justify-around px-1 pb-1 pt-2 gap-1 border-b border-black">
                      {week5Completion.map((val, dIdx) => (
                        <div
                          key={dIdx}
                          className="w-full flex flex-col items-center justify-end h-full"
                        >
                          <div
                            className="w-full"
                            style={{
                              height: `${(val / 7) * 100}%`,
                              backgroundColor: "#bbdefb",
                            }}
                          ></div>
                        </div>
                      ))}
                    </div>
                    <div className="h-16 flex flex-col text-[9px] text-center">
                      <div className="flex border-b border-black flex-1">
                        {week5Completion.map((val, dIdx) => (
                          <div
                            key={dIdx}
                            className="flex-1 border-r border-black last:border-r-0 flex items-center justify-center"
                          >
                            {val}
                          </div>
                        ))}
                      </div>
                      <div className="flex border-b border-black flex-1">
                        {Array(week5Days)
                          .fill(habits.length)
                          .map((val, dIdx) => (
                            <div
                              key={dIdx}
                              className="flex-1 border-r border-black last:border-r-0 flex items-center justify-center"
                            >
                              {val}
                            </div>
                          ))}
                      </div>
                      <div className="flex border-b border-black flex-1">
                        {week5Completion.map((val, dIdx) => (
                          <div
                            key={dIdx}
                            className="flex-1 border-r border-black last:border-r-0 flex items-center justify-center"
                          >
                            {habits.length - val}
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-1 items-center justify-center font-bold">
                        {week5Completed}/{week5Goal}
                      </div>
                      <div className="flex flex-1 border-t border-black relative bg-white">
                        <div
                          className="absolute top-0 left-0 h-full bg-[#f3b07c] opacity-50 transition-all duration-300"
                          style={{ width: `${week5Percent}%` }}
                        ></div>
                        <div className="flex-1 flex items-center justify-center relative z-10">
                          {week5Percent}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="w-48 shrink-0 border border-black bg-white flex flex-col">
                <div className="bg-[#fcf3d9] border-b border-black py-2 text-center font-bold">
                  TOP HABITS
                </div>
                <div className="flex-1 flex flex-col p-2 gap-1 justify-center">
                  {[...habits]
                    .map((h) => ({
                      name: h.name,
                      completed: h.days.slice(0, daysInMonth).filter(Boolean)
                        .length,
                    }))
                    .sort((a, b) => b.completed - a.completed)
                    .slice(0, 5)
                    .map((h, idx) => (
                      <div key={idx} className="flex text-[10px] font-bold">
                        <span className="w-6">{idx + 1}</span>
                        <span className="text-center flex-1 truncate px-1">
                          {h.name}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* ROW 3 */}
            <div className="flex gap-2">
              <div className="w-64 shrink-0 flex flex-col border border-black bg-white">
                <div className="h-16 bg-[#fcf3d9] border-b border-black flex items-center justify-center font-bold text-lg">
                  DAILY HABITS
                </div>
                {habits.map((h) => (
                  <div
                    key={h.id}
                    className="h-6 border-b border-black last:border-b-0 flex items-center justify-center px-2 font-bold text-[10px]"
                  >
                    {h.name}
                  </div>
                ))}
              </div>

              <div className="w-10 shrink-0 flex flex-col border border-black bg-white">
                <div className="h-16 bg-[#fcf3d9] border-b border-black flex items-center justify-center font-bold text-[10px]">
                  GOAL
                </div>
                {habits.map((h) => (
                  <div
                    key={h.id}
                    className="h-6 border-b border-black last:border-b-0 flex items-center justify-center font-bold text-[10px]"
                  >
                    {h.goal}
                  </div>
                ))}
              </div>

              <div className="flex-1 flex border border-black bg-white">
                {weeks.map((week, wIdx) => (
                  <div
                    key={wIdx}
                    className="flex-1 flex flex-col border-r border-black"
                  >
                    <div
                      className="h-8 border-b border-black flex items-center justify-center font-bold"
                      style={{ backgroundColor: week.bg }}
                    >
                      WEEK {wIdx + 1}
                    </div>
                    <div className="h-4 border-b border-black flex">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (d) => (
                          <div
                            key={d}
                            className="flex-1 border-r border-black last:border-r-0 flex items-center justify-center text-[8px] font-bold"
                          >
                            {d}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="h-4 border-b border-black flex">
                      {Array(7)
                        .fill(0)
                        .map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 border-r border-black last:border-r-0 flex items-center justify-center text-[9px] font-bold"
                          >
                            {week.start + i + 1}
                          </div>
                        ))}
                    </div>
                    {habits.map((h) => (
                      <div
                        key={h.id}
                        className="h-6 border-b border-black last:border-b-0 flex"
                      >
                        {Array(7)
                          .fill(0)
                          .map((_, i) => {
                            const dayIdx = week.start + i;
                            const isChecked = h.days[dayIdx];
                            return (
                              <div
                                key={i}
                                className="flex-1 border-r border-black last:border-r-0 flex items-center justify-center cursor-pointer hover:bg-gray-100"
                                onClick={() => toggleDay(h.id, dayIdx)}
                              >
                                <div
                                  className={`w-3 h-3 border border-gray-400 rounded-sm flex items-center justify-center ${isChecked ? "bg-gray-200" : "bg-white"}`}
                                >
                                  {isChecked && (
                                    <span className="text-[8px] text-gray-600 font-bold">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                ))}
                {week5Days > 0 && (
                  <div
                    className="flex flex-col"
                    style={{ flex: `${week5Days / 7} 1 0%` }}
                  >
                    <div className="h-8 border-b border-black flex items-center justify-center font-bold bg-[#bbdefb] opacity-50">
                      WEEK 5
                    </div>
                    <div className="h-4 border-b border-black flex">
                      {["Sun", "Mon", "Tue"].slice(0, week5Days).map((d, i) => (
                        <div
                          key={d}
                          className={`flex-1 ${i < week5Days - 1 ? "border-r" : ""} border-black flex items-center justify-center text-[8px] font-bold`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="h-4 border-b border-black flex">
                      {[29, 30, 31].slice(0, week5Days).map((d, i) => (
                        <div
                          key={d}
                          className={`flex-1 ${i < week5Days - 1 ? "border-r" : ""} border-black flex items-center justify-center text-[9px] font-bold`}
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                    {habits.map((h) => (
                      <div
                        key={h.id}
                        className="h-6 border-b border-black last:border-b-0 flex"
                      >
                        {Array(week5Days)
                          .fill(0)
                          .map((_, i) => {
                            const dayIdx = 28 + i;
                            const isChecked = h.days[dayIdx];
                            return (
                              <div
                                key={i}
                                className={`flex-1 ${i < week5Days - 1 ? "border-r" : ""} border-black flex items-center justify-center cursor-pointer hover:bg-gray-100`}
                                onClick={() => toggleDay(h.id, dayIdx)}
                              >
                                <div
                                  className={`w-3 h-3 border border-gray-400 rounded-sm flex items-center justify-center ${isChecked ? "bg-gray-200" : "bg-white"}`}
                                >
                                  {isChecked && (
                                    <span className="text-[8px] text-gray-600 font-bold">
                                      ✓
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-48 shrink-0 flex border border-black bg-white">
                <div className="w-6 flex flex-col border-r border-black">
                  <div className="h-16 bg-[#fcf3d9] border-b border-black flex items-center justify-center">
                    <span className="transform -rotate-90 text-[8px] font-bold whitespace-nowrap">
                      COMPLETED
                    </span>
                  </div>
                  {habits.map((h) => {
                    const completed = h.days
                      .slice(0, daysInMonth)
                      .filter(Boolean).length;
                    return (
                      <div
                        key={h.id}
                        className="h-6 border-b border-black last:border-b-0 flex items-center justify-center text-[10px] font-bold"
                      >
                        {completed}
                      </div>
                    );
                  })}
                </div>
                <div className="w-6 flex flex-col border-r border-black">
                  <div className="h-16 bg-[#fcf3d9] border-b border-black flex items-center justify-center">
                    <span className="transform -rotate-90 text-[8px] font-bold whitespace-nowrap">
                      LEFT
                    </span>
                  </div>
                  {habits.map((h) => {
                    const completed = h.days
                      .slice(0, daysInMonth)
                      .filter(Boolean).length;
                    const left = h.goal - completed;
                    return (
                      <div
                        key={h.id}
                        className="h-6 border-b border-black last:border-b-0 flex items-center justify-center text-[10px] font-bold"
                      >
                        {left > 0 ? left : 0}
                      </div>
                    );
                  })}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="h-16 bg-[#fcf3d9] border-b border-black flex items-center justify-center font-bold">
                    PROGRESS
                  </div>
                  {habits.map((h) => {
                    const completed = h.days
                      .slice(0, daysInMonth)
                      .filter(Boolean).length;
                    const percent =
                      Math.min(100, Math.round((completed / h.goal) * 100)) ||
                      0;
                    return (
                      <div
                        key={h.id}
                        className="h-6 border-b border-black last:border-b-0 flex items-center px-1 gap-1"
                      >
                        <span className="text-[8px] font-bold w-6 text-right">
                          {percent}%
                        </span>
                        <div className="flex-1 h-3 bg-gray-100">
                          <div
                            className="h-full bg-[#f3b07c]"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Left and Right side directional cues */}
          {!hasScrolled && (
            <>
              <div className="md:hidden absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-white via-white/40 to-transparent pointer-events-none z-10" />
              <div className="md:hidden absolute top-1/2 left-2 -translate-y-1/2 z-20 pointer-events-none">
                <motion.div
                  animate={{ x: [0, -5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg border border-white/20"
                >
                  <ChevronLeft size={16} />
                </motion.div>
              </div>

              <div className="md:hidden absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-white via-white/40 to-transparent pointer-events-none z-10" />
              <div className="md:hidden absolute top-1/2 right-2 -translate-y-1/2 z-20 pointer-events-none">
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg border border-white/20"
                >
                  <ChevronRight size={16} />
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

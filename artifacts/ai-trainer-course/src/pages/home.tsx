import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useListCourses } from "@workspace/api-client-react";
import { Search, Clock, Users, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = [
  "AI Safety & Red Teaming",
  "AI Training & Alignment",
  "Data Quality & Evaluation",
  "Human Feedback",
];

const LEVELS = ["Advance", "Beginner", "Intermediate", "Expert"];

const SORT_OPTIONS = [
  { label: "Newest Data courses first", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Most Popular", value: "popular" },
];

const DISPLAY_ORDER = [4, 5, 6, 1, 2, 3, 7];

type CourseConfig = {
  price: number;
  gradient: string;
  titleColor: string;
  enroll?: boolean;
  featured?: boolean;
};

const COURSE_CONFIG: Record<number, CourseConfig> = {
  4: {
    price: 29,
    gradient: "from-red-950 via-red-900 to-rose-950",
    titleColor: "text-white",
  },
  5: {
    price: 19,
    gradient: "from-slate-950 via-blue-950 to-indigo-950",
    titleColor: "text-white",
  },
  6: {
    price: 29,
    gradient: "from-teal-900 via-emerald-950 to-cyan-950",
    titleColor: "text-teal-300",
  },
  1: {
    price: 29,
    gradient: "from-slate-900 via-blue-950 to-slate-900",
    titleColor: "text-white",
  },
  2: {
    price: 19,
    gradient: "from-slate-950 via-slate-900 to-blue-950",
    titleColor: "text-white",
  },
  3: {
    price: 29,
    gradient: "from-blue-950 via-slate-900 to-indigo-950",
    titleColor: "text-white",
    enroll: true,
  },
  7: {
    price: 49,
    gradient: "from-violet-950 via-purple-900 to-indigo-950",
    titleColor: "text-violet-200",
    featured: true,
  },
};

type Course = {
  id: number;
  title: string;
  description: string;
  level: string;
  durationHours: number;
  totalLessons: number;
  category: string;
  thumbnail: string;
  completionPercent?: number | null;
};

function CourseCard({ course }: { course: Course }) {
  const [, navigate] = useLocation();
  const cfg = COURSE_CONFIG[course.id] ?? { price: 29, gradient: "from-slate-900 to-blue-950", titleColor: "text-white" };

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      {/* Thumbnail */}
      <div className={`relative h-[140px] bg-gradient-to-br ${cfg.gradient} flex flex-col justify-between p-4 overflow-hidden`}>
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {cfg.featured && (
          <div className="relative z-10 flex justify-between items-start">
            <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">{course.category}</span>
            <span className="bg-violet-500/80 text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">Featured</span>
          </div>
        )}
        {!cfg.featured && (
          <div className="relative z-10">
            <span className="text-white/50 text-[10px] font-semibold uppercase tracking-widest">{course.category}</span>
          </div>
        )}
        <div className="relative z-10">
          <h3 className={`font-bold text-sm leading-snug line-clamp-2 ${cfg.titleColor}`}>{course.title}</h3>
        </div>
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-[11px] text-gray-500 line-clamp-2 mb-2.5 leading-relaxed">{course.description}</p>

        <div className="flex items-center gap-3 text-[11px] text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.durationHours}+ hrs
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {course.totalLessons} lessons
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900 text-[13px]">${cfg.price}.00<span className="text-gray-400 font-normal text-[11px]">/month</span></span>
          {cfg.featured ? (
            <span className="text-[11px] font-semibold bg-violet-600 text-white rounded px-3 py-1">
              Start Mastery
            </span>
          ) : cfg.enroll ? (
            <span className="text-[11px] font-semibold bg-blue-600 text-white rounded px-3 py-1">
              Enroll Now
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-blue-600 border border-blue-600 rounded px-3 py-1">
              View Course
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: courses, isLoading } = useListCourses();

  const [search, setSearch] = useState("");
  const [pendingCategories, setPendingCategories] = useState<string[]>([]);
  const [pendingLevels, setPendingLevels] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState(SORT_OPTIONS[0]);

  const togglePendingCategory = (cat: string) =>
    setPendingCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const togglePendingLevel = (lvl: string) =>
    setPendingLevels((prev) => prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]);

  const applyFilters = () => {
    setSelectedCategories(pendingCategories);
    setSelectedLevels(pendingLevels);
  };

  const displayCourses = useMemo(() => {
    if (!courses) return [];

    const ordered = [...courses].sort((a, b) => {
      const ai = DISPLAY_ORDER.indexOf(a.id);
      const bi = DISPLAY_ORDER.indexOf(b.id);
      if (ai === -1 && bi === -1) return a.id - b.id;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    let list = ordered;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategories.length > 0) {
      list = list.filter((c) => selectedCategories.includes(c.category));
    }
    if (selectedLevels.length > 0) {
      const normalised = selectedLevels.map((l) => (l === "Advance" ? "Advanced" : l));
      list = list.filter((c) => normalised.includes(c.level));
    }

    return list;
  }, [courses, search, selectedCategories, selectedLevels]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r bg-white px-4 py-5 hidden md:flex flex-col gap-5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-7 h-7 text-xs border-gray-200 bg-gray-50 focus:bg-white rounded"
          />
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2.5">Category</p>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-3 h-3 rounded-sm border-gray-300 accent-blue-600"
                  checked={pendingCategories.includes(cat)}
                  onChange={() => togglePendingCategory(cat)}
                />
                <span className="text-[11px] text-gray-600 group-hover:text-gray-900 leading-tight">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2.5">Level</p>
          <div className="space-y-2">
            {LEVELS.map((lvl) => (
              <label key={lvl} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-3 h-3 rounded-sm border-gray-300 accent-blue-600"
                  checked={pendingLevels.includes(lvl)}
                  onChange={() => togglePendingLevel(lvl)}
                />
                <span className="text-[11px] text-gray-600 group-hover:text-gray-900">{lvl}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={applyFilters}
          className="w-full h-7 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Apply Filter
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 px-5 py-5">
        {/* Sort bar */}
        <div className="flex items-center justify-end mb-4">
          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-1.5 text-[11px] text-gray-600 border border-gray-200 bg-white rounded px-2.5 py-1.5 hover:border-gray-300 transition-colors"
            >
              {sort.label}
              <ChevronDown className="h-3 w-3" />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-48 py-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setSort(opt); setSortOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-[11px] hover:bg-gray-50 transition-colors ${sort.value === opt.value ? "text-blue-600 font-semibold" : "text-gray-700"}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <Skeleton className="h-[140px] w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-7 w-full mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Search className="h-8 w-8 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No courses match your filters.</p>
            <button
              onClick={() => { setSearch(""); setPendingCategories([]); setPendingLevels([]); setSelectedCategories([]); setSelectedLevels([]); }}
              className="text-blue-600 text-xs mt-2 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Video,
  PlayCircle,
  Clock,
  CheckCircle2,
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  FileText,
  Sparkles,
  LayoutGrid,
  List,
  ChevronRight,
  GraduationCap,
  Play,
  RotateCcw,
} from "lucide-react";
import { DataService, VideoLessonRecord, LearningModuleRecord } from "@/lib/data-service";

export default function VideoLecturesLibraryPage() {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<LearningModuleRecord[]>([]);
  const [lessons, setLessons] = useState<VideoLessonRecord[]>([]);
  const [metrics, setMetrics] = useState({
    totalLectures: 0,
    completedLectures: 0,
    inProgressLectures: 0,
    totalDurationHours: "0.0",
    watchedDurationHours: "0.0",
    completionRate: 0,
  });
  const [continueLearning, setContinueLearning] = useState<VideoLessonRecord | null>(null);

  // Filters & View state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedSemester, setSelectedSemester] = useState("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await DataService.getLearningContent({
        subjectId: selectedSubject,
        semester: selectedSemester,
        search: searchQuery,
      });
      setModules(data.modules);
      setLessons(data.lessons);
      setMetrics(data.metrics);
      setContinueLearning(data.continueLearning);
    } catch (err) {
      console.error("Error loading video lectures:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSubject, selectedSemester]);

  // Handle client-side search debounce / immediate filtering
  const filteredLessons = useMemo(() => {
    if (!searchQuery.trim()) return lessons;
    const q = searchQuery.toLowerCase().trim();
    return lessons.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.subjectName.toLowerCase().includes(q) ||
        l.subjectCode.toLowerCase().includes(q) ||
        (l.moduleTitle && l.moduleTitle.toLowerCase().includes(q))
    );
  }, [lessons, searchQuery]);

  // Extract unique subjects for the filter dropdown
  const uniqueSubjects = useMemo(() => {
    const map = new Map<string, { id: string; code: string; name: string }>();
    lessons.forEach((l) => {
      if (!map.has(l.subjectCode)) {
        map.set(l.subjectCode, { id: l.subjectId, code: l.subjectCode, name: l.subjectName });
      }
    });
    return Array.from(map.values());
  }, [lessons]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Academic Library
            </span>
            <span className="text-xs text-slate-500 font-medium">Digital Courseware</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Video Lectures & Courseware</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Stream high-definition lecture modules, review syllabus units, and track completion progress.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Refresh Library
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Strip (Stitch Screen 30) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {metrics.totalLectures}
            </div>
            <div className="text-xs font-medium text-slate-500">Available Lectures</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {metrics.inProgressLectures}
            </div>
            <div className="text-xs font-medium text-slate-500">In Progress</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {metrics.completedLectures}
            </div>
            <div className="text-xs font-medium text-slate-500">Completed</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">
              {metrics.watchedDurationHours} <span className="text-xs font-normal text-slate-400">/ {metrics.totalDurationHours} hrs</span>
            </div>
            <div className="text-xs font-medium text-slate-500">Watch Time ({metrics.completionRate}%)</div>
          </div>
        </div>
      </div>

      {/* 3. Continue Learning Hero Banner (Stitch Screen 30) */}
      {continueLearning && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Thumbnail with interactive play button overlay */}
              <div className="relative w-full sm:w-56 aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10 shrink-0 group">
                <img
                  src={continueLearning.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"}
                  alt={continueLearning.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center group-hover:bg-slate-950/20 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-white/90 text-blue-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold tracking-wider text-white">
                  {DataService.formatDuration(continueLearning.durationSec)}
                </div>
              </div>

              {/* Lecture Metadata */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                    Continue Learning
                  </span>
                  <span className="text-xs text-blue-200/80 font-medium">
                    {continueLearning.subjectCode} • {continueLearning.subjectName}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                  {continueLearning.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1 max-w-xl">
                  {continueLearning.moduleTitle || "Curriculum Unit"} • Instructor: {continueLearning.facultyName || "Department Faculty"}
                </p>

                {/* Progress bar */}
                <div className="pt-1 max-w-md">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                    <span>
                      {continueLearning.progress
                        ? `${Math.round((continueLearning.progress.watchedSeconds / (continueLearning.durationSec || 1)) * 100)}% Watched`
                        : "Ready to start"}
                    </span>
                    <span>
                      {continueLearning.progress
                        ? `${DataService.formatDuration(continueLearning.durationSec - continueLearning.progress.watchedSeconds)} remaining`
                        : DataService.formatDuration(continueLearning.durationSec)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          continueLearning.progress
                            ? Math.min(100, Math.round((continueLearning.progress.watchedSeconds / (continueLearning.durationSec || 1)) * 100))
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="shrink-0 flex sm:self-center">
              <Link
                href={`/student/subjects/${continueLearning.subjectId}/lectures/${continueLearning.id}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Playback</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. Search and Filter Toolbar (Stitch Screen 30) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lectures, topics, units, or algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-800 focus:bg-white transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-800"
          >
            <option value="ALL">All Subjects</option>
            {uniqueSubjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} — {sub.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-800"
          >
            <option value="ALL">All Semesters</option>
            <option value="6">Semester 6</option>
            <option value="5">Semester 5</option>
            <option value="4">Semester 4</option>
            <option value="3">Semester 3</option>
            <option value="2">Semester 2</option>
            <option value="1">Semester 1</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "grid" ? "bg-white text-blue-900 shadow-xs font-semibold" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === "list" ? "bg-white text-blue-900 shadow-xs font-semibold" : "text-slate-500 hover:text-slate-800"
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Lecture Content Display */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse">
              <div className="aspect-video bg-slate-200 rounded-lg" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No video lectures found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Try adjusting your subject or semester filters, or search terms to browse other courseware.
          </p>
          {(selectedSubject !== "ALL" || selectedSemester !== "ALL" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSubject("ALL");
                setSelectedSemester("ALL");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((lesson) => {
            const isCompleted = lesson.progress?.isCompleted;
            const watchedSec = lesson.progress?.watchedSeconds || 0;
            const percent = Math.min(100, Math.round((watchedSec / (lesson.durationSec || 1)) * 100));

            return (
              <div
                key={lesson.id}
                className="bg-white rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all flex flex-col overflow-hidden group"
              >
                {/* 16:9 Thumbnail preview */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden shrink-0">
                  <img
                    src={lesson.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"}
                    alt={lesson.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-blue-900 flex items-center justify-center shadow-md">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-600 text-white shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : watchedSec > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white shadow-xs">
                        <Clock className="w-3 h-3" />
                        {percent}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/70 text-slate-200 backdrop-blur-xs">
                        Lec {lesson.orderIndex.toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>

                  {/* Duration pill */}
                  <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 text-[10px] font-semibold tracking-wider text-white">
                    {DataService.formatDuration(lesson.durationSec)}
                  </div>

                  {/* Watched Progress bar overlay */}
                  {watchedSec > 0 && !isCompleted && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                      <div className="h-full bg-amber-400" style={{ width: `${percent}%` }} />
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="text-blue-800 font-semibold">{lesson.subjectCode}</span>
                      <span>Sem {lesson.semester || 6}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-900 transition-colors">
                      {lesson.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {lesson.description || "In-depth lecture and theoretical foundations."}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      {lesson.resources && lesson.resources.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                          <FileText className="w-3.5 h-3.5 text-blue-800" />
                          {lesson.resources.length} {lesson.resources.length === 1 ? "Resource" : "Resources"}
                        </span>
                      ) : (
                        <span>Curriculum Video</span>
                      )}
                    </div>

                    <Link
                      href={`/student/subjects/${lesson.subjectId}/lectures/${lesson.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-800 hover:text-blue-900 group-hover:translate-x-0.5 transition-all"
                    >
                      <span>{isCompleted ? "Review" : watchedSec > 0 ? "Resume" : "Watch"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredLessons.map((lesson) => {
            const isCompleted = lesson.progress?.isCompleted;
            const watchedSec = lesson.progress?.watchedSeconds || 0;
            const percent = Math.min(100, Math.round((watchedSec / (lesson.durationSec || 1)) * 100));

            return (
              <div
                key={lesson.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Small 16:9 thumbnail */}
                  <div className="relative w-32 aspect-video bg-slate-900 rounded-lg overflow-hidden shrink-0 shadow-xs">
                    <img
                      src={lesson.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"}
                      alt={lesson.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-semibold text-white">
                      {DataService.formatDuration(lesson.durationSec)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                        {lesson.subjectCode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {lesson.moduleTitle || "Curriculum Unit"}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      )}
                      {!isCompleted && watchedSec > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          <Clock className="w-3 h-3" /> {percent}%
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {lesson.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                      {lesson.description || "Video lecture details and academic syllabus references."}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3 sm:self-center w-full sm:w-auto justify-end">
                  {lesson.resources && lesson.resources.length > 0 && (
                    <span className="text-xs text-slate-500 hidden md:inline-block">
                      {lesson.resources.length} resources
                    </span>
                  )}

                  <Link
                    href={`/student/subjects/${lesson.subjectId}/lectures/${lesson.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isCompleted ? "Review" : watchedSec > 0 ? "Resume" : "Watch"}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

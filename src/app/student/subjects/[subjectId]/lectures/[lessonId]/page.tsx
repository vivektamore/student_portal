"use client";

import React, { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  CheckCircle2,
  Circle,
  FileText,
  Download,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock,
  Share2,
  AlertTriangle,
  ExternalLink,
  Info,
  Check,
  ListVideo,
  Bookmark,
  GraduationCap,
} from "lucide-react";
import { DataService, VideoLessonRecord, LearningModuleRecord, LessonResourceRecord } from "@/lib/data-service";

interface PageProps {
  params: Promise<{
    subjectId: string;
    lessonId: string;
  }>;
}

export default function VideoLessonPlayerPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { subjectId, lessonId } = resolvedParams;

  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState<VideoLessonRecord | null>(null);
  const [playlist, setPlaylist] = useState<VideoLessonRecord[]>([]);
  const [currentModule, setCurrentModule] = useState<LearningModuleRecord | null>(null);
  const [prevLesson, setPrevLesson] = useState<VideoLessonRecord | null>(null);
  const [nextLesson, setNextLesson] = useState<VideoLessonRecord | null>(null);

  // Video playback & progress states
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasResumed, setHasResumed] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "resources">("overview");
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Fetch lesson and playlist data
  useEffect(() => {
    let isMounted = true;
    async function fetchLessonData() {
      setLoading(true);
      setVideoError(false);
      try {
        const data = await DataService.getVideoLesson(subjectId, lessonId);
        if (!isMounted) return;

        setLesson(data.lesson);
        setPlaylist(data.playlist);
        setCurrentModule(data.currentModule);
        setPrevLesson(data.prevLesson);
        setNextLesson(data.nextLesson);

        if (data.lesson?.progress) {
          setWatchedSeconds(data.lesson.progress.watchedSeconds || 0);
          setIsCompleted(Boolean(data.lesson.progress.isCompleted));
        } else {
          setWatchedSeconds(0);
          setIsCompleted(false);
        }
      } catch (err) {
        console.error("Failed to load lesson:", err);
        setVideoError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLessonData();
    return () => {
      isMounted = false;
    };
  }, [subjectId, lessonId]);

  // Persist progress to server
  const saveProgress = async (newWatchedSec: number, newIsCompleted?: boolean) => {
    if (!lesson) return;
    setIsSavingProgress(true);
    try {
      const completed = newIsCompleted !== undefined ? newIsCompleted : isCompleted;
      await DataService.saveLessonProgress(lesson.id, newWatchedSec, completed);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2000);
    } catch (err) {
      console.warn("Failed to persist lesson progress:", err);
    } finally {
      setIsSavingProgress(false);
    }
  };

  // Toggle completion
  const handleToggleCompletion = async () => {
    const updated = !isCompleted;
    setIsCompleted(updated);
    const finalWatched = updated ? (lesson?.durationSec || watchedSeconds) : watchedSeconds;
    setWatchedSeconds(finalWatched);
    await saveProgress(finalWatched, updated);
  };

  // Handle HTML5 video time updates
  const handleTimeUpdate = () => {
    if (videoElementRef.current) {
      const current = Math.floor(videoElementRef.current.currentTime);
      setWatchedSeconds(current);
      // Automatically save milestone progress every 15 seconds
      if (current > 0 && current % 15 === 0) {
        saveProgress(current);
      }
      // Auto complete when student reaches 95% of video
      if (lesson && lesson.durationSec > 0 && current >= lesson.durationSec * 0.95 && !isCompleted) {
        setIsCompleted(true);
        saveProgress(current, true);
      }
    }
  };

  // Resume playback on HTML5 video load
  const handleVideoLoaded = () => {
    if (videoElementRef.current && watchedSeconds > 0 && !hasResumed) {
      videoElementRef.current.currentTime = watchedSeconds;
      setHasResumed(true);
    }
  };

  // Determine provider & embed URL
  const getEmbedInfo = (url: string, resumeSec: number) => {
    if (!url) return { type: "empty" };

    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      const ytId = ytMatch[1];
      const startParam = resumeSec > 0 ? `&start=${resumeSec}` : "";
      return {
        type: "youtube",
        src: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1${startParam}`,
        id: ytId,
      };
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) {
      const vimeoId = vimeoMatch[1];
      const timeHash = resumeSec > 0 ? `#t=${resumeSec}s` : "";
      return {
        type: "vimeo",
        src: `https://player.vimeo.com/video/${vimeoId}${timeHash}`,
        id: vimeoId,
      };
    }

    // Direct MP4 / WebM / HLS stream
    if (url.match(/\.(mp4|webm|ogg|m3u8)(\?.*)?$/i)) {
      return {
        type: "html5",
        src: url,
      };
    }

    // Generic iframe fallback
    return {
      type: "iframe",
      src: url,
    };
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-5 bg-slate-200 rounded w-1/4" />
        <div className="aspect-video bg-slate-200 rounded-2xl w-full" />
        <div className="h-8 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (!lesson || videoError) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Lecture Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1">
          The requested video lecture could not be loaded or may not be published yet.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/student/lectures"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Back to Lectures
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const embedInfo = getEmbedInfo(lesson.videoUrl, watchedSeconds);
  const percentComplete = Math.min(100, Math.round((watchedSeconds / (lesson.durationSec || 1)) * 100));

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumbs & Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 flex-wrap">
          <Link href="/student/lectures" className="hover:text-blue-800 font-medium transition-colors">
            Video Lectures
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href={`/student/subjects/${lesson.subjectId}`} className="hover:text-blue-800 font-medium transition-colors">
            {lesson.subjectCode}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold line-clamp-1 max-w-xs">{lesson.title}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {prevLesson ? (
            <Link
              href={`/student/subjects/${prevLesson.subjectId}/lectures/${prevLesson.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              <SkipBack className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-100 text-slate-300 text-xs cursor-not-allowed">
              <SkipBack className="w-3.5 h-3.5" />
              <span>Previous</span>
            </span>
          )}

          {nextLesson ? (
            <Link
              href={`/student/subjects/${nextLesson.subjectId}/lectures/${nextLesson.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-medium text-xs shadow-xs transition-colors"
            >
              <span>Next Lesson</span>
              <SkipForward className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-400 text-xs cursor-not-allowed">
              <span>Next Lesson</span>
              <SkipForward className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* 2. Main Player Layout Grid (Player on Left, Playlist on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: 16:9 Video Player & Lesson Details (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Responsive 16:9 Player Container */}
          <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-800">
            {embedInfo.type === "youtube" ? (
              <iframe
                src={embedInfo.src}
                title={lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : embedInfo.type === "vimeo" ? (
              <iframe
                src={embedInfo.src}
                title={lesson.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : embedInfo.type === "html5" ? (
              <video
                ref={videoElementRef}
                src={embedInfo.src}
                controls
                className="w-full h-full object-contain"
                onLoadedMetadata={handleVideoLoaded}
                onTimeUpdate={handleTimeUpdate}
                poster={lesson.thumbnailUrl}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <iframe
                src={lesson.videoUrl}
                title={lesson.title}
                allowFullScreen
                className="w-full h-full border-0"
              />
            )}

            {/* Resume Playback Indicator overlay pill */}
            {watchedSeconds > 0 && !isCompleted && (
              <div className="absolute top-3 right-3 pointer-events-none bg-black/80 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-white/10">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Resumed at {DataService.formatDuration(watchedSeconds)}</span>
              </div>
            )}
          </div>

          {/* Player Controls Bar & Completion Action */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleCompletion}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  isCompleted
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    : "bg-blue-800 text-white hover:bg-blue-900 shadow-xs"
                }`}
              >
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Mark as Completed</span>
                  </>
                )}
              </button>

              {watchedSeconds > 0 && (
                <button
                  onClick={() => {
                    setWatchedSeconds(0);
                    saveProgress(0, false);
                    if (videoElementRef.current) videoElementRef.current.currentTime = 0;
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
                  title="Reset playback to beginning"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart</span>
                </button>
              )}

              {saveSuccessNotice && (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 animate-fade-in">
                  <Check className="w-3 h-3" /> Progress Saved
                </span>
              )}
            </div>

            {/* Progress summary */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="text-right">
                <span className="font-semibold text-slate-800">
                  {DataService.formatDuration(watchedSeconds)}
                </span>
                <span className="text-slate-400"> / {DataService.formatDuration(lesson.durationSec)}</span>
                <div className="text-[10px] text-slate-400 font-medium">({percentComplete}% finished)</div>
              </div>

              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCompleted ? "bg-emerald-500" : "bg-blue-800"
                  }`}
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lecture Metadata & Header */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-100">
                {lesson.subjectCode}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {lesson.subjectName}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {lesson.moduleTitle || "Curriculum Unit"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {lesson.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Duration: {DataService.formatDuration(lesson.durationSec)}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Instructor: {lesson.facultyName || "Department Faculty"}
              </span>
              {lesson.resources && lesson.resources.length > 0 && (
                <span className="flex items-center gap-1.5 text-blue-800 font-medium">
                  <FileText className="w-3.5 h-3.5" />
                  {lesson.resources.length} Downloadable {lesson.resources.length === 1 ? "Resource" : "Resources"}
                </span>
              )}
            </div>

            {/* Tabbed Navigation (Overview, Syllabus Notes, Resources) */}
            <div className="border-b border-slate-200 pt-3">
              <nav className="flex space-x-6 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    activeTab === "overview"
                      ? "border-blue-800 text-blue-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Lecture Overview
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    activeTab === "notes"
                      ? "border-blue-800 text-blue-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Syllabus Notes & Proofs
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`pb-2.5 border-b-2 transition-colors ${
                    activeTab === "resources"
                      ? "border-blue-800 text-blue-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Resources & Downloads ({lesson.resources?.length || 0})
                </button>
              </nav>
            </div>

            {/* Tab Panels */}
            {activeTab === "overview" && (
              <div className="space-y-3 pt-2 text-xs text-slate-700 leading-relaxed">
                <p>{lesson.description || "In-depth lecture explaining theoretical paradigms, complexity analysis, and algorithms."}</p>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="font-semibold text-slate-900 block">Unit Context</span>
                  <p className="text-slate-600">
                    This lesson forms part of {lesson.moduleTitle || "the main syllabus"}. Review the syllabus notes and downloadable materials to prepare for mid-semester assignments.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="pt-2 text-xs text-slate-700 space-y-3 leading-relaxed">
                {lesson.notes ? (
                  <pre className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs whitespace-pre-wrap text-slate-800 leading-normal">
                    {lesson.notes}
                  </pre>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg">
                    No dedicated syllabus notes provided for this lesson yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === "resources" && (
              <div className="space-y-3 pt-2">
                {lesson.resources && lesson.resources.length > 0 ? (
                  <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden">
                    {lesson.resources.map((res) => (
                      <div
                        key={res.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">{res.title}</div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {res.fileType.toUpperCase()} • {res.fileSize || "1.5 MB"}
                            </div>
                          </div>
                        </div>

                        <a
                          href={res.fileUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-300 text-xs font-medium text-slate-700 hover:text-blue-900 shadow-xs transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-lg text-xs">
                    No downloadable attachments for this lecture.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Lesson Playlist & Chapter Navigation (1 col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Playlist Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListVideo className="w-4 h-4 text-blue-800" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Course Playlist
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {playlist.length} {playlist.length === 1 ? "Lesson" : "Lessons"}
              </span>
            </div>

            {/* Playlist Item List */}
            <div className="divide-y divide-slate-100 max-h-[640px] overflow-y-auto">
              {playlist.map((item, idx) => {
                const isCurrent = item.id === lesson.id;
                const isItemCompleted = item.progress?.isCompleted;
                const itemWatched = item.progress?.watchedSeconds || 0;

                return (
                  <Link
                    key={item.id}
                    href={`/student/subjects/${item.subjectId}/lectures/${item.id}`}
                    className={`p-3.5 flex items-start gap-3 transition-colors block ${
                      isCurrent
                        ? "bg-blue-50/80 border-l-4 border-blue-800"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="mt-0.5 shrink-0">
                      {isItemCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full bg-blue-800 text-white flex items-center justify-center text-[9px] font-bold">
                          ▶
                        </div>
                      ) : itemWatched > 0 ? (
                        <Clock className="w-4 h-4 text-amber-500" />
                      ) : (
                        <span className="text-xs font-bold text-slate-400">
                          {(idx + 1).toString().padStart(2, "0")}
                        </span>
                      )}
                    </div>

                    {/* Lesson Details */}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 text-[10px] text-slate-500 font-medium">
                        <span className="line-clamp-1">{item.moduleTitle || `Unit ${idx + 1}`}</span>
                        <span>{DataService.formatDuration(item.durationSec)}</span>
                      </div>

                      <h4
                        className={`text-xs font-semibold leading-snug line-clamp-2 ${
                          isCurrent ? "text-blue-900 font-bold" : "text-slate-800"
                        }`}
                      >
                        {item.title}
                      </h4>

                      {/* Watched progress bar indicator */}
                      {itemWatched > 0 && !isItemCompleted && (
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.round((itemWatched / (item.durationSec || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Help / Syllabus Card */}
          <div className="bg-blue-900 text-white p-5 rounded-xl shadow-xs space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-300" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Course Guidance
              </h4>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              Video lessons are synchronized with semester examination requirements. Complete all lessons in this unit to unlock practice quizzes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

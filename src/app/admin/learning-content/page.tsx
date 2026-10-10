"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Video,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  Archive,
  FileText,
  Upload,
  ExternalLink,
  Layers,
  X,
  Play,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Check,
  Film,
} from "lucide-react";
import { DataService, SubjectRecord, LearningModuleRecord, VideoLessonRecord, LessonResourceRecord } from "@/lib/data-service";

export default function AdminLearningContentPage() {
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [modules, setModules] = useState<LearningModuleRecord[]>([]);
  const [lessons, setLessons] = useState<VideoLessonRecord[]>([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState("ALL");

  // Modals state
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<VideoLessonRecord | null>(null);
  const [editingLesson, setEditingLesson] = useState<VideoLessonRecord | null>(null);

  // Lesson Form state
  const [formLessonId, setFormLessonId] = useState("");
  const [formSubjectId, setFormSubjectId] = useState("");
  const [formModuleId, setFormModuleId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formDurationMinutes, setFormDurationMinutes] = useState(45);
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formOrderIndex, setFormOrderIndex] = useState(1);
  const [formStatus, setFormStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("PUBLISHED");
  const [formResources, setFormResources] = useState<
    Array<{ id?: string; title: string; fileUrl: string; fileType: string; fileSize: string }>
  >([]);

  // Module Form state
  const [formNewModuleSubjectId, setFormNewModuleSubjectId] = useState("");
  const [formNewModuleTitle, setFormNewModuleTitle] = useState("");
  const [formNewModuleDescription, setFormNewModuleDescription] = useState("");
  const [formNewModuleOrder, setFormNewModuleOrder] = useState(1);

  // Notification state
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectsList, contentData] = await Promise.all([
        DataService.getSubjects(),
        DataService.getLearningContent({
          subjectId: selectedSubjectFilter,
          status: selectedStatusFilter,
          semester: selectedSemesterFilter,
        }),
      ]);
      setSubjects(subjectsList);
      setModules(contentData.modules);
      setLessons(contentData.lessons);

      if (!formSubjectId && subjectsList.length > 0) {
        setFormSubjectId(subjectsList[0].id);
        setFormNewModuleSubjectId(subjectsList[0].id);
      }
    } catch (err) {
      console.error("Failed to load learning content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSubjectFilter, selectedStatusFilter, selectedSemesterFilter]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(null), 3500);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  // Filter lessons in memory by search query
  const filteredLessons = useMemo(() => {
    let result = lessons;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.subjectName.toLowerCase().includes(q) ||
          l.subjectCode.toLowerCase().includes(q) ||
          (l.moduleTitle && l.moduleTitle.toLowerCase().includes(q))
      );
    }
    return result;
  }, [lessons, searchQuery]);

  // Available modules for current selected subject in the lesson form
  const availableFormModules = useMemo(() => {
    return modules.filter((m) => m.subjectId === formSubjectId);
  }, [modules, formSubjectId]);

  // Open modal for new lesson
  const handleOpenNewLesson = () => {
    setEditingLesson(null);
    setFormLessonId("");
    const defaultSubject = subjects[0]?.id || "";
    setFormSubjectId(defaultSubject);
    const subMods = modules.filter((m) => m.subjectId === defaultSubject);
    setFormModuleId(subMods[0]?.id || "new");
    setFormTitle("");
    setFormDescription("");
    setFormNotes("");
    setFormDurationMinutes(45);
    setFormVideoUrl("https://www.youtube.com/watch?v=4Zq2Ed642lk");
    setFormThumbnailUrl("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80");
    setFormOrderIndex(lessons.length + 1);
    setFormStatus("PUBLISHED");
    setFormResources([
      {
        title: "Lecture Notes & Formula Cheatsheet",
        fileUrl: "/resources/syllabus-notes.pdf",
        fileType: "pdf",
        fileSize: "2.1 MB",
      },
    ]);
    setShowLessonModal(true);
  };

  // Open modal for editing existing lesson
  const handleOpenEditLesson = (lesson: VideoLessonRecord) => {
    setEditingLesson(lesson);
    setFormLessonId(lesson.id);
    setFormSubjectId(lesson.subjectId);
    setFormModuleId(lesson.moduleId);
    setFormTitle(lesson.title);
    setFormDescription(lesson.description || "");
    setFormNotes(lesson.notes || "");
    setFormDurationMinutes(Math.round(lesson.durationSec / 60) || 45);
    setFormVideoUrl(lesson.videoUrl);
    setFormThumbnailUrl(lesson.thumbnailUrl || "");
    setFormOrderIndex(lesson.orderIndex);
    setFormStatus(lesson.status);
    setFormResources(
      lesson.resources?.map((r) => ({
        id: r.id,
        title: r.title,
        fileUrl: r.fileUrl,
        fileType: r.fileType,
        fileSize: r.fileSize || "1.5 MB",
      })) || []
    );
    setShowLessonModal(true);
  };

  // Save or update lesson to backend
  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formVideoUrl) {
      showNotification("Please provide both a Title and Video Source URL.", true);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        action: "save_lesson",
        lessonData: {
          id: formLessonId || undefined,
          subjectId: formSubjectId,
          moduleId: formModuleId === "new" ? undefined : formModuleId,
          title: formTitle,
          description: formDescription,
          notes: formNotes,
          durationSec: Number(formDurationMinutes) * 60,
          videoUrl: formVideoUrl,
          thumbnailUrl: formThumbnailUrl,
          orderIndex: Number(formOrderIndex) || 1,
          status: formStatus,
          resources: formResources,
        },
      };

      const res = await fetch("/api/learning-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save lesson");
      }

      showNotification(
        formLessonId ? "Video lecture updated successfully!" : "New video lecture created & published!"
      );
      setShowLessonModal(false);
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  // Save new module
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNewModuleTitle || !formNewModuleSubjectId) {
      showNotification("Please specify a Subject and Unit Title.", true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/learning-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_module",
          moduleData: {
            subjectId: formNewModuleSubjectId,
            title: formNewModuleTitle,
            description: formNewModuleDescription,
            orderIndex: Number(formNewModuleOrder) || 1,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to create module");
      }

      showNotification("Learning Unit created successfully!");
      setShowModuleModal(false);
      setFormNewModuleTitle("");
      setFormNewModuleDescription("");
      loadData();
    } catch (err: any) {
      showNotification(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle publish status directly from table
  const handleQuickStatusChange = async (lesson: VideoLessonRecord, newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    try {
      const res = await fetch("/api/learning-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_lesson",
          lessonData: {
            id: lesson.id,
            moduleId: lesson.moduleId,
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            status: newStatus,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification(`Lecture status updated to ${newStatus}.`);
        loadData();
      }
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Delete lecture
  const handleDeleteLesson = async (lessonId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/learning-content?lessonId=${lessonId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showNotification("Lecture record deleted.");
        loadData();
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Stats calculation
  const totalPublished = lessons.filter((l) => l.status === "PUBLISHED").length;
  const totalDrafts = lessons.filter((l) => l.status === "DRAFT").length;
  const totalArchived = lessons.filter((l) => l.status === "ARCHIVED").length;
  const totalDurationHrs = (lessons.reduce((acc, l) => acc + (l.durationSec || 0), 0) / 3600).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-medium flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-600 hover:text-red-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Header & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Content Management
            </span>
            <span className="text-xs text-slate-500 font-medium">Curriculum Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Video Lectures & Courseware</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure learning modules, manage video stream sources, attach downloadable resources, and publish content.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowModuleModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>New Unit / Module</span>
          </button>

          <button
            onClick={handleOpenNewLesson}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Lecture</span>
          </button>
        </div>
      </div>

      {/* 2. Admin Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{totalPublished}</div>
            <div className="text-xs font-medium text-slate-500">Published Lectures</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{totalDrafts}</div>
            <div className="text-xs font-medium text-slate-500">Drafts Pending Review</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{totalArchived}</div>
            <div className="text-xs font-medium text-slate-500">Archived Items</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{totalDurationHrs} hrs</div>
            <div className="text-xs font-medium text-slate-500">Total Video Content</div>
          </div>
        </div>
      </div>

      {/* 3. Search and Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by lecture title, module, or subject code..."
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
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-800"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={selectedSemesterFilter}
            onChange={(e) => setSelectedSemesterFilter(e.target.value)}
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

          <button
            onClick={loadData}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Refresh table"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Lectures Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading learning content...</div>
        ) : filteredLessons.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Video className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No lectures found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No video lectures match your current filters. Click "Create Lecture" to add your first recorded session.
            </p>
            <button
              onClick={handleOpenNewLesson}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Lecture</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Lecture / Title</th>
                  <th className="py-3 px-4">Subject & Module</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Resources</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Lecture & Thumbnail */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-20 aspect-video rounded-md bg-slate-900 overflow-hidden shrink-0 shadow-2xs">
                          <img
                            src={lesson.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"}
                            alt={lesson.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/75 text-[8px] font-semibold text-white">
                            {DataService.formatDuration(lesson.durationSec)}
                          </span>
                        </div>
                        <div className="min-w-0 max-w-sm">
                          <div className="font-semibold text-slate-900 leading-snug truncate">
                            {lesson.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            {lesson.description || "Video courseware lesson"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Subject & Module */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                          {lesson.subjectCode}
                        </span>
                        <div className="text-slate-500 font-medium text-[11px] mt-1 truncate max-w-[200px]">
                          {lesson.moduleTitle || "Curriculum Unit"}
                        </div>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {DataService.formatDuration(lesson.durationSec)}
                    </td>

                    {/* Resources */}
                    <td className="py-3.5 px-4">
                      {lesson.resources && lesson.resources.length > 0 ? (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          <FileText className="w-3.5 h-3.5 text-blue-800" />
                          <span>{lesson.resources.length} {lesson.resources.length === 1 ? "file" : "files"}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      {lesson.status === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Published
                        </span>
                      ) : lesson.status === "DRAFT" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" /> Draft
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          <Archive className="w-3 h-3" /> Archived
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview */}
                        <button
                          onClick={() => setPreviewLesson(lesson)}
                          className="p-1.5 text-slate-500 hover:text-blue-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="Preview student video player"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditLesson(lesson)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit lecture"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Publish / Unpublish Toggle */}
                        {lesson.status === "PUBLISHED" ? (
                          <button
                            onClick={() => handleQuickStatusChange(lesson, "DRAFT")}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Unpublish (revert to draft)"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickStatusChange(lesson, "PUBLISHED")}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Publish lecture immediately"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete lecture"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Create / Edit Lecture Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-800" />
                <h3 className="text-base font-bold text-slate-900">
                  {formLessonId ? "Edit Video Lecture" : "Create New Video Lecture"}
                </h3>
              </div>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Subject Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Subject / Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-800"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} — {s.name} (Sem {s.semester})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Module / Unit Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Curriculum Unit / Module
                  </label>
                  <select
                    value={formModuleId}
                    onChange={(e) => setFormModuleId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-800"
                  >
                    <option value="new">+ Auto-create Default Unit</option>
                    {availableFormModules.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title & Order */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lecture Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lec 05: Dijkstra's Shortest Path Algorithm"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Order Index</label>
                  <input
                    type="number"
                    min="1"
                    value={formOrderIndex}
                    onChange={(e) => setFormOrderIndex(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>

              {/* Video URL & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Video Source URL (YouTube, Vimeo, MP4, HLS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formVideoUrl}
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={formDurationMinutes}
                    onChange={(e) => setFormDurationMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-800"
                  />
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Thumbnail Preview URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formThumbnailUrl}
                  onChange={(e) => setFormThumbnailUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-800"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecture Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of lecture concepts, theorems, or practical code demonstrations..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-800"
                />
              </div>

              {/* Syllabus Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Syllabus Notes, Proofs & Key Takeaways
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed notes, algorithmic complexities, and examination reminders..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 font-mono text-xs focus:bg-white focus:ring-2 focus:ring-blue-800"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Publication Status</label>
                <div className="flex gap-4">
                  {(["PUBLISHED", "DRAFT", "ARCHIVED"] as const).map((st) => (
                    <label key={st} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={st}
                        checked={formStatus === st}
                        onChange={() => setFormStatus(st)}
                        className="text-blue-800 focus:ring-blue-800"
                      />
                      <span className="font-medium text-slate-700">
                        {st === "PUBLISHED" ? "Published (Visible to Students)" : st === "DRAFT" ? "Draft" : "Archived"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Attached Resources */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-700">Downloadable Resources & PDFs</span>
                  <button
                    type="button"
                    onClick={() =>
                      setFormResources([
                        ...formResources,
                        {
                          title: "Supplementary Notes",
                          fileUrl: "/resources/notes.pdf",
                          fileType: "pdf",
                          fileSize: "1.8 MB",
                        },
                      ])
                    }
                    className="text-blue-800 font-semibold hover:text-blue-900 inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Resource</span>
                  </button>
                </div>

                {formResources.map((res, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Resource Title (e.g. Lecture Slides PDF)"
                      value={res.title}
                      onChange={(e) => {
                        const copy = [...formResources];
                        copy[idx].title = e.target.value;
                        setFormResources(copy);
                      }}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="URL or Path"
                      value={res.fileUrl}
                      onChange={(e) => {
                        const copy = [...formResources];
                        copy[idx].fileUrl = e.target.value;
                        setFormResources(copy);
                      }}
                      className="w-1/3 bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setFormResources(formResources.filter((_, i) => i !== idx))}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-4 py-2.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : formLessonId ? "Save Changes" : "Create Lecture"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Create Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-800" />
                <h3 className="text-base font-bold text-slate-900">New Learning Unit / Module</h3>
              </div>
              <button onClick={() => setShowModuleModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Subject / Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={formNewModuleSubjectId}
                  onChange={(e) => setFormNewModuleSubjectId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unit Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Dynamic Programming & Optimal Substructure"
                  value={formNewModuleTitle}
                  onChange={(e) => setFormNewModuleTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of topics and syllabus references covered in this unit..."
                  value={formNewModuleDescription}
                  onChange={(e) => setFormNewModuleDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Order Index</label>
                <input
                  type="number"
                  min="1"
                  value={formNewModuleOrder}
                  onChange={(e) => setFormNewModuleOrder(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow-xs"
                >
                  {submitting ? "Creating..." : "Create Unit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Interactive Preview Modal (Student Player Simulation) */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  PREVIEW MODE
                </span>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{previewLesson.title}</h3>
              </div>
              <button onClick={() => setPreviewLesson(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated 16:9 Player */}
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-inner">
              <iframe
                src={previewLesson.videoUrl.replace("watch?v=", "embed/")}
                title={previewLesson.title}
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span className="text-blue-800 font-semibold">{previewLesson.subjectCode}</span>
                <span>•</span>
                <span>{previewLesson.moduleTitle || "Curriculum Unit"}</span>
                <span>•</span>
                <span>Duration: {DataService.formatDuration(previewLesson.durationSec)}</span>
              </div>
              <p className="text-slate-700">{previewLesson.description}</p>
              {previewLesson.notes && (
                <pre className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-wrap text-slate-800">
                  {previewLesson.notes}
                </pre>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewLesson(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  const target = previewLesson;
                  setPreviewLesson(null);
                  handleOpenEditLesson(target);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-800 hover:bg-blue-900 rounded-lg"
              >
                Edit This Lecture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

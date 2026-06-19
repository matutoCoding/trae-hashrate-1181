import { useState, useMemo, useEffect, useRef } from 'react';
import {
  ArrowLeftRight,
  Check,
  X,
  Eye,
  Archive as ArchiveIcon,
  Plus,
  Download,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  Star,
  Clock,
  Upload,
  SlidersHorizontal,
  Brush,
  MessageSquare,
  FileText,
  Sparkles,
  Filter,
  MapPin,
} from 'lucide-react';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import DimensionBars from '@/components/DimensionBars';
import Avatar from '@/components/Avatar';
import { cn } from '@/lib/utils';
import { useMatchStore } from '@/stores/match';
import { useArtworkStore } from '@/stores/artwork';
import { useTeacherStore } from '@/stores/teacher';
import { useStudentStore } from '@/stores/student';
import type { Match, Artwork } from '@/mock/data';
import type { StatusType } from '@/components/StatusBadge';

type TabType = 'match' | 'artwork' | 'archive';
type MatchStatusFilter = 'all' | '待确认' | '已确认' | '已拒绝';

const matchStatusToBadge = (status: string): StatusType => {
  switch (status) {
    case '待确认':
      return 'booked';
    case '已确认':
      return 'confirmed';
    case '已完成':
      return 'completed';
    case '已拒绝':
      return 'completed';
    case '已归档':
      return 'archived';
    default:
      return 'booked';
  }
};

const MiniDimensionBars = ({ scores }: { scores: Match['dimensionScores'] }) => {
  const configs = [
    { key: 'styleMatch' as const, gradient: 'from-cinnabar to-cinnabar/60' },
    { key: 'teacherRating' as const, gradient: 'from-gold to-gold/60' },
    { key: 'styleFit' as const, gradient: 'from-bamboo to-bamboo/60' },
    { key: 'experience' as const, gradient: 'from-ink to-ink/60' },
    { key: 'priceMatch' as const, gradient: 'from-cinnabar/80 via-gold to-bamboo/80' },
  ];

  return (
    <div className="space-y-1">
      {configs.map(({ key, gradient }) => {
        const value = Math.min(Math.max(scores[key], 0), 100);
        return (
          <div key={key} className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/5">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  gradient,
                )}
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CalligraphyBrushSVG = () => (
  <svg
    viewBox="0 0 200 200"
    className="absolute inset-0 h-full w-full opacity-20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M40 60 Q80 30 120 80 T180 120"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className="text-ink/40"
    />
    <path
      d="M30 120 Q70 90 110 140 T170 160"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      className="text-cinnabar/50"
    />
    <path
      d="M60 40 L100 80 L80 100 L140 70"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="text-bamboo/40"
    />
    <circle cx="160" cy="50" r="8" stroke="currentColor" strokeWidth="2" className="text-gold/60" />
    <path
      d="M20 170 Q50 150 90 170 T160 165"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 4"
      className="text-ink/30"
    />
  </svg>
);

const gradientPresets = [
  'from-cinnabar/20 via-rice to-gold/20',
  'from-bamboo/20 via-rice to-ink/10',
  'from-gold/30 via-rice to-cinnabar/10',
  'from-ink/15 via-rice to-bamboo/15',
  'from-cinnabar/15 via-gold/10 to-bamboo/15',
];

export default function Archive() {
  const [activeTab, setActiveTab] = useState<TabType>('match');

  const { matches, confirmMatch, rejectMatch, archiveMatch, getMatchById } = useMatchStore();
  const { artworks, submitArtwork, rateArtwork, getArtworkById } = useArtworkStore();
  const { teachers, getTeacherById } = useTeacherStore();
  const { students, getStudentById } = useStudentStore();

  const [statusFilter, setStatusFilter] = useState<MatchStatusFilter>('all');
  const [teacherFilter, setTeacherFilter] = useState<string>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const [detailModal, setDetailModal] = useState<{ open: boolean; match: Match | null }>({
    open: false,
    match: null,
  });

  const [registerModal, setRegisterModal] = useState(false);
  const [newArtwork, setNewArtwork] = useState({
    matchId: '',
    studentId: '',
    title: '',
    style: '楷书',
  });

  const [artworkDetailModal, setArtworkDetailModal] = useState<{
    open: boolean;
    artwork: Artwork | null;
  }>({ open: false, artwork: null });
  const [ratingScore, setRatingScore] = useState(80);
  const [ratingComment, setRatingComment] = useState('');

  const [archiveDateFrom, setArchiveDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [archiveDateTo, setArchiveDateTo] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [archiveTeacher, setArchiveTeacher] = useState<string>('all');
  const [archiveStudent, setArchiveStudent] = useState<string>('all');
  const [archiveSearch, setArchiveSearch] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [exportModal, setExportModal] = useState(false);
  const [highlightMatchId, setHighlightMatchId] = useState<string | null>(null);
  const matchRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const archiveMatchRefs = useRef<Map<string, HTMLTableRowElement>>(new Map());

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (m.status === '已归档') return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (teacherFilter !== 'all' && m.teacherId !== teacherFilter) return false;
      if (studentFilter !== 'all' && m.studentId !== studentFilter) return false;
      if (dateFrom && m.matchedAt < dateFrom) return false;
      if (dateTo && m.matchedAt > dateTo + ' 23:59:59') return false;
      return true;
    });
  }, [matches, statusFilter, teacherFilter, studentFilter, dateFrom, dateTo]);

  const archivedMatches = useMemo(() => {
    return matches.filter((m) => {
      if (m.status !== '已归档' && m.status !== '已完成') {
        if (!(m.status === '已确认' || m.status === '已拒绝')) return false;
      }
      if (archiveTeacher !== 'all' && m.teacherId !== archiveTeacher) return false;
      if (archiveStudent !== 'all' && m.studentId !== archiveStudent) return false;
      if (archiveDateFrom && m.matchedAt < archiveDateFrom) return false;
      if (archiveDateTo && m.matchedAt > archiveDateTo + ' 23:59:59') return false;
      if (archiveSearch) {
        const teacher = getTeacherById(m.teacherId);
        const student = getStudentById(m.studentId);
        const teacherStyles = teacher?.styles.join('') || '';
        const search = archiveSearch.toLowerCase();
        return (
          teacherStyles.toLowerCase().includes(search) ||
          teacher?.name.toLowerCase().includes(search) ||
          student?.name.toLowerCase().includes(search)
        );
      }
      return true;
    });
  }, [matches, archiveTeacher, archiveStudent, archiveDateFrom, archiveDateTo, archiveSearch, getTeacherById, getStudentById]);

  const getArtworksForMatch = (matchId: string) => {
    return artworks.filter((a) => a.matchId === matchId);
  };

  const toggleExpand = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setMatchRef = (id: string, el: HTMLDivElement | null) => {
    if (el) {
      matchRefs.current.set(id, el);
    } else {
      matchRefs.current.delete(id);
    }
  };

  const setArchiveMatchRef = (id: string, el: HTMLTableRowElement | null) => {
    if (el) {
      archiveMatchRefs.current.set(id, el);
    } else {
      archiveMatchRefs.current.delete(id);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = sessionStorage.getItem('highlightMatchId');
      if (storedId) {
        sessionStorage.removeItem('highlightMatchId');
        const match = getMatchById(storedId);
        if (match) {
          setHighlightMatchId(storedId);
          if (match.status === '已归档' || match.status === '已完成' || match.status === '已确认' || match.status === '已拒绝') {
            setActiveTab('archive');
            setExpandedRows((prev) => {
              const next = new Set(prev);
              next.add(storedId);
              return next;
            });
            setTimeout(() => {
              const el = archiveMatchRefs.current.get(storedId);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          } else {
            setActiveTab('match');
            setTimeout(() => {
              const el = matchRefs.current.get(storedId);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }
          setTimeout(() => setHighlightMatchId(null), 4000);
        }
      }
    }
  }, [getMatchById]);

  const handleSubmitArtwork = () => {
    if (!newArtwork.matchId || !newArtwork.studentId || !newArtwork.title) return;
    submitArtwork({
      matchId: newArtwork.matchId,
      studentId: newArtwork.studentId,
      imageUrl: '',
      title: newArtwork.title,
      style: newArtwork.style,
    });
    setRegisterModal(false);
    setNewArtwork({ matchId: '', studentId: '', title: '', style: '楷书' });
  };

  const handleSaveRating = () => {
    if (!artworkDetailModal.artwork) return;
    rateArtwork(artworkDetailModal.artwork.id, ratingScore, ratingComment);
    const updated = getArtworkById(artworkDetailModal.artwork.id);
    setArtworkDetailModal({ open: true, artwork: updated || null });
  };

  const openArtworkDetail = (artwork: Artwork) => {
    setArtworkDetailModal({ open: true, artwork });
    setRatingScore(artwork.score || 80);
    setRatingComment(artwork.teacherComment || '');
  };

  const tabs: { key: TabType; label: string; icon: typeof FileText }[] = [
    { key: 'match', label: '撮合管理', icon: ArrowLeftRight },
    { key: 'artwork', label: '作品展评', icon: Brush },
    { key: 'archive', label: '历史归档', icon: ArchiveIcon },
  ];

  return (
    <div className="min-h-screen bg-rice/50">
      <div className="sticky top-0 z-30 border-b border-ink/10 bg-rice/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-2 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-cinnabar text-white shadow-lg shadow-cinnabar/25'
                      : 'text-ink/60 hover:bg-ink/5 hover:text-ink',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {activeTab === 'match' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-ink/50" />
                  <span className="text-sm font-medium text-ink/70">筛选条件</span>
                </div>
                <div className="h-5 w-px bg-ink/10" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as MatchStatusFilter)}
                  className="rounded-lg border border-ink/15 bg-rice/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                >
                  <option value="all">全部状态</option>
                  <option value="待确认">待确认</option>
                  <option value="已确认">已确认</option>
                  <option value="已拒绝">已拒绝</option>
                </select>
                <select
                  value={teacherFilter}
                  onChange={(e) => setTeacherFilter(e.target.value)}
                  className="rounded-lg border border-ink/15 bg-rice/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                >
                  <option value="all">全部老师</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <select
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="rounded-lg border border-ink/15 bg-rice/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                >
                  <option value="all">全部学员</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-ink/40" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="rounded-lg border border-ink/15 bg-rice/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                  />
                  <span className="text-ink/40">至</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="rounded-lg border border-ink/15 bg-rice/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                  />
                </div>
              </div>
            </div>

            {filteredMatches.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="暂无撮合记录"
                description="去推荐页为老师和学员进行智能撮合，匹配合适的师生组合"
                action={
                  <button className="inline-flex items-center gap-2 rounded-xl bg-cinnabar px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cinnabar/25 transition-all hover:bg-cinnabar/90 hover:shadow-xl hover:shadow-cinnabar/30">
                    <Sparkles className="h-4 w-4" />
                    去推荐页撮合
                  </button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredMatches.map((match) => {
                  const teacher = getTeacherById(match.teacherId);
                  const student = getStudentById(match.studentId);
                  if (!teacher || !student) return null;
                  const isHighlighted = highlightMatchId === match.id;

                  return (
                    <div
                      key={match.id}
                      ref={(el) => setMatchRef(match.id, el)}
                      className={cn(
                        'group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cinnabar/20 hover:shadow-xl',
                        isHighlighted
                          ? 'border-cinnabar/50 ring-4 ring-cinnabar/20 shadow-xl shadow-cinnabar/20'
                          : 'border-ink/10'
                      )}
                      style={isHighlighted ? {
                        animation: 'pulse 2s ease-in-out infinite',
                        background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(255, 255, 255, 1) 50%, rgba(220, 38, 38, 0.08) 100%)'
                      } : undefined}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-1 items-center gap-3">
                        <div className="relative">
                          <Avatar name={teacher.name} size="md" className="!rounded-xl ring-2 ring-white shadow-md" />
                            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-bamboo text-[10px] text-white shadow">
                              {teacher.rating}
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-ink truncate">{teacher.name}</span>
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-1">
                              {teacher.styles.slice(0, 2).map((s) => (
                                <span
                                  key={s}
                                  className="rounded-md bg-ink/5 px-1.5 py-0.5 text-xs text-ink/60"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex h-12 items-center justify-center">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar">
                            <ArrowLeftRight className="h-4 w-4" />
                          </div>
                        </div>

                        <div className="flex flex-1 items-center gap-3">
                          <Avatar name={student.name} size="md" className="!rounded-xl ring-2 ring-white shadow-md" />
                          <div className="min-w-0">
                            <div className="font-semibold text-ink truncate">{student.name}</div>
                            <div className="mt-0.5">
                              <span
                                className={cn(
                                  'rounded-md px-1.5 py-0.5 text-xs',
                                  student.level === '初级' && 'bg-bamboo/10 text-bamboo',
                                  student.level === '中级' && 'bg-gold/10 text-gold',
                                  student.level === '高级' && 'bg-cinnabar/10 text-cinnabar',
                                )}
                              >
                                {student.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-rice/50 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-gold fill-gold" />
                            <span className="text-lg font-bold tabular-nums text-ink">
                              {match.totalScore.toFixed(1)}
                            </span>
                            <span className="text-xs text-ink/50">综合得分</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <MiniDimensionBars scores={match.dimensionScores} />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge
                            status={matchStatusToBadge(match.status)}
                            showIcon={false}
                          />
                          {isHighlighted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-cinnabar/15 px-2.5 py-1 text-xs font-medium text-cinnabar animate-pulse">
                              <MapPin className="h-3.5 w-3.5" />
                              已定位
                            </span>
                          )}
                          {match.status === '已拒绝' && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-cinnabar/20 bg-cinnabar/10 px-2.5 py-1 text-xs font-medium text-cinnabar">
                              <X className="h-3.5 w-3.5" />
                              已拒绝
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-xs text-ink/40">
                            <Clock className="h-3 w-3" />
                            {match.matchedAt.slice(5, 16)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-ink/5 pt-4">
                        {match.status === '待确认' && (
                          <>
                            <button
                              onClick={() => confirmMatch(match.id)}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bamboo px-3 py-2 text-sm font-medium text-white transition-all hover:bg-bamboo/90"
                            >
                              <Check className="h-4 w-4" />
                              确认
                            </button>
                            <button
                              onClick={() => rejectMatch(match.id)}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-cinnabar/30 bg-cinnabar/5 px-3 py-2 text-sm font-medium text-cinnabar transition-all hover:bg-cinnabar/10"
                            >
                              <X className="h-4 w-4" />
                              拒绝
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDetailModal({ open: true, match })}
                          className={cn(
                            'inline-flex items-center justify-center gap-1.5 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-medium text-ink/70 transition-all hover:bg-ink/5',
                            match.status === '待确认' ? '' : 'flex-1',
                          )}
                        >
                          <Eye className="h-4 w-4" />
                          详情
                        </button>
                        {match.status !== '待确认' && (
                          <button
                            onClick={() => archiveMatch(match.id)}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink/5 px-3 py-2 text-sm font-medium text-ink/70 transition-all hover:bg-ink/10"
                          >
                            <ArchiveIcon className="h-4 w-4" />
                            归档
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'artwork' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              <div>
                <h2 className="text-lg font-semibold text-ink">学员作品展评</h2>
                <p className="mt-1 text-sm text-ink/50">
                  共 {artworks.length} 件作品，{artworks.filter((a) => !a.score).length} 件待评分
                </p>
              </div>
              <button
                onClick={() => setRegisterModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-cinnabar px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-cinnabar/25 transition-all hover:bg-cinnabar/90 hover:shadow-xl hover:shadow-cinnabar/30"
              >
                <Plus className="h-4 w-4" />
                登记作品
              </button>
            </div>

            {artworks.length === 0 ? (
              <EmptyState
                icon={Brush}
                title="暂无作品"
                description="点击右上角「登记作品」按钮，开始录入学员的书法作品"
              />
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {artworks.map((artwork, idx) => {
                  const student = getStudentById(artwork.studentId);
                  const gradient = gradientPresets[idx % gradientPresets.length];

                  return (
                    <div
                      key={artwork.id}
                      onClick={() => openArtworkDetail(artwork)}
                      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div
                        className={cn(
                          'relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br',
                          gradient,
                        )}
                      >
                        <CalligraphyBrushSVG />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                          <div className="mb-2 text-xs tracking-widest text-ink/40">
                            {artwork.style}
                          </div>
                          <div className="text-center font-serif text-2xl font-bold text-ink/80 md:text-3xl">
                            {artwork.title}
                          </div>
                          {!artwork.score && (
                            <div className="absolute right-3 top-3 rounded-full bg-cinnabar px-2.5 py-1 text-xs font-medium text-white shadow-lg">
                              待评分
                            </div>
                          )}
                          {artwork.score > 0 && (
                            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
                              <Star className="h-3 w-3 fill-white" />
                              {artwork.score}
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-ink/80 via-ink/50 to-transparent p-4 pt-10 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="font-medium">{artwork.title}</div>
                              <div className="mt-0.5 text-xs text-white/70">
                                {artwork.style} · {student?.name}
                              </div>
                            </div>
                            {artwork.score > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-gold text-gold" />
                                <span className="font-bold">{artwork.score}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={student?.name || ''} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-ink truncate">
                              {student?.name}
                            </div>
                            <div className="text-xs text-ink/40">
                              {artwork.submittedAt.slice(5, 10)}
                            </div>
                          </div>
                          {artwork.score > 0 ? (
                            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold">
                              {artwork.score}分
                            </span>
                          ) : (
                            <span className="rounded-full bg-cinnabar/10 px-2 py-0.5 text-xs font-medium text-cinnabar">
                              待评分
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'archive' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-ink/50" />
                  <span className="text-sm font-medium text-ink/70">筛选</span>
                </div>
                <div className="h-5 w-px bg-ink/10" />
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-ink/40" />
                  <input
                    type="date"
                    value={archiveDateFrom}
                    onChange={(e) => setArchiveDateFrom(e.target.value)}
                    className="rounded-lg border border-ink/15 bg-rice/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                  />
                  <span className="text-ink/40">至</span>
                  <input
                    type="date"
                    value={archiveDateTo}
                    onChange={(e) => setArchiveDateTo(e.target.value)}
                    className="rounded-lg border border-ink/15 bg-rice/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                  />
                </div>
                <select
                  value={archiveTeacher}
                  onChange={(e) => setArchiveTeacher(e.target.value)}
                  className="rounded-lg border border-ink/15 bg-rice/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                >
                  <option value="all">全部老师</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <select
                  value={archiveStudent}
                  onChange={(e) => setArchiveStudent(e.target.value)}
                  className="rounded-lg border border-ink/15 bg-rice/50 px-3 py-2 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                >
                  <option value="all">全部学员</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
                  <input
                    type="text"
                    value={archiveSearch}
                    onChange={(e) => setArchiveSearch(e.target.value)}
                    placeholder="搜索书体关键字..."
                    className="w-full rounded-lg border border-ink/15 bg-rice/50 py-2 pl-9 pr-3 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                  />
                </div>
                <div className="ml-auto">
                  <button
                    onClick={() => setExportModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-ink/15 bg-white px-4 py-2 text-sm font-medium text-ink/70 transition-all hover:bg-ink/5"
                  >
                    <Download className="h-4 w-4" />
                    导出视图
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
              <table className="w-full">
                <thead className="bg-rice/50">
                  <tr className="border-b border-ink/10">
                    <th className="w-10 px-4 py-3"></th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                      日期
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                      课程名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                      老师
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                      学员
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                      书体
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                      状态
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink/50">
                      作品评分
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {archivedMatches.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <EmptyState
                          icon={ArchiveIcon}
                          title="暂无归档记录"
                          description="将已确认或已完成的撮合记录归档后，将显示在这里"
                          className="py-12"
                        />
                      </td>
                    </tr>
                  ) : (
                    archivedMatches.map((match) => {
                      const teacher = getTeacherById(match.teacherId);
                      const student = getStudentById(match.studentId);
                      const matchArtworks = getArtworksForMatch(match.id);
                      const avgScore =
                        matchArtworks.length > 0
                          ? (
                              matchArtworks.reduce((sum, a) => sum + (a.score || 0), 0) /
                              matchArtworks.length
                            ).toFixed(1)
                          : '-';
                      const expanded = expandedRows.has(match.id);

                      const isMatchHighlighted = highlightMatchId === match.id;

                      return (
                        <>
                          <tr
                            key={match.id}
                            ref={(el) => setArchiveMatchRef(match.id, el)}
                            className={cn(
                              'transition-all',
                              isMatchHighlighted
                                ? 'bg-cinnabar/10 ring-2 ring-cinnabar/30 ring-inset'
                                : expanded ? 'bg-cinnabar/[0.03]' : 'hover:bg-ink/[0.02]',
                            )}
                            style={isMatchHighlighted ? {
                              animation: 'pulse 2s ease-in-out infinite',
                            } : undefined}
                          >
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleExpand(match.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink/40 transition-all hover:bg-ink/5 hover:text-ink"
                              >
                                {expanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-ink">{match.matchedAt.slice(0, 10)}</div>
                              <div className="text-xs text-ink/40">{match.matchedAt.slice(11, 16)}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-ink">
                                  {teacher?.styles[0] || '书法'}·{student?.level}班
                                </div>
                                {isMatchHighlighted && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-cinnabar/15 px-2 py-0.5 text-[10px] font-medium text-cinnabar animate-pulse">
                                    <MapPin className="h-3 w-3" />
                                    已定位
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar name={teacher?.name || ''} size="sm" />
                                <span className="text-sm text-ink">{teacher?.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar name={student?.name || ''} size="sm" />
                                <span className="text-sm text-ink">{student?.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {teacher?.styles.slice(0, 2).map((s) => (
                                  <span
                                    key={s}
                                    className="rounded-md bg-ink/5 px-2 py-0.5 text-xs text-ink/60"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={matchStatusToBadge(match.status)} showIcon={false} />
                            </td>
                            <td className="px-4 py-3">
                              {avgScore !== '-' ? (
                                <div className="flex items-center gap-1.5">
                                  <Star className="h-4 w-4 fill-gold text-gold" />
                                  <span className="text-sm font-bold tabular-nums text-ink">
                                    {avgScore}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-ink/30">暂无</span>
                              )}
                            </td>
                          </tr>
                          {expanded && (
                            <tr key={`${match.id}-detail`} className="bg-ink/[0.02]">
                              <td colSpan={8} className="px-4 py-5">
                                <div className="grid gap-6 md:grid-cols-3">
                                  <div className="rounded-xl bg-white p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                      <Star className="h-4 w-4 text-gold" />
                                      <span className="text-sm font-semibold text-ink">撮合得分</span>
                                    </div>
                                    <div className="mb-3">
                                      <span className="text-3xl font-bold tabular-nums text-ink">
                                        {match.totalScore.toFixed(1)}
                                      </span>
                                      <span className="ml-1 text-sm text-ink/40">分</span>
                                    </div>
                                    <MiniDimensionBars scores={match.dimensionScores} />
                                  </div>

                                  <div className="rounded-xl bg-white p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-bamboo" />
                                      <span className="text-sm font-semibold text-ink">时间记录</span>
                                    </div>
                                    <div className="space-y-2.5 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-ink/50">撮合时间</span>
                                        <span className="text-ink">{match.matchedAt.slice(0, 19)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-ink/50">签到时间</span>
                                        <span className="text-ink">
                                          {match.status === '已完成'
                                            ? match.matchedAt.slice(0, 10) + ' 09:05'
                                            : '-'}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-ink/50">课程时长</span>
                                        <span className="text-ink">120 分钟</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="rounded-xl bg-white p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                      <Brush className="h-4 w-4 text-cinnabar" />
                                      <span className="text-sm font-semibold text-ink">
                                        作品 ({matchArtworks.length})
                                      </span>
                                    </div>
                                    {matchArtworks.length === 0 ? (
                                      <div className="py-4 text-center text-sm text-ink/40">
                                        暂无作品
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {matchArtworks.map((a) => (
                                          <div
                                            key={a.id}
                                            onClick={() => openArtworkDetail(a)}
                                            className="flex cursor-pointer items-center justify-between rounded-lg bg-rice/50 p-2.5 transition-all hover:bg-cinnabar/5"
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <div className="h-8 w-8 shrink-0 rounded bg-gradient-to-br from-cinnabar/20 to-gold/20" />
                                              <div className="min-w-0">
                                                <div className="truncate text-sm font-medium text-ink">
                                                  {a.title}
                                                </div>
                                                <div className="text-xs text-ink/40">{a.style}</div>
                                              </div>
                                            </div>
                                            {a.score > 0 && (
                                              <span className="shrink-0 rounded bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold">
                                                {a.score}
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, match: null })}
        title="撮合详情"
      >
        {detailModal.match && (() => {
          const m = detailModal.match;
          const t = getTeacherById(m.teacherId);
          const s = getStudentById(m.studentId);
          return (
            <div className="space-y-5">
              <div className="flex items-center gap-6 rounded-2xl bg-rice/50 p-5">
                <div className="flex flex-1 flex-col items-center text-center">
                  <Avatar name={t?.name || ''} size="lg" className="!rounded-2xl shadow-md" />
                  <div className="mt-2 font-semibold text-ink">{t?.name}</div>
                  <div className="mt-1 text-xs text-ink/50">{t?.teachingStyle}</div>
                  <div className="mt-2 flex flex-wrap justify-center gap-1">
                    {t?.styles.map((st) => (
                      <span
                        key={st}
                        className="rounded-md bg-bamboo/10 px-2 py-0.5 text-xs text-bamboo"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cinnabar/10 text-cinnabar">
                    <ArrowLeftRight className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex flex-1 flex-col items-center text-center">
                  <Avatar name={s?.name || ''} size="lg" className="!rounded-2xl shadow-md" />
                  <div className="mt-2 font-semibold text-ink">{s?.name}</div>
                  <div className="mt-1 text-xs text-ink/50">{s?.learningGoal}</div>
                  <div className="mt-2">
                    <span
                      className={cn(
                        'rounded-md px-2 py-0.5 text-xs',
                        s?.level === '初级' && 'bg-bamboo/10 text-bamboo',
                        s?.level === '中级' && 'bg-gold/10 text-gold',
                        s?.level === '高级' && 'bg-cinnabar/10 text-cinnabar',
                      )}
                    >
                      {s?.level}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-gold fill-gold" />
                    <span className="text-sm font-semibold text-ink">综合评估得分</span>
                  </div>
                  <span className="text-2xl font-bold tabular-nums text-ink">
                    {m.totalScore.toFixed(1)}
                  </span>
                </div>
                <DimensionBars scores={m.dimensionScores} />
              </div>

              {m.notes && (
                <div className="rounded-xl border border-ink/10 bg-ink/[0.02] p-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink/50">
                    <MessageSquare className="h-3.5 w-3.5" />
                    撮合备注
                  </div>
                  <div className="text-sm text-ink/80">{m.notes}</div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-ink/40">
                <span>撮合编号：{m.id}</span>
                <span>撮合时间：{m.matchedAt}</span>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        open={registerModal}
        onClose={() => setRegisterModal(false)}
        title="登记学员作品"
        footer={
          <>
            <button
              onClick={() => setRegisterModal(false)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm text-ink/60 transition hover:bg-ink/5"
            >
              取消
            </button>
            <button
              onClick={handleSubmitArtwork}
              className="rounded-lg bg-cinnabar px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-cinnabar/90"
            >
              提交作品
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">选择撮合记录</label>
            <select
              value={newArtwork.matchId}
              onChange={(e) => {
                const m = getMatchById(e.target.value);
                setNewArtwork({
                  ...newArtwork,
                  matchId: e.target.value,
                  studentId: m?.studentId || '',
                });
              }}
              className="w-full rounded-lg border border-ink/15 bg-rice/50 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
            >
              <option value="">请选择撮合记录...</option>
              {matches
                .filter((m) => m.status === '已确认' || m.status === '已完成')
                .map((m) => {
                  const t = getTeacherById(m.teacherId);
                  const s = getStudentById(m.studentId);
                  return (
                    <option key={m.id} value={m.id}>
                      {t?.name} × {s?.name} ({m.matchedAt.slice(5, 10)})
                    </option>
                  );
                })}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">学员</label>
            <select
              value={newArtwork.studentId}
              onChange={(e) => setNewArtwork({ ...newArtwork, studentId: e.target.value })}
              className="w-full rounded-lg border border-ink/15 bg-rice/50 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
            >
              <option value="">请选择学员...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}（{s.level}）
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">作品名称</label>
            <input
              type="text"
              value={newArtwork.title}
              onChange={(e) => setNewArtwork({ ...newArtwork, title: e.target.value })}
              placeholder="如：九成宫醴泉铭临摹"
              className="w-full rounded-lg border border-ink/15 bg-rice/50 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">书体</label>
            <select
              value={newArtwork.style}
              onChange={(e) => setNewArtwork({ ...newArtwork, style: e.target.value })}
              className="w-full rounded-lg border border-ink/15 bg-rice/50 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
            >
              {['楷书', '行书', '草书', '隶书', '篆书', '魏碑', '硬笔'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/70">作品图片</label>
            <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/15 bg-rice/30 py-10 transition-all hover:border-cinnabar/30 hover:bg-cinnabar/[0.02]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/5">
                <Upload className="h-6 w-6 text-ink/40" />
              </div>
              <div className="mt-3 text-sm font-medium text-ink/60">点击上传作品图片</div>
              <div className="mt-1 text-xs text-ink/40">支持 JPG、PNG 格式</div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={artworkDetailModal.open}
        onClose={() => setArtworkDetailModal({ open: false, artwork: null })}
        title="作品详情"
        footer={
          artworkDetailModal.artwork ? (
            <>
              <button
                onClick={() => setArtworkDetailModal({ open: false, artwork: null })}
                className="rounded-lg border border-ink/15 px-4 py-2 text-sm text-ink/60 transition hover:bg-ink/5"
              >
                关闭
              </button>
              <button
                onClick={handleSaveRating}
                className="inline-flex items-center gap-1.5 rounded-lg bg-cinnabar px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-cinnabar/90"
              >
                <Check className="h-4 w-4" />
                保存评分
              </button>
            </>
          ) : undefined
        }
      >
        {artworkDetailModal.artwork && (() => {
          const a = artworkDetailModal.artwork;
          const student = getStudentById(a.studentId);
          const gradient = gradientPresets[a.id.charCodeAt(a.id.length - 1) % gradientPresets.length];

          return (
            <div className="space-y-5">
              <div className={cn('relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-to-br', gradient)}>
                <CalligraphyBrushSVG />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                  <div className="mb-2 text-xs tracking-widest text-ink/40">{a.style}</div>
                  <div className="text-center font-serif text-3xl font-bold text-ink/80">
                    {a.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-rice/50 p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={student?.avatar}
                    alt=""
                    className="h-10 w-10 rounded-xl object-cover"
                  />
                  <div>
                    <div className="font-medium text-ink">{student?.name}</div>
                    <div className="text-xs text-ink/40">{a.submittedAt.slice(0, 19)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1.5">
                  <Star className="h-4 w-4 fill-gold text-gold" />
                  <span className="font-bold tabular-nums text-gold">
                    {a.score || '待评分'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-ink/10 p-5">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-cinnabar" />
                  <span className="text-sm font-semibold text-ink">老师评分</span>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-ink/50">评分分数</span>
                    <span className="text-2xl font-bold tabular-nums text-cinnabar">
                      {ratingScore}
                      <span className="ml-0.5 text-sm font-normal text-ink/40">分</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ratingScore}
                    onChange={(e) => setRatingScore(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-ink/10 accent-cinnabar"
                  />
                  <div className="mt-1 flex justify-between text-xs text-ink/30">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-ink/50">评语文本</label>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    rows={4}
                    placeholder="请输入对该作品的评语，包括优点、不足和改进建议..."
                    className="w-full resize-none rounded-lg border border-ink/15 bg-rice/30 px-3 py-2.5 text-sm text-ink outline-none transition focus:border-cinnabar/40 focus:ring-2 focus:ring-cinnabar/10"
                  />
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        open={exportModal}
        onClose={() => setExportModal(false)}
        title="导出归档数据"
        footer={
          <>
            <button
              onClick={() => setExportModal(false)}
              className="rounded-lg border border-ink/15 px-4 py-2 text-sm text-ink/60 transition hover:bg-ink/5"
            >
              取消
            </button>
            <button
              onClick={() => {
                setExportModal(false);
                alert('导出功能已触发（模拟）：正在生成 Excel 报表...');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cinnabar px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-cinnabar/90"
            >
              <Download className="h-4 w-4" />
              确认导出
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-rice/50 p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cinnabar" />
              <span className="font-medium text-ink">导出内容预览</span>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink/50">数据范围</span>
                <span className="text-ink">
                  {archiveDateFrom} 至 {archiveDateTo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/50">记录数量</span>
                <span className="font-semibold text-ink">{archivedMatches.length} 条</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/50">文件格式</span>
                <span className="text-ink">Excel (.xlsx)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/50">包含字段</span>
                <span className="text-ink">日期、课程、师生、书体、评分等</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-ink/40">
            导出后，文件将自动下载到您的设备。包含当前筛选条件下的所有归档记录及关联作品数据。
          </p>
        </div>
      </Modal>
    </div>
  );
}

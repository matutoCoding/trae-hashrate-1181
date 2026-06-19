export type BookingStatus = '已预约' | '已签到' | '超时释放' | '已取消';

export type WaitlistStatus = '等待中' | '已通知' | '已补位' | '已取消';

export type MatchStatus = '待确认' | '已确认' | '已完成' | '已拒绝' | '已归档';

export type CalligraphyStyle = '楷书' | '行书' | '草书' | '隶书' | '篆书' | '魏碑' | '硬笔';

export type TeachingStyle = '严谨正统' | '耐心细致' | '豪放洒脱' | '典雅古朴' | '生动活泼' | '温婉细腻' | '厚重沉稳' | '自由创意';

export interface WeightConfig {
  id: string;
  styleMatch: number;
  teacherRating: number;
  styleFit: number;
  experience: number;
  priceMatch: number;
  updatedAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  capacity: number;
  equipment: string[];
  calligraphyStyles: string[];
  isActive: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  avatar: string;
  styles: string[];
  rating: number;
  teachingStyle: string;
  experienceYears: number;
  pricePerHour: number;
  awards: string[];
}

export interface Student {
  id: string;
  name: string;
  avatar: string;
  level: '初级' | '中级' | '高级';
  targetStyles: string[];
  preferredStyle: string;
  budgetMin: number;
  budgetMax: number;
  learningGoal: string;
}

export interface Course {
  id: string;
  title: string;
  classroomId: string;
  teacherId: string;
  style: string;
  date: string;
  startTime: string;
  endTime: string;
  maxStudents: number;
  status: '待开课' | '进行中' | '已结束' | '已取消';
}

export interface Booking {
  id: string;
  courseId: string;
  studentId: string;
  status: BookingStatus;
  bookedAt: string;
  checkInAt: string | null;
  timeoutMinutes: number;
}

export interface Waitlist {
  id: string;
  courseId: string;
  studentId: string;
  position: number;
  status: WaitlistStatus;
  joinedAt: string;
  notifiedAt: string | null;
}

export interface Match {
  id: string;
  teacherId: string;
  studentId: string;
  totalScore: number;
  dimensionScores: {
    styleMatch: number;
    teacherRating: number;
    styleFit: number;
    experience: number;
    priceMatch: number;
  };
  matchedAt: string;
  status: MatchStatus;
  notes: string;
}

export interface Artwork {
  id: string;
  matchId: string;
  studentId: string;
  imageUrl: string;
  title: string;
  style: string;
  score: number;
  teacherComment: string;
  submittedAt: string;
}

export interface Notification {
  id: string;
  type: '系统' | '补位' | '撮合' | '作品';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

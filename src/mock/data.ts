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
  status: '已预约' | '已签到' | '超时释放' | '已取消';
  bookedAt: string;
  checkInAt: string | null;
  timeoutMinutes: number;
}

export interface Waitlist {
  id: string;
  courseId: string;
  studentId: string;
  position: number;
  status: '等待中' | '已通知' | '已补位' | '已取消';
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
  status: '待确认' | '已确认' | '已完成' | '已拒绝' | '已归档';
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

export interface WeightConfig {
  id: string;
  styleMatch: number;
  teacherRating: number;
  styleFit: number;
  experience: number;
  priceMatch: number;
  updatedAt: string;
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

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const formatDateTime = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 19);

const addDays = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const addMinutes = (base: Date, mins: number) => {
  const d = new Date(base);
  d.setMinutes(d.getMinutes() + mins);
  return d;
};

export const mockClassrooms: Classroom[] = [
  {
    id: 'cls-001',
    name: '墨韵轩',
    capacity: 12,
    equipment: ['毛毡桌垫', '投影设备', '笔墨套装', '宣纸架'],
    calligraphyStyles: ['楷书', '行书'],
    isActive: true,
  },
  {
    id: 'cls-002',
    name: '兰亭阁',
    capacity: 20,
    equipment: ['毛毡桌垫', '投影设备', '笔墨套装', '宣纸架', '临摹碑帖展示柜', '多媒体音响'],
    calligraphyStyles: ['楷书', '行书', '草书'],
    isActive: true,
  },
  {
    id: 'cls-003',
    name: '砚池斋',
    capacity: 10,
    equipment: ['毛毡桌垫', '笔墨套装', '砚台陈列柜', '印章工作台'],
    calligraphyStyles: ['篆书', '隶书'],
    isActive: true,
  },
  {
    id: 'cls-004',
    name: '笔花堂',
    capacity: 15,
    equipment: ['毛毡桌垫', '投影设备', '笔墨套装', '宣纸架', '作品展示墙'],
    calligraphyStyles: ['楷书', '行书', '隶书', '草书'],
    isActive: true,
  },
];

export const mockTeachers: Teacher[] = [
  {
    id: 'tch-001',
    name: '王墨轩',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20middle%20aged%20chinese%20calligraphy%20teacher%20wearing%20traditional%20clothing%20elegant&image_size=square',
    styles: ['楷书', '行书'],
    rating: 4.9,
    teachingStyle: '严谨正统',
    experienceYears: 25,
    pricePerHour: 600,
    awards: ['中国书法家协会会员', '全国书法大赛金奖', '省级非遗传承人'],
  },
  {
    id: 'tch-002',
    name: '李兰亭',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20young%20chinese%20female%20calligraphy%20teacher%20gentle%20smile%20professional&image_size=square',
    styles: ['楷书', '隶书', '篆书'],
    rating: 4.7,
    teachingStyle: '耐心细致',
    experienceYears: 12,
    pricePerHour: 400,
    awards: ['书法教育优秀教师', '市级青年书法家'],
  },
  {
    id: 'tch-003',
    name: '张行素',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20senior%20chinese%20calligraphy%20master%20wise%20expression%20scholarly&image_size=square',
    styles: ['行书', '草书'],
    rating: 4.8,
    teachingStyle: '豪放洒脱',
    experienceYears: 20,
    pricePerHour: 550,
    awards: ['中国书法家协会理事', '兰亭奖获得者'],
  },
  {
    id: 'tch-004',
    name: '陈砚秋',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20elegant%20chinese%20female%20calligraphy%20artist%20sophisticated&image_size=square',
    styles: ['篆书', '隶书'],
    rating: 4.6,
    teachingStyle: '典雅古朴',
    experienceYears: 15,
    pricePerHour: 450,
    awards: ['古文字研究会会员', '篆书艺术专项奖'],
  },
  {
    id: 'tch-005',
    name: '赵笔锋',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20young%20chinese%20male%20calligraphy%20teacher%20energetic%20friendly&image_size=square',
    styles: ['楷书', '行书', '草书'],
    rating: 4.5,
    teachingStyle: '生动活泼',
    experienceYears: 8,
    pricePerHour: 300,
    awards: ['青年书法教学新星', '网络书法课程人气讲师'],
  },
  {
    id: 'tch-006',
    name: '刘韵清',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20female%20calligraphy%20teacher%20refined%20artistic%20aura&image_size=square',
    styles: ['楷书', '隶书'],
    rating: 4.4,
    teachingStyle: '温婉细腻',
    experienceYears: 6,
    pricePerHour: 250,
    awards: ['师范院校书法教育硕士', '优秀毕业生'],
  },
  {
    id: 'tch-007',
    name: '孙篆石',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20senior%20chinese%20seal%20carving%20artist%20traditional%20scholar&image_size=square',
    styles: ['篆书', '隶书', '行书'],
    rating: 4.7,
    teachingStyle: '厚重沉稳',
    experienceYears: 18,
    pricePerHour: 480,
    awards: ['西泠印社社员', '篆刻艺术大师'],
  },
  {
    id: 'tch-008',
    name: '周草圣',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20passionate%20chinese%20cursive%20calligraphy%20teacher%20creative&image_size=square',
    styles: ['草书', '行书'],
    rating: 4.2,
    teachingStyle: '自由创意',
    experienceYears: 3,
    pricePerHour: 200,
    awards: ['艺术学院书法专业毕业', '新锐书法创作者'],
  },
];

export const mockStudents: Student[] = [
  {
    id: 'stu-001',
    name: '小明',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20teenage%20boy%20student%20friendly%20smile&image_size=square',
    level: '初级',
    targetStyles: ['楷书'],
    preferredStyle: '严谨正统',
    budgetMin: 200,
    budgetMax: 400,
    learningGoal: '打基础，准备考级',
  },
  {
    id: 'stu-002',
    name: '晓红',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20young%20female%20student%20gentle%20artistic&image_size=square',
    level: '中级',
    targetStyles: ['楷书', '行书'],
    preferredStyle: '耐心细致',
    budgetMin: 300,
    budgetMax: 500,
    learningGoal: '提升行书水平，参加书法比赛',
  },
  {
    id: 'stu-003',
    name: '志强',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20adult%20male%20student%20professional%20confident&image_size=square',
    level: '高级',
    targetStyles: ['行书', '草书'],
    preferredStyle: '豪放洒脱',
    budgetMin: 400,
    budgetMax: 700,
    learningGoal: '精进行草，创作个人作品',
  },
  {
    id: 'stu-004',
    name: '雅琴',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20elegant%20female%20student%20refined%20young%20adult&image_size=square',
    level: '中级',
    targetStyles: ['篆书', '隶书'],
    preferredStyle: '典雅古朴',
    budgetMin: 350,
    budgetMax: 550,
    learningGoal: '研习古文字书法，陶冶情操',
  },
  {
    id: 'stu-005',
    name: '子轩',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20elementary%20school%20boy%20cute%20student&image_size=square',
    level: '初级',
    targetStyles: ['楷书', '隶书'],
    preferredStyle: '生动活泼',
    budgetMin: 150,
    budgetMax: 300,
    learningGoal: '培养兴趣，写好钢笔字',
  },
  {
    id: 'stu-006',
    name: '美玲',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20female%20college%20student%20cheerful%20artistic&image_size=square',
    level: '初级',
    targetStyles: ['楷书'],
    preferredStyle: '温婉细腻',
    budgetMin: 180,
    budgetMax: 350,
    learningGoal: '培养专注力，修身养性',
  },
  {
    id: 'stu-007',
    name: '建国',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20middle%20aged%20male%20student%20mature%20intellectual&image_size=square',
    level: '高级',
    targetStyles: ['篆书', '隶书', '行书'],
    preferredStyle: '厚重沉稳',
    budgetMin: 400,
    budgetMax: 800,
    learningGoal: '深入研究篆隶，研习篆刻',
  },
  {
    id: 'stu-008',
    name: '思思',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20creative%20young%20female%20art%20student%20hipster&image_size=square',
    level: '中级',
    targetStyles: ['草书', '行书'],
    preferredStyle: '自由创意',
    budgetMin: 250,
    budgetMax: 450,
    learningGoal: '探索现代书法，创意表达',
  },
  {
    id: 'stu-009',
    name: '浩然',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20high%20school%20male%20student%20hardworking&image_size=square',
    level: '中级',
    targetStyles: ['楷书', '行书', '草书'],
    preferredStyle: '严谨正统',
    budgetMin: 300,
    budgetMax: 600,
    learningGoal: '艺考冲刺，专业书法学习',
  },
  {
    id: 'stu-010',
    name: '雨婷',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20soft%20spoken%20female%20student%20youthful&image_size=square',
    level: '初级',
    targetStyles: ['隶书', '楷书'],
    preferredStyle: '耐心细致',
    budgetMin: 200,
    budgetMax: 380,
    learningGoal: '从零开始，感受传统文化',
  },
  {
    id: 'stu-011',
    name: '文博',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20mature%20male%20student%20cultural%20scholarly&image_size=square',
    level: '高级',
    targetStyles: ['楷书', '行书', '篆书'],
    preferredStyle: '典雅古朴',
    budgetMin: 500,
    budgetMax: 800,
    learningGoal: '收藏研究，临摹名家名帖',
  },
  {
    id: 'stu-012',
    name: '晓彤',
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=portrait%20of%20chinese%20girl%20student%20lively%20cheerful%20young&image_size=square',
    level: '初级',
    targetStyles: ['楷书', '行书'],
    preferredStyle: '生动活泼',
    budgetMin: 150,
    budgetMax: 280,
    learningGoal: '妈妈让学的，希望能爱上书法',
  },
];

export const mockCourses: Course[] = [
  {
    id: 'crs-001',
    title: '楷书基础班（欧体）',
    classroomId: 'cls-001',
    teacherId: 'tch-001',
    style: '楷书',
    date: formatDate(addDays(today, 0)),
    startTime: '09:00',
    endTime: '11:00',
    maxStudents: 10,
    status: '进行中',
  },
  {
    id: 'crs-002',
    title: '行书入门与提高',
    classroomId: 'cls-002',
    teacherId: 'tch-003',
    style: '行书',
    date: formatDate(addDays(today, 0)),
    startTime: '14:00',
    endTime: '16:30',
    maxStudents: 15,
    status: '待开课',
  },
  {
    id: 'crs-003',
    title: '篆书临摹与创作',
    classroomId: 'cls-003',
    teacherId: 'tch-004',
    style: '篆书',
    date: formatDate(addDays(today, 1)),
    startTime: '10:00',
    endTime: '12:00',
    maxStudents: 8,
    status: '待开课',
  },
  {
    id: 'crs-004',
    title: '隶书曹全碑研习',
    classroomId: 'cls-004',
    teacherId: 'tch-002',
    style: '隶书',
    date: formatDate(addDays(today, 1)),
    startTime: '15:00',
    endTime: '17:00',
    maxStudents: 12,
    status: '待开课',
  },
  {
    id: 'crs-005',
    title: '草书艺术表现',
    classroomId: 'cls-002',
    teacherId: 'tch-008',
    style: '草书',
    date: formatDate(addDays(today, 2)),
    startTime: '09:30',
    endTime: '11:30',
    maxStudents: 10,
    status: '待开课',
  },
  {
    id: 'crs-006',
    title: '少儿楷书启蒙班',
    classroomId: 'cls-001',
    teacherId: 'tch-005',
    style: '楷书',
    date: formatDate(addDays(today, 2)),
    startTime: '14:00',
    endTime: '16:00',
    maxStudents: 10,
    status: '待开课',
  },
  {
    id: 'crs-007',
    title: '楷书四大家对比',
    classroomId: 'cls-004',
    teacherId: 'tch-001',
    style: '楷书',
    date: formatDate(addDays(today, 3)),
    startTime: '09:00',
    endTime: '12:00',
    maxStudents: 12,
    status: '待开课',
  },
  {
    id: 'crs-008',
    title: '行书兰亭序专题',
    classroomId: 'cls-002',
    teacherId: 'tch-003',
    style: '行书',
    date: formatDate(addDays(today, 3)),
    startTime: '14:30',
    endTime: '17:00',
    maxStudents: 16,
    status: '待开课',
  },
  {
    id: 'crs-009',
    title: '篆刻与篆书结合',
    classroomId: 'cls-003',
    teacherId: 'tch-007',
    style: '篆书',
    date: formatDate(addDays(today, 4)),
    startTime: '10:00',
    endTime: '12:30',
    maxStudents: 8,
    status: '待开课',
  },
  {
    id: 'crs-010',
    title: '隶书张迁碑入门',
    classroomId: 'cls-004',
    teacherId: 'tch-006',
    style: '隶书',
    date: formatDate(addDays(today, 4)),
    startTime: '15:00',
    endTime: '17:00',
    maxStudents: 12,
    status: '待开课',
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'bkg-001',
    courseId: 'crs-001',
    studentId: 'stu-001',
    status: '已签到',
    bookedAt: formatDateTime(addDays(today, -1)),
    checkInAt: formatDateTime(addMinutes(addDays(today, 0), -60)),
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-002',
    courseId: 'crs-001',
    studentId: 'stu-006',
    status: '已签到',
    bookedAt: formatDateTime(addDays(today, -2)),
    checkInAt: formatDateTime(addMinutes(addDays(today, 0), -55)),
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-003',
    courseId: 'crs-001',
    studentId: 'stu-010',
    status: '超时释放',
    bookedAt: formatDateTime(addDays(today, -1)),
    checkInAt: null,
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-004',
    courseId: 'crs-001',
    studentId: 'stu-012',
    status: '已预约',
    bookedAt: formatDateTime(addMinutes(today, -5)),
    checkInAt: null,
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-005',
    courseId: 'crs-002',
    studentId: 'stu-002',
    status: '已预约',
    bookedAt: formatDateTime(addDays(today, -3)),
    checkInAt: null,
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-006',
    courseId: 'crs-002',
    studentId: 'stu-003',
    status: '已预约',
    bookedAt: formatDateTime(addDays(today, -2)),
    checkInAt: null,
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-007',
    courseId: 'crs-002',
    studentId: 'stu-008',
    status: '已预约',
    bookedAt: formatDateTime(addDays(today, -1)),
    checkInAt: null,
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-008',
    courseId: 'crs-003',
    studentId: 'stu-004',
    status: '已预约',
    bookedAt: formatDateTime(addDays(today, -2)),
    checkInAt: null,
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-009',
    courseId: 'crs-003',
    studentId: 'stu-007',
    status: '已预约',
    bookedAt: formatDateTime(addDays(today, -1)),
    checkInAt: null,
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-010',
    courseId: 'crs-004',
    studentId: 'stu-010',
    status: '已预约',
    bookedAt: formatDateTime(addDays(today, -1)),
    checkInAt: null,
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-011',
    courseId: 'crs-004',
    studentId: 'stu-011',
    status: '已预约',
    bookedAt: formatDateTime(addDays(today, -3)),
    checkInAt: null,
    timeoutMinutes: 15,
  },
  {
    id: 'bkg-012',
    courseId: 'crs-005',
    studentId: 'stu-008',
    status: '已预约',
    bookedAt: formatDateTime(addDays(today, -4)),
    checkInAt: null,
    timeoutMinutes: 15,
  },
];

export const mockWaitlists: Waitlist[] = [
  {
    id: 'wls-001',
    courseId: 'crs-001',
    studentId: 'stu-005',
    position: 1,
    status: '等待中',
    joinedAt: formatDateTime(addMinutes(today, -90)),
    notifiedAt: null,
  },
  {
    id: 'wls-002',
    courseId: 'crs-001',
    studentId: 'stu-009',
    position: 2,
    status: '等待中',
    joinedAt: formatDateTime(addMinutes(today, -60)),
    notifiedAt: null,
  },
  {
    id: 'wls-003',
    courseId: 'crs-002',
    studentId: 'stu-009',
    position: 1,
    status: '已通知',
    joinedAt: formatDateTime(addDays(today, -2)),
    notifiedAt: formatDateTime(addMinutes(today, -30)),
  },
  {
    id: 'wls-004',
    courseId: 'crs-002',
    studentId: 'stu-001',
    position: 2,
    status: '等待中',
    joinedAt: formatDateTime(addDays(today, -1)),
    notifiedAt: null,
  },
  {
    id: 'wls-005',
    courseId: 'crs-002',
    studentId: 'stu-006',
    position: 3,
    status: '等待中',
    joinedAt: formatDateTime(addDays(today, -1)),
    notifiedAt: null,
  },
  {
    id: 'wls-006',
    courseId: 'crs-003',
    studentId: 'stu-011',
    position: 1,
    status: '等待中',
    joinedAt: formatDateTime(addDays(today, -1)),
    notifiedAt: null,
  },
  {
    id: 'wls-007',
    courseId: 'crs-004',
    studentId: 'stu-002',
    position: 1,
    status: '已补位',
    joinedAt: formatDateTime(addDays(today, -3)),
    notifiedAt: formatDateTime(addDays(today, -2)),
  },
  {
    id: 'wls-008',
    courseId: 'crs-007',
    studentId: 'stu-003',
    position: 1,
    status: '等待中',
    joinedAt: formatDateTime(addDays(today, -1)),
    notifiedAt: null,
  },
];

export const mockMatches: Match[] = [
  {
    id: 'mch-001',
    teacherId: 'tch-001',
    studentId: 'stu-001',
    totalScore: 91.5,
    dimensionScores: {
      styleMatch: 100,
      teacherRating: 98,
      styleFit: 100,
      experience: 100,
      priceMatch: 50,
    },
    matchedAt: formatDateTime(addDays(today, -7)),
    status: '已完成',
    notes: '学员考级目标明确，王老师正统教学非常契合',
  },
  {
    id: 'mch-002',
    teacherId: 'tch-003',
    studentId: 'stu-003',
    totalScore: 94.2,
    dimensionScores: {
      styleMatch: 100,
      teacherRating: 96,
      styleFit: 100,
      experience: 100,
      priceMatch: 73,
    },
    matchedAt: formatDateTime(addDays(today, -10)),
    status: '已完成',
    notes: '行草双修，张老师豪放风格与学员完美契合',
  },
  {
    id: 'mch-003',
    teacherId: 'tch-004',
    studentId: 'stu-004',
    totalScore: 89.0,
    dimensionScores: {
      styleMatch: 100,
      teacherRating: 92,
      styleFit: 100,
      experience: 75,
      priceMatch: 75,
    },
    matchedAt: formatDateTime(addDays(today, -5)),
    status: '已确认',
    notes: '篆隶古典路线，陈老师的典雅风格深受学员喜爱',
  },
  {
    id: 'mch-004',
    teacherId: 'tch-005',
    studentId: 'stu-005',
    totalScore: 86.8,
    dimensionScores: {
      styleMatch: 100,
      teacherRating: 90,
      styleFit: 100,
      experience: 40,
      priceMatch: 100,
    },
    matchedAt: formatDateTime(addDays(today, -3)),
    status: '待确认',
    notes: '少儿启蒙班，赵老师活泼的教学风格适合小学生',
  },
];

export const mockArtworks: Artwork[] = [
  {
    id: 'art-001',
    matchId: 'mch-001',
    studentId: 'stu-001',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20kai%20shu%20regular%20script%20calligraphy%20artwork%20on%20rice%20paper%20elegant&image_size=portrait_4_3',
    title: '九成宫醴泉铭临摹',
    style: '楷书',
    score: 88,
    teacherComment: '结构端正，用笔稳健，欧体特征把握到位。注意捺画的波磔变化，继续加强基本笔画的力度控制。',
    submittedAt: formatDateTime(addDays(today, -5)),
  },
  {
    id: 'art-002',
    matchId: 'mch-001',
    studentId: 'stu-001',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20calligraphy%20yan%20style%20regular%20script%20characters%20on%20xuan%20paper%20traditional&image_size=portrait_4_3',
    title: '颜勤礼碑选临',
    style: '楷书',
    score: 91,
    teacherComment: '进步明显！颜体的雄浑大气已经展现出来，横细竖粗对比鲜明。建议加强竖钩的出锋角度练习。',
    submittedAt: formatDateTime(addDays(today, -2)),
  },
  {
    id: 'art-003',
    matchId: 'mch-002',
    studentId: 'stu-003',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20xing%20shu%20running%20script%20cursive%20calligraphy%20artistic%20masterpiece&image_size=landscape_4_3',
    title: '兰亭序意临',
    style: '行书',
    score: 94,
    teacherComment: '气韵生动，章法布局自然流畅。字与字之间的牵丝映带处理得很好，墨色浓淡变化富有节奏。',
    submittedAt: formatDateTime(addDays(today, -8)),
  },
  {
    id: 'art-004',
    matchId: 'mch-002',
    studentId: 'stu-003',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20cao%20shu%20cursive%20wild%20calligraphy%20abstract%20ink%20art%20expressive&image_size=landscape_4_3',
    title: '自叙帖节临',
    style: '草书',
    score: 89,
    teacherComment: '怀素草书的狂放精神领会深刻，线条流畅。注意部分字的结构辨认度，狂中有序方能出神入化。',
    submittedAt: formatDateTime(addDays(today, -4)),
  },
  {
    id: 'art-005',
    matchId: 'mch-003',
    studentId: 'stu-004',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ancient%20chinese%20zhuan%20shu%20seal%20script%20calligraphy%20bronze%20inscription%20style&image_size=square_hd',
    title: '石鼓文节临',
    style: '篆书',
    score: 92,
    teacherComment: '石鼓文的苍茫古朴表现出色，线条圆劲有力，结体匀称。建议加强行笔中的涩感，更添金石之气。',
    submittedAt: formatDateTime(addDays(today, -6)),
  },
  {
    id: 'art-006',
    matchId: 'mch-003',
    studentId: 'stu-004',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20li%20shu%20clerical%20script%20calligraphy%20cao%20quan%20bei%20style%20elegant&image_size=portrait_4_3',
    title: '曹全碑临摹',
    style: '隶书',
    score: 87,
    teacherComment: '秀美飘逸，曹全碑的韵味十足。蚕头燕尾特征明显，注意波画不要过于夸张，整体协调感很重要。',
    submittedAt: formatDateTime(addDays(today, -1)),
  },
];

export const mockWeightConfig: WeightConfig = {
  id: 'wc-default',
  styleMatch: 0.30,
  teacherRating: 0.25,
  styleFit: 0.20,
  experience: 0.15,
  priceMatch: 0.10,
  updatedAt: formatDateTime(today),
};

export const mockNotifications: Notification[] = [
  {
    id: 'not-001',
    type: '系统',
    title: '欢迎使用书法培训排课系统',
    content: '系统已初始化完成，您可以开始创建课程、管理师生档案了。如需帮助，请查看使用文档。',
    isRead: true,
    createdAt: formatDateTime(addDays(today, -30)),
  },
  {
    id: 'not-002',
    type: '补位',
    title: '楷书基础班名额释放通知',
    content: '学员「雨婷」超时未签到，名额已释放。候补队列中的「子轩」已收到补位通知，请等待确认。',
    isRead: true,
    createdAt: formatDateTime(addMinutes(today, -120)),
  },
  {
    id: 'not-003',
    type: '撮合',
    title: '新撮合待确认：赵笔锋 × 子轩',
    content: '系统为学员「子轩」匹配了老师「赵笔锋」，综合得分 86.8 分。请前往撮合管理页面确认。',
    isRead: false,
    createdAt: formatDateTime(addDays(today, -3)),
    relatedId: 'mch-004',
  },
  {
    id: 'not-004',
    type: '作品',
    title: '新作品待评分：九成宫醴泉铭临摹',
    content: '学员「小明」提交了新作品《九成宫醴泉铭临摹》，请前往作品展评页面进行评分和评语登记。',
    isRead: false,
    createdAt: formatDateTime(addDays(today, -2)),
    relatedId: 'art-001',
  },
  {
    id: 'not-005',
    type: '系统',
    title: '本周课程排期提醒',
    content: '本周共有 10 个课程排期，涉及 4 个教室、8 位老师。请提前确认教室设备和老师到岗情况。',
    isRead: false,
    createdAt: formatDateTime(addDays(today, -1)),
  },
];

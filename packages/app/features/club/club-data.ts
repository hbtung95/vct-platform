'use client'

import { useEffect, useMemo, useState } from 'react'

export const CLUB_ID = 'CLB-001'
const STORAGE_PREFIX = 'vct:club:'

export type MemberStatus = 'active' | 'pending' | 'inactive' | 'rejected'
export type MemberRole = 'athlete' | 'coach' | 'assistant' | 'staff'
export type BeltRank = 'white' | 'yellow' | 'green' | 'blue' | 'red' | 'black'

export interface ClubMember {
  id: string
  fullName: string
  gender: 'male' | 'female'
  dateOfBirth: string
  phone: string
  email: string
  beltRank: BeltRank
  role: MemberRole
  status: MemberStatus
  joinDate: string
  classIds: string[]
  note?: string
}

export type ClassLevel = 'beginner' | 'intermediate' | 'advanced' | 'competition' | 'kids'
export type ClassStatus = 'active' | 'paused' | 'draft'

export interface ClubClassSchedule {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface ClubClass {
  id: string
  name: string
  level: ClassLevel
  coachName: string
  assistantName?: string
  maxStudents: number
  currentStudents: number
  monthlyFee: number
  location: string
  status: ClassStatus
  focus: string[]
  sessions: ClubClassSchedule[]
}

export type TrainingTrack = 'quyen' | 'doi_khang' | 'the_luc' | 'ky_thuat'
export type ModuleStatus = 'active' | 'draft' | 'archived'

export interface ClubTrainingModule {
  id: string
  title: string
  track: TrainingTrack
  level: ClassLevel
  durationWeeks: number
  lessons: number
  progress: number
  owner: string
  status: ModuleStatus
  updatedAt: string
}

export type ExamStatus = 'upcoming' | 'completed' | 'draft'

export interface ClubBeltExam {
  id: string
  name: string
  examDate: string
  level: BeltRank
  status: ExamStatus
  candidates: number
  passedCount: number
  location: string
}

export type TournamentStatus = 'registration' | 'upcoming' | 'ongoing' | 'completed'

export interface ClubTournament {
  id: string
  name: string
  startDate: string
  endDate: string
  location: string
  status: TournamentStatus
  registeredAthletes: number
  events: number
  leadCoach: string
  medals: {
    gold: number
    silver: number
    bronze: number
  }
}

export type FinanceType = 'income' | 'expense'
export type FinanceStatus = 'posted' | 'pending'
export type FinanceMethod = 'cash' | 'bank' | 'qr'

export interface ClubFinanceEntry {
  id: string
  type: FinanceType
  category: string
  amount: number
  date: string
  description: string
  recordedBy: string
  method: FinanceMethod
  status: FinanceStatus
}

export interface ClubCertificationRecord {
  id: string
  memberName: string
  fromRank: BeltRank
  toRank: BeltRank
  examDate: string
  examCode: string
  result: 'pass' | 'fail'
  issuedBy: string
}

export interface ClubSettings {
  id: string
  name: string
  shortName: string
  code: string
  type: 'club' | 'vo_duong'
  lineage: string
  district: string
  address: string
  leaderName: string
  leaderPhone: string
  email: string
  website: string
  foundedDate: string
  facilitySize: number
  maxCapacity: number
  status: 'active' | 'paused'
  trainingDays: number[]
  openTime: string
  closeTime: string
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readStorage = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) return clone(fallback)
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return clone(fallback)
    return JSON.parse(raw) as T
  } catch {
    return clone(fallback)
  }
}

const writeStorage = <T,>(key: string, value: T) => {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage failures
  }
}

export const makeClubId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const useClubStoredState = <T,>(name: string, seed: T) => {
  const storageKey = `${STORAGE_PREFIX}${name}`
  const [state, setState] = useState<T>(clone(seed))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setState(readStorage(storageKey, seed))
    setReady(true)
  }, [storageKey, seed])

  useEffect(() => {
    if (!ready) return
    writeStorage(storageKey, state)
  }, [ready, state, storageKey])

  return [state, setState, ready] as const
}

export const BELT_LABEL: Record<BeltRank, string> = {
  white: 'Trang',
  yellow: 'Vang',
  green: 'Xanh la',
  blue: 'Xanh duong',
  red: 'Do',
  black: 'Den',
}

export const BELT_EMOJI: Record<BeltRank, string> = {
  white: '🤍',
  yellow: '💛',
  green: '💚',
  blue: '💙',
  red: '❤️',
  black: '🖤',
}

export const CLASS_LEVEL_LABEL: Record<ClassLevel, string> = {
  beginner: 'Co ban',
  intermediate: 'Trung cap',
  advanced: 'Nang cao',
  competition: 'Thi dau',
  kids: 'Thieu nhi',
}

export const CLASS_STATUS_LABEL: Record<ClassStatus, string> = {
  active: 'Hoat dong',
  paused: 'Tam nghi',
  draft: 'Nhap',
}

export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = {
  athlete: 'Vo sinh',
  coach: 'HLV',
  assistant: 'Tro giang',
  staff: 'Van hanh',
}

export const MEMBER_STATUS_LABEL: Record<MemberStatus, string> = {
  active: 'Hoat dong',
  pending: 'Cho duyet',
  inactive: 'Ngung HD',
  rejected: 'Tu choi',
}

export const TOURNAMENT_STATUS_LABEL: Record<TournamentStatus, string> = {
  registration: 'Dang mo dang ky',
  upcoming: 'Sap dien ra',
  ongoing: 'Dang thi dau',
  completed: 'Da ket thuc',
}

export const TOURNAMENT_STATUS_TONE: Record<
  TournamentStatus,
  'warning' | 'info' | 'success' | 'neutral'
> = {
  registration: 'warning',
  upcoming: 'info',
  ongoing: 'success',
  completed: 'neutral',
}

export const FINANCE_TYPE_LABEL: Record<FinanceType, string> = {
  income: 'Thu',
  expense: 'Chi',
}

export const DAY_LABEL = (dayOfWeek: number) => {
  const map: Record<number, string> = {
    1: 'Thu 2',
    2: 'Thu 3',
    3: 'Thu 4',
    4: 'Thu 5',
    5: 'Thu 6',
    6: 'Thu 7',
    7: 'Chu nhat',
  }
  return map[dayOfWeek] ?? `Ngay ${dayOfWeek}`
}

export const MEMBER_SEED: ClubMember[] = [
  {
    id: 'MBR-001',
    fullName: 'Nguyen Van Minh',
    gender: 'male',
    dateOfBirth: '2009-04-11',
    phone: '0901112233',
    email: 'minh.nguyen@vct.club',
    beltRank: 'green',
    role: 'athlete',
    status: 'active',
    joinDate: '2024-09-10',
    classIds: ['CLS-001', 'CLS-003'],
  },
  {
    id: 'MBR-002',
    fullName: 'Tran Thi Ha',
    gender: 'female',
    dateOfBirth: '2010-06-03',
    phone: '0901112244',
    email: 'ha.tran@vct.club',
    beltRank: 'yellow',
    role: 'athlete',
    status: 'pending',
    joinDate: '2026-02-02',
    classIds: ['CLS-001'],
  },
  {
    id: 'MBR-003',
    fullName: 'Le Quang Huy',
    gender: 'male',
    dateOfBirth: '2003-12-15',
    phone: '0901112255',
    email: 'huy.le@vct.club',
    beltRank: 'black',
    role: 'coach',
    status: 'active',
    joinDate: '2020-01-12',
    classIds: ['CLS-002', 'CLS-004'],
  },
  {
    id: 'MBR-004',
    fullName: 'Pham Nhat Linh',
    gender: 'female',
    dateOfBirth: '2007-01-23',
    phone: '0901112266',
    email: 'linh.pham@vct.club',
    beltRank: 'blue',
    role: 'athlete',
    status: 'active',
    joinDate: '2023-08-01',
    classIds: ['CLS-002'],
  },
  {
    id: 'MBR-005',
    fullName: 'Bui Thanh Nam',
    gender: 'male',
    dateOfBirth: '2012-03-09',
    phone: '0901112277',
    email: 'nam.bui@vct.club',
    beltRank: 'white',
    role: 'athlete',
    status: 'inactive',
    joinDate: '2025-01-15',
    classIds: ['CLS-005'],
  },
  {
    id: 'MBR-006',
    fullName: 'Do Thi Thao',
    gender: 'female',
    dateOfBirth: '2005-10-21',
    phone: '0901112288',
    email: 'thao.do@vct.club',
    beltRank: 'red',
    role: 'assistant',
    status: 'active',
    joinDate: '2021-06-09',
    classIds: ['CLS-003', 'CLS-004'],
  },
]

export const CLASS_SEED: ClubClass[] = [
  {
    id: 'CLS-001',
    name: 'Co ban thieu nhi',
    level: 'kids',
    coachName: 'Le Quang Huy',
    assistantName: 'Do Thi Thao',
    maxStudents: 28,
    currentStudents: 21,
    monthlyFee: 420000,
    location: 'Phong tap A',
    status: 'active',
    focus: ['Can ban cong phap', 'Ky luat', 'Than phap'],
    sessions: [
      { dayOfWeek: 2, startTime: '18:00', endTime: '19:30' },
      { dayOfWeek: 4, startTime: '18:00', endTime: '19:30' },
      { dayOfWeek: 6, startTime: '18:00', endTime: '19:30' },
    ],
  },
  {
    id: 'CLS-002',
    name: 'Nang cao doi khang',
    level: 'advanced',
    coachName: 'Le Quang Huy',
    maxStudents: 20,
    currentStudents: 16,
    monthlyFee: 620000,
    location: 'San Doi khang',
    status: 'active',
    focus: ['Chien thuat tran dau', 'Phan xa', 'The luc'],
    sessions: [
      { dayOfWeek: 3, startTime: '19:00', endTime: '20:30' },
      { dayOfWeek: 5, startTime: '19:00', endTime: '20:30' },
      { dayOfWeek: 7, startTime: '16:00', endTime: '18:00' },
    ],
  },
  {
    id: 'CLS-003',
    name: 'Boi duong quyen',
    level: 'competition',
    coachName: 'Do Thi Thao',
    maxStudents: 16,
    currentStudents: 12,
    monthlyFee: 700000,
    location: 'Phong tap B',
    status: 'active',
    focus: ['Lao Mai Quyen', 'Ngu Mon Quyen', 'Bieu dien'],
    sessions: [
      { dayOfWeek: 2, startTime: '19:30', endTime: '21:00' },
      { dayOfWeek: 6, startTime: '19:30', endTime: '21:00' },
    ],
  },
  {
    id: 'CLS-004',
    name: 'Trung cap tong hop',
    level: 'intermediate',
    coachName: 'Le Quang Huy',
    assistantName: 'Do Thi Thao',
    maxStudents: 24,
    currentStudents: 18,
    monthlyFee: 520000,
    location: 'Phong tap A',
    status: 'paused',
    focus: ['Song luyen', 'Bo phap', 'Khoa go'],
    sessions: [
      { dayOfWeek: 3, startTime: '18:00', endTime: '19:30' },
      { dayOfWeek: 5, startTime: '18:00', endTime: '19:30' },
    ],
  },
  {
    id: 'CLS-005',
    name: 'Co ban nguoi lon',
    level: 'beginner',
    coachName: 'Do Thi Thao',
    maxStudents: 30,
    currentStudents: 14,
    monthlyFee: 450000,
    location: 'Phong tap C',
    status: 'draft',
    focus: ['Can ban', 'Nen the luc'],
    sessions: [
      { dayOfWeek: 7, startTime: '08:00', endTime: '10:00' },
      { dayOfWeek: 1, startTime: '08:00', endTime: '10:00' },
    ],
  },
]

export const TRAINING_MODULE_SEED: ClubTrainingModule[] = [
  {
    id: 'TRN-001',
    title: 'Can ban cong phap cap 1',
    track: 'ky_thuat',
    level: 'beginner',
    durationWeeks: 8,
    lessons: 24,
    progress: 86,
    owner: 'Le Quang Huy',
    status: 'active',
    updatedAt: '2026-03-01',
  },
  {
    id: 'TRN-002',
    title: 'Lao Mai Quyen nang cao',
    track: 'quyen',
    level: 'advanced',
    durationWeeks: 6,
    lessons: 18,
    progress: 64,
    owner: 'Do Thi Thao',
    status: 'active',
    updatedAt: '2026-02-20',
  },
  {
    id: 'TRN-003',
    title: 'He doi khang 3 hiep',
    track: 'doi_khang',
    level: 'competition',
    durationWeeks: 10,
    lessons: 30,
    progress: 42,
    owner: 'Le Quang Huy',
    status: 'active',
    updatedAt: '2026-02-27',
  },
  {
    id: 'TRN-004',
    title: 'The luc nen 12 tuan',
    track: 'the_luc',
    level: 'intermediate',
    durationWeeks: 12,
    lessons: 36,
    progress: 73,
    owner: 'Do Thi Thao',
    status: 'draft',
    updatedAt: '2026-01-10',
  },
]

export const BELT_EXAM_SEED: ClubBeltExam[] = [
  {
    id: 'EXM-2026-Q2',
    name: 'Ky thi thang dai quy 2',
    examDate: '2026-05-25',
    level: 'yellow',
    status: 'upcoming',
    candidates: 28,
    passedCount: 0,
    location: 'Nha tap trung tam',
  },
  {
    id: 'EXM-2026-Q1',
    name: 'Ky thi thang dai quy 1',
    examDate: '2026-01-20',
    level: 'green',
    status: 'completed',
    candidates: 22,
    passedCount: 19,
    location: 'Nha tap trung tam',
  },
]

export const TOURNAMENT_SEED: ClubTournament[] = [
  {
    id: 'TRM-001',
    name: 'Giai tre thanh pho 2026',
    startDate: '2026-04-20',
    endDate: '2026-04-24',
    location: 'Nha thi dau Phu Tho',
    status: 'registration',
    registeredAthletes: 12,
    events: 18,
    leadCoach: 'Le Quang Huy',
    medals: { gold: 0, silver: 0, bronze: 0 },
  },
  {
    id: 'TRM-002',
    name: 'Giai vo co truyen mo rong mien Nam',
    startDate: '2026-06-12',
    endDate: '2026-06-15',
    location: 'Dong Nai',
    status: 'upcoming',
    registeredAthletes: 8,
    events: 11,
    leadCoach: 'Do Thi Thao',
    medals: { gold: 0, silver: 0, bronze: 0 },
  },
  {
    id: 'TRM-003',
    name: 'Giai vo co truyen quoc gia 2025',
    startDate: '2025-08-10',
    endDate: '2025-08-16',
    location: 'Ha Noi',
    status: 'completed',
    registeredAthletes: 10,
    events: 14,
    leadCoach: 'Le Quang Huy',
    medals: { gold: 2, silver: 3, bronze: 4 },
  },
]

export const FINANCE_ENTRY_SEED: ClubFinanceEntry[] = [
  {
    id: 'FIN-001',
    type: 'income',
    category: 'Hoc phi',
    amount: 18400000,
    date: '2026-03-01',
    description: 'Thu hoc phi thang 3',
    recordedBy: 'Nguyen Van Phu',
    method: 'bank',
    status: 'posted',
  },
  {
    id: 'FIN-002',
    type: 'expense',
    category: 'Thue mat bang',
    amount: 9000000,
    date: '2026-03-02',
    description: 'Thanh toan thue phong tap',
    recordedBy: 'Nguyen Van Phu',
    method: 'bank',
    status: 'posted',
  },
  {
    id: 'FIN-003',
    type: 'expense',
    category: 'Trang thiet bi',
    amount: 3200000,
    date: '2026-03-03',
    description: 'Mua gang, giap tap doi khang',
    recordedBy: 'Do Thi Thao',
    method: 'cash',
    status: 'posted',
  },
  {
    id: 'FIN-004',
    type: 'income',
    category: 'Tai tro',
    amount: 5000000,
    date: '2026-03-05',
    description: 'Tai tro giai noi bo CLB',
    recordedBy: 'Nguyen Van Phu',
    method: 'qr',
    status: 'pending',
  },
]

export const CERTIFICATION_SEED: ClubCertificationRecord[] = [
  {
    id: 'CRT-001',
    memberName: 'Nguyen Van Minh',
    fromRank: 'yellow',
    toRank: 'green',
    examDate: '2026-01-20',
    examCode: 'EXM-2026-Q1',
    result: 'pass',
    issuedBy: 'Hoi dong chuyen mon CLB',
  },
  {
    id: 'CRT-002',
    memberName: 'Pham Nhat Linh',
    fromRank: 'green',
    toRank: 'blue',
    examDate: '2025-09-18',
    examCode: 'EXM-2025-Q3',
    result: 'pass',
    issuedBy: 'Hoi dong chuyen mon CLB',
  },
  {
    id: 'CRT-003',
    memberName: 'Bui Thanh Nam',
    fromRank: 'white',
    toRank: 'yellow',
    examDate: '2025-09-18',
    examCode: 'EXM-2025-Q3',
    result: 'fail',
    issuedBy: 'Hoi dong chuyen mon CLB',
  },
]

export const CLUB_SETTINGS_SEED: ClubSettings = {
  id: CLUB_ID,
  name: 'CLB Vo co truyen Thanh Long',
  shortName: 'Thanh Long',
  code: 'CLB-TL-001',
  type: 'club',
  lineage: 'Binh Dinh gia',
  district: 'Quan 7',
  address: '45 Nguyen Thi Thap, Quan 7, TP.HCM',
  leaderName: 'Le Quang Huy',
  leaderPhone: '0901234567',
  email: 'contact@thanhlongclub.vn',
  website: 'thanhlongclub.vn',
  foundedDate: '2016-05-09',
  facilitySize: 520,
  maxCapacity: 220,
  status: 'active',
  trainingDays: [2, 3, 4, 5, 6, 7],
  openTime: '06:30',
  closeTime: '21:30',
}

export const calculateFinanceSummary = (entries: ClubFinanceEntry[]) => {
  let totalIncome = 0
  let totalExpense = 0
  let pending = 0

  entries.forEach((entry) => {
    if (entry.status === 'pending') pending += entry.amount
    if (entry.type === 'income') totalIncome += entry.amount
    if (entry.type === 'expense') totalExpense += entry.amount
  })

  return {
    totalIncome,
    totalExpense,
    pending,
    balance: totalIncome - totalExpense,
    incomeCount: entries.filter((entry) => entry.type === 'income').length,
    expenseCount: entries.filter((entry) => entry.type === 'expense').length,
  }
}

export const useMonthlyNetByMonth = (entries: ClubFinanceEntry[]) =>
  useMemo(() => {
    const monthMap = new Map<string, number>()
    entries.forEach((entry) => {
      const monthKey = entry.date.slice(0, 7)
      const amount = entry.type === 'income' ? entry.amount : -entry.amount
      monthMap.set(monthKey, (monthMap.get(monthKey) ?? 0) + amount)
    })
    return Array.from(monthMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([month, value]) => ({ month, value }))
  }, [entries])


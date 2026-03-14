export const MOCK_REFEREE_ASSIGNMENTS = [
  {
    id: 'asg-1',
    matchId: 'm-101',
    matchNo: 1,
    time: '08:00',
    category: 'Nam 50kg',
    arena: 'Thảm 1',
    role: 'Trọng tài đài',
    redAthlete: 'Nguyễn Văn A (Hà Nội)',
    blueAthlete: 'Trần Văn B (TP.HCM)',
    status: 'pending', // pending, in_progress, completed
  },
  {
    id: 'asg-2',
    matchId: 'm-102',
    matchNo: 2,
    time: '08:15',
    category: 'Nam 50kg',
    arena: 'Thảm 1',
    role: 'Giám định 1',
    redAthlete: 'Lê Hoàng C (Đà Nẵng)',
    blueAthlete: 'Phạm Đức D (Hải Phòng)',
    status: 'completed',
  },
  {
    id: 'asg-3',
    matchId: 'm-201',
    matchNo: 5,
    time: '09:00',
    category: 'Bài Lão Hổ Thượng Sơn',
    arena: 'Thảm 2',
    role: 'Trọng tài mâm',
    redAthlete: 'Vũ Thị E (Cần Thơ)',
    blueAthlete: '',
    status: 'pending',
  },
]

export const REFEREE_DASHBOARD_STATS = {
  totalAssigned: 12,
  completed: 4,
  pending: 8,
  currentArena: 'Thảm 1',
  nextMatchTime: '09:00',
}

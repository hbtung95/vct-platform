export const MOCK_MEDICAL_INCIDENTS = [
  {
    id: 'med-1',
    time: '08:30',
    athleteId: 'a-123',
    athleteName: 'Nguyễn Văn A',
    teamName: 'Đoàn Hà Nội',
    arena: 'Thảm 1',
    matchId: 'm-105',
    severity: 'minor', // minor, moderate, severe
    description: 'Chảy máu cam nhẹ, đã cầm máu.',
    action: 'Sơ cứu tại chỗ',
    status: 'cleared', // cleared, withdrawn, hospital
  },
  {
    id: 'med-2',
    time: '09:15',
    athleteId: 'a-456',
    athleteName: 'Lê Thị B',
    teamName: 'Đoàn TP.HCM',
    arena: 'Thảm 2',
    matchId: 'm-210',
    severity: 'moderate',
    description: 'Bong gân cổ chân phải sau pha tiếp đất.',
    action: 'Theo dõi, phun băng gạc lạnh',
    status: 'withdrawn',
  },
  {
    id: 'med-3',
    time: '10:00',
    athleteId: 'a-789',
    athleteName: 'Trần Văn C',
    teamName: 'Đoàn Đà Nẵng',
    arena: 'Sân tập khởi động',
    matchId: null,
    severity: 'minor',
    description: 'Căng cơ đùi trước.',
    action: 'Xoa bóp, xịt giảm đau',
    status: 'cleared',
  },
]

export const MEDICAL_DASHBOARD_STATS = {
  totalIncidents: 5,
  cleared: 3,
  withdrawn: 1,
  hospital: 0,
  pendingReview: 1,
}

export const MOCK_MEDICAL_RECORDS = [
  {
    id: 'a-123',
    name: 'Nguyễn Văn A',
    team: 'Hà Nội',
    category: 'Nam 50kg',
    status: 'green', // green (cleared), yellow (warning), red (withdrawn)
    lastCheck: 'Hôm nay, 08:35',
  },
  {
    id: 'a-456',
    name: 'Lê Thị B',
    team: 'TP.HCM',
    category: 'Nữ 45kg',
    status: 'red',
    lastCheck: 'Hôm nay, 09:20',
  },
  {
    id: 'a-999',
    name: 'Phạm Văn D',
    team: 'Quân Đội',
    category: 'Nam 60kg',
    status: 'green',
    lastCheck: 'Hôm qua, 15:00',
  },
]

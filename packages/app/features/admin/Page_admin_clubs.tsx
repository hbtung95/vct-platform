'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import {
    VCT_Badge, VCT_Button, VCT_Stack, VCT_Toast,
    VCT_SearchInput, VCT_Select, VCT_EmptyState,
    VCT_PageContainer, VCT_StatRow
} from '../components/vct-ui'
import type { StatItem } from '../components/VCT_StatRow'
import { VCT_Icons } from '../components/vct-icons'
import { VCT_Drawer } from '../components/VCT_Drawer'
import { AdminSkeletonRow } from './components/AdminSkeletonRow'
import { AdminPaginationBar } from './components/AdminPaginationBar'
import { useAdminToast } from './hooks/useAdminToast'
import { exportToCSV } from './utils/adminExport'
import { usePagination } from '../hooks/usePagination'

// ════════════════════════════════════════
// TYPES & MOCK DATA
// ════════════════════════════════════════
interface Club {
    id: string; name: string; province: string; address: string
    head_coach: string; members: number; athletes: number
    established: string; phone: string; email: string
    status: 'active' | 'pending' | 'suspended'
    facilities: number; equipment_score: number
}

const STATUS_BADGE: Record<string, { label: string; type: string }> = {
    active: { label: 'Hoạt động', type: 'success' },
    pending: { label: 'Chờ duyệt', type: 'warning' },
    suspended: { label: 'Tạm ngưng', type: 'danger' },
}

const MOCK_CLUBS: Club[] = [
    { id: 'CLB-001', name: 'CLB Võ Cổ Truyền Bình Định', province: 'Bình Định', address: '123 Lê Lợi, Quy Nhơn', head_coach: 'Võ Đại Hùng', members: 120, athletes: 85, established: '1998-05-10', phone: '0256-3823456', email: 'binhdinh@vctclub.vn', status: 'active', facilities: 3, equipment_score: 92 },
    { id: 'CLB-002', name: 'CLB VCT Phú Thọ', province: 'TP.HCM', address: '58 Phú Thọ, Quận 11', head_coach: 'Nguyễn Thị Lan', members: 95, athletes: 68, established: '2001-03-15', phone: '028-38567890', email: 'phutho@vctclub.vn', status: 'active', facilities: 2, equipment_score: 88 },
    { id: 'CLB-003', name: 'CLB VCT Thanh Xuân', province: 'Hà Nội', address: '45 Nguyễn Trãi, Thanh Xuân', head_coach: 'Phạm Minh Trung', members: 75, athletes: 52, established: '2005-08-20', phone: '024-38678901', email: 'thanhxuan@vctclub.vn', status: 'active', facilities: 2, equipment_score: 85 },
    { id: 'CLB-004', name: 'CLB VCT Sơn Trà', province: 'Đà Nẵng', address: '12 Phạm Văn Đồng, Sơn Trà', head_coach: 'Lê Văn Phong', members: 45, athletes: 30, established: '2015-01-10', phone: '0236-3789012', email: 'sontra@vctclub.vn', status: 'pending', facilities: 1, equipment_score: 72 },
    { id: 'CLB-005', name: 'CLB VCT Bình Dương', province: 'Bình Dương', address: '88 Đại lộ BD, Thủ Dầu Một', head_coach: 'Trần Đức Thắng', members: 60, athletes: 42, established: '2010-06-15', phone: '0274-3890123', email: 'binhduong@vctclub.vn', status: 'active', facilities: 2, equipment_score: 80 },
    { id: 'CLB-006', name: 'CLB VCT Cần Thơ', province: 'Cần Thơ', address: '30 Trần Hưng Đạo, Ninh Kiều', head_coach: 'Ngô Thanh Tùng', members: 38, athletes: 25, established: '2018-09-01', phone: '0292-3901234', email: 'cantho@vctclub.vn', status: 'suspended', facilities: 1, equipment_score: 65 },
]


// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
export const Page_admin_clubs = () => {
    const [clubs, setClubs] = useState(MOCK_CLUBS)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [isLoading, setIsLoading] = useState(true)
    const [selected, setSelected] = useState<Club | null>(null)
    const { toast, showToast, dismiss } = useAdminToast()

    React.useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const filtered = useMemo(() => {
        return clubs.filter(c => {
            const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.province.toLowerCase().includes(search.toLowerCase()) || c.head_coach.toLowerCase().includes(search.toLowerCase())
            const matchStatus = filterStatus === 'all' || c.status === filterStatus
            return matchSearch && matchStatus
        })
    }, [clubs, search, filterStatus])

    const pagination = usePagination(filtered, { pageSize: 10 })

    const totalMembers = clubs.reduce((a, c) => a + c.members, 0)
    const totalAthletes = clubs.reduce((a, c) => a + c.athletes, 0)

    const stats: StatItem[] = [
        { icon: <VCT_Icons.Home size={20} />, label: 'Tổng CLB', value: clubs.length, color: '#0ea5e9' },
        { icon: <VCT_Icons.Users size={20} />, label: 'Tổng thành viên', value: totalMembers, color: '#10b981' },
        { icon: <VCT_Icons.Award size={20} />, label: 'VĐV đang luyện', value: totalAthletes, color: '#94a3b8' },
        { icon: <VCT_Icons.Clock size={20} />, label: 'Chờ duyệt', value: clubs.filter(c => c.status === 'pending').length, color: '#f59e0b' },
    ]

    const handleApprove = (id: string) => {
        setClubs(prev => prev.map(c => c.id === id ? { ...c, status: 'active' as const } : c))
        showToast('Đã duyệt CLB')
        setSelected(null)
    }

    const handleSuspend = (id: string) => {
        setClubs(prev => prev.map(c => c.id === id ? { ...c, status: 'suspended' as const } : c))
        showToast('Đã tạm ngưng CLB', 'info')
    }

    const handleExportCSV = () => {
        exportToCSV({
            headers: ['ID', 'Tên CLB', 'Tỉnh/TP', 'HLV trưởng', 'Thành viên', 'VĐV', 'Thiết bị', 'Trạng thái', 'Email'],
            rows: filtered.map(c => [c.id, c.name, c.province, c.head_coach, String(c.members), String(c.athletes), `${c.equipment_score}%`, STATUS_BADGE[c.status]?.label ?? c.status, c.email]),
            filename: 'vct_clubs.csv',
        })
        showToast('Đã xuất danh sách CLB!')
    }

    return (
        <VCT_PageContainer size="wide" animated>
            <VCT_Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={dismiss} />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-(--vct-text-primary) flex items-center gap-3">
                    <VCT_Icons.Home size={28} className="text-[#10b981]" /> Quản lý Câu lạc bộ
                </h1>
                <p className="text-sm text-(--vct-text-secondary) mt-1">CLB, thành viên, cơ sở vật chất, và thiết bị</p>
            </div>

            <VCT_StatRow items={stats} className="mb-6" />

            <div className="flex flex-wrap items-center gap-3 mb-6">
                <VCT_SearchInput value={search} onChange={setSearch} placeholder="Tìm CLB..." className="flex-1 min-w-[220px]" />
                <VCT_Select value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'Tất cả' }, ...Object.entries(STATUS_BADGE).map(([k, v]) => ({ value: k, label: v.label }))]} />
                <VCT_Button variant="outline" icon={<VCT_Icons.Download size={16} />} onClick={handleExportCSV}>Xuất CSV</VCT_Button>
            </div>

            {/* ── Table ── */}
            <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-(--vct-border-subtle)">
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">CLB</th>
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Tỉnh/TP</th>
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">HLV trưởng</th>
                                <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Thành viên</th>
                                <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">VĐV</th>
                                <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Thiết bị</th>
                                <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Trạng thái</th>
                                <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? [...Array(5)].map((_, i) => <AdminSkeletonRow key={i} cols={8} />) : pagination.paginatedItems.length === 0 ? (
                                <tr><td colSpan={8}><VCT_EmptyState icon={<VCT_Icons.Home size={40} />} title="Không tìm thấy CLB" /></td></tr>
                            ) : pagination.paginatedItems.map(c => {
                                return (
                                    <tr key={c.id} className="border-b border-(--vct-border-subtle) hover:bg-(--vct-bg-base) cursor-pointer transition-colors" onClick={() => setSelected(c)}>
                                        <td className="p-4">
                                            <div className="font-bold text-(--vct-text-primary)">{c.name}</div>
                                            <div className="text-xs text-(--vct-text-tertiary)">{c.id}</div>
                                        </td>
                                        <td className="p-4 text-(--vct-text-secondary)">{c.province}</td>
                                        <td className="p-4 text-(--vct-text-secondary)">{c.head_coach}</td>
                                        <td className="p-4 text-center font-bold text-(--vct-text-primary)">{c.members}</td>
                                        <td className="p-4 text-center font-bold text-(--vct-text-primary)">{c.athletes}</td>
                                        <td className="p-4 text-center"><VCT_Badge type={c.equipment_score >= 85 ? 'success' : c.equipment_score >= 70 ? 'warning' : 'danger'} text={`${c.equipment_score}%`} /></td>
                                        <td className="p-4 text-center"><VCT_Badge type={STATUS_BADGE[c.status]?.type ?? 'neutral'} text={STATUS_BADGE[c.status]?.label ?? c.status} /></td>
                                        <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                            {c.status === 'pending' && <VCT_Button size="sm" variant="ghost" onClick={() => handleApprove(c.id)} icon={<VCT_Icons.CheckCircle size={14} />}>Duyệt</VCT_Button>}
                                            {c.status === 'active' && <VCT_Button size="sm" variant="ghost" onClick={() => handleSuspend(c.id)} icon={<VCT_Icons.Close size={14} />}>Ngưng</VCT_Button>}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {!isLoading && pagination.totalPages > 1 && (
                    <AdminPaginationBar {...pagination} />
                )}
            </div>

            {/* ── Detail Drawer ── */}
            <VCT_Drawer isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width={520}>
                {selected && (
                    <VCT_Stack gap={20}>
                        <div className="flex items-center gap-3">
                            <VCT_Badge type={STATUS_BADGE[selected.status]?.type ?? 'neutral'} text={STATUS_BADGE[selected.status]?.label ?? selected.status} />
                            <span className="text-xs text-(--vct-text-tertiary) font-mono">{selected.id}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Địa chỉ', value: selected.address },
                                { label: 'Tỉnh/TP', value: selected.province },
                                { label: 'HLV trưởng', value: selected.head_coach },
                                { label: 'Thành lập', value: selected.established },
                                { label: 'Thành viên', value: String(selected.members) },
                                { label: 'VĐV', value: String(selected.athletes) },
                                { label: 'Cơ sở vật chất', value: `${selected.facilities} phòng tập` },
                                { label: 'Điểm thiết bị', value: `${selected.equipment_score}/100` },
                                { label: 'SĐT', value: selected.phone },
                                { label: 'Email', value: selected.email },
                            ].map(item => (
                                <div key={item.label} className="p-3 bg-(--vct-bg-base) rounded-xl border border-(--vct-border-subtle)">
                                    <div className="text-[10px] uppercase tracking-wider text-(--vct-text-tertiary) font-bold mb-1">{item.label}</div>
                                    <div className="font-bold text-sm text-(--vct-text-primary)">{item.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Equipment score bar */}
                        <div>
                            <div className="text-xs text-(--vct-text-tertiary) font-bold mb-2">Chất lượng thiết bị</div>
                            <div className="w-full h-3 bg-(--vct-bg-base) rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${selected.equipment_score}%`, backgroundColor: selected.equipment_score >= 85 ? '#10b981' : selected.equipment_score >= 70 ? '#f59e0b' : '#ef4444' }} />
                            </div>
                        </div>

                        <VCT_Stack direction="row" gap={8} className="pt-2 border-t border-(--vct-border-subtle)">
                            {selected.status === 'pending' && <VCT_Button variant="primary" onClick={() => handleApprove(selected.id)} icon={<VCT_Icons.CheckCircle size={14} />}>Duyệt CLB</VCT_Button>}
                            {selected.status === 'active' && <VCT_Button variant="ghost" onClick={() => { handleSuspend(selected.id); setSelected(null) }} icon={<VCT_Icons.Close size={14} />}>Tạm ngưng</VCT_Button>}
                        </VCT_Stack>
                    </VCT_Stack>
                )}
            </VCT_Drawer>
        </VCT_PageContainer>
    )
}

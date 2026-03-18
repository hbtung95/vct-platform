'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import {
    VCT_Badge, VCT_Button, VCT_Stack, VCT_Toast,
    VCT_SearchInput, VCT_Modal, VCT_Input, VCT_Field, VCT_Select,
    VCT_ConfirmDialog, VCT_EmptyState,
    VCT_PageContainer, VCT_StatRow
} from '../components/vct-ui'
import type { StatItem } from '../components/VCT_StatRow'
import { VCT_Icons } from '../components/vct-icons'
import { VCT_Drawer } from '../components/VCT_Drawer'
import { VCT_Timeline } from '../components/VCT_Timeline'
import type { TimelineEvent } from '../components/VCT_Timeline'
import { AdminSkeletonRow } from './components/AdminSkeletonRow'

// ════════════════════════════════════════
// TYPES & MOCK DATA
// ════════════════════════════════════════
interface Tournament {
    id: string
    name: string
    type: 'national' | 'provincial' | 'club' | 'international'
    status: 'draft' | 'registration' | 'in_progress' | 'completed' | 'cancelled'
    start_date: string
    end_date: string
    location: string
    athletes_count: number
    events_count: number
    organizer: string
    budget: string
}

const STATUS_BADGE: Record<string, { label: string; type: string }> = {
    draft: { label: 'Nháp', type: 'neutral' },
    registration: { label: 'Đang đăng ký', type: 'info' },
    in_progress: { label: 'Đang diễn ra', type: 'warning' },
    completed: { label: 'Hoàn thành', type: 'success' },
    cancelled: { label: 'Đã hủy', type: 'danger' },
}

const TYPE_BADGE: Record<string, { label: string; type: string }> = {
    national: { label: 'Quốc gia', type: 'danger' },
    provincial: { label: 'Tỉnh/TP', type: 'info' },
    club: { label: 'CLB', type: 'success' },
    international: { label: 'Quốc tế', type: 'neutral' },
}

const MOCK_TOURNAMENTS: Tournament[] = [
    { id: 'TN-001', name: 'Giải Vô địch Võ Cổ Truyền Quốc gia 2024', type: 'national', status: 'in_progress', start_date: '2024-06-15', end_date: '2024-06-20', location: 'TP. Hồ Chí Minh', athletes_count: 450, events_count: 32, organizer: 'Liên đoàn VCT Việt Nam', budget: '2.5 tỷ' },
    { id: 'TN-002', name: 'Giải VCT Mở rộng TP.HCM 2024', type: 'provincial', status: 'registration', start_date: '2024-07-10', end_date: '2024-07-14', location: 'Nhà thi đấu Phú Thọ', athletes_count: 180, events_count: 24, organizer: 'Sở VH-TT TP.HCM', budget: '800 triệu' },
    { id: 'TN-003', name: 'Giải Trẻ Võ Cổ Truyền Toàn quốc', type: 'national', status: 'draft', start_date: '2024-08-01', end_date: '2024-08-05', location: 'Hà Nội', athletes_count: 0, events_count: 20, organizer: 'Liên đoàn VCT Việt Nam', budget: '1.2 tỷ' },
    { id: 'TN-004', name: 'VCT International Championship 2024', type: 'international', status: 'draft', start_date: '2024-09-20', end_date: '2024-09-25', location: 'Đà Nẵng', athletes_count: 0, events_count: 40, organizer: 'VCT International', budget: '5 tỷ' },
    { id: 'TN-005', name: 'Giải VCT Đồng bằng Sông Cửu Long', type: 'provincial', status: 'completed', start_date: '2024-03-10', end_date: '2024-03-14', location: 'Cần Thơ', athletes_count: 220, events_count: 18, organizer: 'Liên đoàn VCT Cần Thơ', budget: '600 triệu' },
    { id: 'TN-006', name: 'Giải Giao hữu CLB Bình Định', type: 'club', status: 'completed', start_date: '2024-02-20', end_date: '2024-02-22', location: 'Quy Nhơn', athletes_count: 80, events_count: 12, organizer: 'CLB VCT Bình Định', budget: '200 triệu' },
    { id: 'TN-007', name: 'Giải Trẻ Hà Nội Mở rộng 2024', type: 'provincial', status: 'cancelled', start_date: '2024-04-15', end_date: '2024-04-18', location: 'Hà Nội', athletes_count: 0, events_count: 16, organizer: 'Sở VH-TT Hà Nội', budget: '500 triệu' },
]

const MOCK_EVENTS = [
    { id: 'EV-001', name: 'Đối kháng Nam - 54kg', category: 'Đối kháng', gender: 'Nam', weight: '54kg' },
    { id: 'EV-002', name: 'Đối kháng Nam - 60kg', category: 'Đối kháng', gender: 'Nam', weight: '60kg' },
    { id: 'EV-003', name: 'Quyền thuật Nam - Ngũ Hình Quyền', category: 'Quyền', gender: 'Nam', weight: '-' },
    { id: 'EV-004', name: 'Đối kháng Nữ - 48kg', category: 'Đối kháng', gender: 'Nữ', weight: '48kg' },
    { id: 'EV-005', name: 'Biểu diễn Đồng đội - Quyền', category: 'Biểu diễn', gender: 'Hỗn hợp', weight: '-' },
]

const TOURNAMENT_TIMELINE: TimelineEvent[] = [
    { time: '10:30', title: 'Tạo bảng thi đấu Đối kháng Nam 54kg', description: 'admin@vct.vn · 16 VĐV', icon: <VCT_Icons.Layers size={14} />, color: '#0ea5e9' },
    { time: '09:45', title: 'Duyệt đăng ký 12 VĐV mới', description: 'btc@vct.vn · CLB Bình Định', icon: <VCT_Icons.CheckCircle size={14} />, color: '#10b981' },
    { time: '09:15', title: 'Mở đăng ký Giải VCT Mở rộng', description: 'admin@vct.vn · Deadline: 05/07/2024', icon: <VCT_Icons.Flag size={14} />, color: '#f59e0b' },
    { time: 'Hôm qua', title: 'Cập nhật ngân sách giải Quốc gia', description: 'finance@vct.vn · +500 triệu', icon: <VCT_Icons.DollarSign size={14} />, color: '#8b5cf6' },
]



import { useAdminToast } from './hooks/useAdminToast'

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
export const Page_admin_tournaments = () => {
    const [tournaments, setTournaments] = useState(MOCK_TOURNAMENTS)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterType, setFilterType] = useState<string>('all')
    const [isLoading, setIsLoading] = useState(true)
    const [selected, setSelected] = useState<Tournament | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
    const { toast, showToast, dismiss } = useAdminToast()

    React.useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const filtered = useMemo(() => {
        return tournaments.filter(t => {
            const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()) || t.location.toLowerCase().includes(search.toLowerCase())
            const matchStatus = filterStatus === 'all' || t.status === filterStatus
            const matchType = filterType === 'all' || t.type === filterType
            return matchSearch && matchStatus && matchType
        })
    }, [tournaments, search, filterStatus, filterType])

    const stats: StatItem[] = [
        { icon: <VCT_Icons.Trophy size={20} />, label: 'Tổng giải đấu', value: tournaments.length, color: '#0ea5e9' },
        { icon: <VCT_Icons.Activity size={20} />, label: 'Đang diễn ra', value: tournaments.filter(t => t.status === 'in_progress').length, color: '#f59e0b' },
        { icon: <VCT_Icons.Users size={20} />, label: 'Tổng VĐV', value: tournaments.reduce((a, t) => a + t.athletes_count, 0), color: '#10b981' },
        { icon: <VCT_Icons.Layers size={20} />, label: 'Nội dung', value: tournaments.reduce((a, t) => a + t.events_count, 0), color: '#8b5cf6' },
    ]

    const handleStatusChange = (id: string, newStatus: Tournament['status']) => {
        setTournaments(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t))
        showToast(`Đã chuyển trạng thái giải → ${STATUS_BADGE[newStatus]?.label}`)
    }

    const handleDelete = (id: string) => {
        setTournaments(prev => prev.filter(t => t.id !== id))
        setShowDeleteConfirm(null)
        setSelected(null)
        showToast('Đã xóa giải đấu', 'info')
    }

    return (
        <VCT_PageContainer size="wide" animated>
            <VCT_Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={dismiss} />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-(--vct-text-primary) flex items-center gap-3">
                    <VCT_Icons.Trophy size={28} className="text-[#f59e0b]" /> Quản lý Giải đấu
                </h1>
                <p className="text-sm text-(--vct-text-secondary) mt-1">Tạo, theo dõi và điều hành toàn bộ giải đấu VCT</p>
            </div>

            {/* ── Stats ── */}
            <VCT_StatRow items={stats} className="mb-8" />

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <VCT_SearchInput value={search} onChange={setSearch} placeholder="Tìm giải đấu..." className="flex-1 min-w-[220px]" />
                <VCT_Select value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'Tất cả trạng thái' }, ...Object.entries(STATUS_BADGE).map(([k, v]) => ({ value: k, label: v.label }))]} />
                <VCT_Select value={filterType} onChange={setFilterType} options={[{ value: 'all', label: 'Tất cả loại' }, ...Object.entries(TYPE_BADGE).map(([k, v]) => ({ value: k, label: v.label }))]} />
                <VCT_Button variant="primary" onClick={() => setShowCreateModal(true)} icon={<VCT_Icons.Plus size={16} />}>Tạo giải đấu</VCT_Button>
            </div>

            {/* ── Table ── */}
            <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-(--vct-border-subtle)">
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Mã</th>
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Tên giải</th>
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Loại</th>
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Thời gian</th>
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Địa điểm</th>
                                <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">VĐV</th>
                                <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Trạng thái</th>
                                <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? [...Array(5)].map((_, i) => <AdminSkeletonRow key={i} cols={8} />) : filtered.length === 0 ? (
                                <tr><td colSpan={8}><VCT_EmptyState icon={<VCT_Icons.Trophy size={40} />} title="Chưa có giải đấu" description="Tạo giải đấu mới để bắt đầu" /></td></tr>
                            ) : filtered.map(t => (
                                <tr key={t.id} className="border-b border-(--vct-border-subtle) hover:bg-(--vct-bg-base) cursor-pointer transition-colors" onClick={() => setSelected(t)}>
                                    <td className="p-4 font-mono text-xs text-(--vct-text-tertiary)">{t.id}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-(--vct-text-primary)">{t.name}</div>
                                        <div className="text-xs text-(--vct-text-tertiary)">{t.organizer}</div>
                                    </td>
                                    <td className="p-4"><VCT_Badge type={TYPE_BADGE[t.type]?.type ?? 'neutral'} text={TYPE_BADGE[t.type]?.label ?? t.type} /></td>
                                    <td className="p-4 text-(--vct-text-secondary) text-xs">{t.start_date} → {t.end_date}</td>
                                    <td className="p-4 text-(--vct-text-secondary)">{t.location}</td>
                                    <td className="p-4 text-center font-bold text-(--vct-text-primary)">{t.athletes_count}</td>
                                    <td className="p-4 text-center"><VCT_Badge type={STATUS_BADGE[t.status]?.type ?? 'neutral'} text={STATUS_BADGE[t.status]?.label ?? t.status} /></td>
                                    <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                        <VCT_Stack direction="row" gap={4} justify="center">
                                            {t.status === 'draft' && <VCT_Button size="sm" variant="ghost" onClick={() => handleStatusChange(t.id, 'registration')} icon={<VCT_Icons.Play size={14} />}>Mở ĐK</VCT_Button>}
                                            {t.status === 'registration' && <VCT_Button size="sm" variant="ghost" onClick={() => handleStatusChange(t.id, 'in_progress')} icon={<VCT_Icons.Activity size={14} />}>Bắt đầu</VCT_Button>}
                                            {t.status === 'in_progress' && <VCT_Button size="sm" variant="ghost" onClick={() => handleStatusChange(t.id, 'completed')} icon={<VCT_Icons.CheckCircle size={14} />}>Kết thúc</VCT_Button>}
                                            <VCT_Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(t.id)} icon={<VCT_Icons.Trash size={14} />} />
                                        </VCT_Stack>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Hoạt động gần đây ── */}
            <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl p-5">
                <h3 className="font-bold text-(--vct-text-primary) mb-4 flex items-center gap-2">
                    <VCT_Icons.Activity size={18} className="text-[#f59e0b]" /> Hoạt động giải đấu gần đây
                </h3>
                <VCT_Timeline events={TOURNAMENT_TIMELINE} />
            </div>

            {/* ── Detail Drawer ── */}
            <VCT_Drawer isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width={560}>
                {selected && (
                    <VCT_Stack gap={20}>
                        {/* Header */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <VCT_Badge type={TYPE_BADGE[selected.type]?.type ?? 'neutral'} text={TYPE_BADGE[selected.type]?.label ?? selected.type} />
                            <VCT_Badge type={STATUS_BADGE[selected.status]?.type ?? 'neutral'} text={STATUS_BADGE[selected.status]?.label ?? selected.status} />
                            <span className="text-xs text-(--vct-text-tertiary) font-mono">{selected.id}</span>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Thời gian', value: `${selected.start_date} → ${selected.end_date}` },
                                { label: 'Địa điểm', value: selected.location },
                                { label: 'Đơn vị tổ chức', value: selected.organizer },
                                { label: 'Ngân sách', value: selected.budget },
                                { label: 'Số VĐV', value: String(selected.athletes_count) },
                                { label: 'Số nội dung', value: String(selected.events_count) },
                            ].map(item => (
                                <div key={item.label} className="p-3 bg-(--vct-bg-base) rounded-xl border border-(--vct-border-subtle)">
                                    <div className="text-[10px] uppercase tracking-wider text-(--vct-text-tertiary) font-bold mb-1">{item.label}</div>
                                    <div className="font-bold text-sm text-(--vct-text-primary)">{item.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Nội dung thi đấu */}
                        <div>
                            <h4 className="font-bold text-(--vct-text-primary) mb-3 flex items-center gap-2">
                                <VCT_Icons.Layers size={16} className="text-[#8b5cf6]" /> Nội dung thi đấu
                            </h4>
                            <div className="space-y-2">
                                {MOCK_EVENTS.map(ev => (
                                    <div key={ev.id} className="flex items-center justify-between p-3 bg-(--vct-bg-base) rounded-xl border border-(--vct-border-subtle)">
                                        <div>
                                            <div className="font-bold text-sm text-(--vct-text-primary)">{ev.name}</div>
                                            <div className="text-xs text-(--vct-text-tertiary)">{ev.category} · {ev.gender}</div>
                                        </div>
                                        <VCT_Badge type={ev.category === 'Đối kháng' ? 'danger' : ev.category === 'Quyền' ? 'info' : 'success'} text={ev.weight} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <VCT_Stack direction="row" gap={8} className="pt-2 border-t border-(--vct-border-subtle)">
                            {selected.status === 'draft' && <VCT_Button variant="primary" onClick={() => { handleStatusChange(selected.id, 'registration'); setSelected(null) }} icon={<VCT_Icons.Play size={14} />}>Mở đăng ký</VCT_Button>}
                            {selected.status === 'registration' && <VCT_Button variant="primary" onClick={() => { handleStatusChange(selected.id, 'in_progress'); setSelected(null) }} icon={<VCT_Icons.Activity size={14} />}>Bắt đầu giải</VCT_Button>}
                            {selected.status === 'in_progress' && <VCT_Button variant="primary" onClick={() => { handleStatusChange(selected.id, 'completed'); setSelected(null) }} icon={<VCT_Icons.CheckCircle size={14} />}>Kết thúc giải</VCT_Button>}
                            <VCT_Button variant="ghost" onClick={() => { setShowDeleteConfirm(selected.id); setSelected(null) }} icon={<VCT_Icons.Trash size={14} />}>Xóa</VCT_Button>
                        </VCT_Stack>
                    </VCT_Stack>
                )}
            </VCT_Drawer>

            {/* ── Create Modal ── */}
            <VCT_Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tạo giải đấu mới">
                <VCT_Stack gap={16}>
                    <VCT_Field label="Tên giải đấu"><VCT_Input placeholder="VD: Giải VCT Quốc gia 2024" /></VCT_Field>
                    <div className="grid grid-cols-2 gap-4">
                        <VCT_Field label="Loại giải"><VCT_Select options={Object.entries(TYPE_BADGE).map(([k, v]) => ({ value: k, label: v.label }))} /></VCT_Field>
                        <VCT_Field label="Đơn vị tổ chức"><VCT_Input placeholder="VD: Liên đoàn VCT VN" /></VCT_Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <VCT_Field label="Ngày bắt đầu"><VCT_Input type="date" /></VCT_Field>
                        <VCT_Field label="Ngày kết thúc"><VCT_Input type="date" /></VCT_Field>
                    </div>
                    <VCT_Field label="Địa điểm"><VCT_Input placeholder="VD: Nhà thi đấu Phú Thọ, TP.HCM" /></VCT_Field>
                    <VCT_Field label="Ngân sách dự kiến"><VCT_Input placeholder="VD: 1.5 tỷ" /></VCT_Field>
                    <VCT_Stack direction="row" gap={8} justify="end">
                        <VCT_Button variant="ghost" onClick={() => setShowCreateModal(false)}>Hủy</VCT_Button>
                        <VCT_Button variant="primary" onClick={() => { setShowCreateModal(false); showToast('Đã tạo giải đấu mới') }}>Tạo giải đấu</VCT_Button>
                    </VCT_Stack>
                </VCT_Stack>
            </VCT_Modal>

            {/* ── Delete Confirm ── */}
            <VCT_ConfirmDialog
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                title="Xóa giải đấu?"
                message="Hành động này không thể hoàn tác. Toàn bộ dữ liệu giải đấu sẽ bị xóa."
                confirmLabel="Xóa"
            />
        </VCT_PageContainer>
    )
}

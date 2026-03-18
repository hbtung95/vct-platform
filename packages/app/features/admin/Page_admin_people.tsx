'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import {
    VCT_Badge, VCT_Button, VCT_Stack, VCT_Toast,
    VCT_SearchInput, VCT_Select, VCT_ConfirmDialog, VCT_AvatarLetter, VCT_EmptyState, VCT_Tabs,
    VCT_PageContainer, VCT_StatRow
} from '../components/vct-ui'
import type { StatItem } from '../components/VCT_StatRow'
import { VCT_Icons } from '../components/vct-icons'
import { VCT_Drawer } from '../components/VCT_Drawer'
import { AdminSkeletonRow } from './components/AdminSkeletonRow'
import { useAdminToast } from './hooks/useAdminToast'

// ════════════════════════════════════════
// TYPES & MOCK DATA
// ════════════════════════════════════════
interface Person {
    id: string; name: string; dob: string; gender: string
    club: string; province: string; phone: string; email: string
    type: 'athlete' | 'coach' | 'referee'
    status: 'active' | 'pending' | 'suspended' | 'retired'
    belt?: string; weight_class?: string
    cert_level?: string; specialization?: string
    joined_date: string
}

const STATUS_BADGE: Record<string, { label: string; type: string }> = {
    active: { label: 'Đang hoạt động', type: 'success' },
    pending: { label: 'Chờ duyệt', type: 'warning' },
    suspended: { label: 'Tạm ngưng', type: 'danger' },
    retired: { label: 'Nghỉ', type: 'neutral' },
}

const BELT_BADGE: Record<string, string> = {
    'Đen Nhất Đẳng': 'neutral', 'Đen Nhị Đẳng': 'neutral', 'Đen Tam Đẳng': 'neutral',
    'Nâu': 'warning', 'Xanh': 'info', 'Vàng': 'warning', 'Trắng': 'neutral',
}

const MOCK_PEOPLE: Person[] = [
    { id: 'ATH-001', name: 'Nguyễn Văn An', dob: '2000-05-15', gender: 'Nam', club: 'CLB VCT Bình Định', province: 'Bình Định', phone: '0901234567', email: 'an@vct.vn', type: 'athlete', status: 'active', belt: 'Đen Nhất Đẳng', weight_class: '60kg', joined_date: '2018-03-01' },
    { id: 'ATH-002', name: 'Trần Thị Bình', dob: '2001-08-20', gender: 'Nữ', club: 'CLB VCT TP.HCM', province: 'TP.HCM', phone: '0912345678', email: 'binh@vct.vn', type: 'athlete', status: 'active', belt: 'Nâu', weight_class: '48kg', joined_date: '2019-06-15' },
    { id: 'ATH-003', name: 'Lê Minh Cường', dob: '1999-02-10', gender: 'Nam', club: 'CLB VCT Hà Nội', province: 'Hà Nội', phone: '0923456789', email: 'cuong@vct.vn', type: 'athlete', status: 'pending', belt: 'Xanh', weight_class: '68kg', joined_date: '2020-01-20' },
    { id: 'ATH-004', name: 'Phạm Thị Dung', dob: '2002-11-05', gender: 'Nữ', club: 'CLB VCT Đà Nẵng', province: 'Đà Nẵng', phone: '0934567890', email: 'dung@vct.vn', type: 'athlete', status: 'suspended', belt: 'Vàng', weight_class: '52kg', joined_date: '2021-09-10' },
    { id: 'COA-001', name: 'Võ Đại Hùng', dob: '1975-03-12', gender: 'Nam', club: 'CLB VCT Bình Định', province: 'Bình Định', phone: '0945678901', email: 'hung@vct.vn', type: 'coach', status: 'active', cert_level: 'Cấp Quốc gia', specialization: 'Đối kháng', joined_date: '2005-01-01' },
    { id: 'COA-002', name: 'Nguyễn Thị Lan', dob: '1980-07-25', gender: 'Nữ', club: 'CLB VCT TP.HCM', province: 'TP.HCM', phone: '0956789012', email: 'lan@vct.vn', type: 'coach', status: 'active', cert_level: 'Cấp Tỉnh', specialization: 'Quyền thuật', joined_date: '2010-04-15' },
    { id: 'REF-001', name: 'Trần Văn Minh', dob: '1978-09-08', gender: 'Nam', club: '-', province: 'TP.HCM', phone: '0967890123', email: 'minh@vct.vn', type: 'referee', status: 'active', cert_level: 'Trọng tài Quốc gia', specialization: 'Đối kháng', joined_date: '2008-02-01' },
    { id: 'REF-002', name: 'Lê Thị Ngọc', dob: '1985-04-18', gender: 'Nữ', club: '-', province: 'Hà Nội', phone: '0978901234', email: 'ngoc@vct.vn', type: 'referee', status: 'pending', cert_level: 'Trọng tài Tỉnh', specialization: 'Quyền thuật', joined_date: '2015-08-20' },
    { id: 'ATH-005', name: 'Hoàng Văn Phong', dob: '1998-12-30', gender: 'Nam', club: 'CLB VCT Huế', province: 'Thừa Thiên Huế', phone: '0989012345', email: 'phong@vct.vn', type: 'athlete', status: 'retired', belt: 'Đen Nhị Đẳng', weight_class: '75kg', joined_date: '2015-05-01' },
]



// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
export const Page_admin_people = () => {
    const [people, setPeople] = useState(MOCK_PEOPLE)
    const [tab, setTab] = useState<'athlete' | 'coach' | 'referee'>('athlete')
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [isLoading, setIsLoading] = useState(true)
    const [selected, setSelected] = useState<Person | null>(null)
    const [showApproveConfirm, setShowApproveConfirm] = useState<string | null>(null)
    const { toast, showToast, dismiss } = useAdminToast()

    React.useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const filtered = useMemo(() => {
        return people.filter(p => {
            const matchType = p.type === tab
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.club.toLowerCase().includes(search.toLowerCase())
            const matchStatus = filterStatus === 'all' || p.status === filterStatus
            return matchType && matchSearch && matchStatus
        })
    }, [people, tab, search, filterStatus])

    const countByType = (type: string) => people.filter(p => p.type === type).length
    const countPending = people.filter(p => p.status === 'pending').length

    const stats: StatItem[] = [
        { icon: <VCT_Icons.Users size={20} />, label: 'VĐV', value: countByType('athlete'), color: '#0ea5e9' },
        { icon: <VCT_Icons.Award size={20} />, label: 'HLV', value: countByType('coach'), color: '#10b981' },
        { icon: <VCT_Icons.Shield size={20} />, label: 'Trọng tài', value: countByType('referee'), color: '#8b5cf6' },
        { icon: <VCT_Icons.Clock size={20} />, label: 'Chờ duyệt', value: countPending, color: '#f59e0b' },
    ]

    const handleApprove = (id: string) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, status: 'active' as const } : p))
        setShowApproveConfirm(null)
        showToast('Đã duyệt hồ sơ thành công')
    }

    const handleSuspend = (id: string) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, status: 'suspended' as const } : p))
        showToast('Đã tạm ngưng hoạt động', 'info')
    }

    const handleReactivate = (id: string) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, status: 'active' as const } : p))
        showToast('Đã kích hoạt lại')
    }

    const tabItems = [
        { key: 'athlete', label: `VĐV (${countByType('athlete')})` },
        { key: 'coach', label: `HLV (${countByType('coach')})` },
        { key: 'referee', label: `Trọng tài (${countByType('referee')})` },
    ]

    return (
        <VCT_PageContainer size="wide" animated>
            <VCT_Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={dismiss} />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-(--vct-text-primary) flex items-center gap-3">
                    <VCT_Icons.Users size={28} className="text-[#0ea5e9]" /> Quản lý Nhân sự
                </h1>
                <p className="text-sm text-(--vct-text-secondary) mt-1">VĐV, Huấn luyện viên, và Trọng tài toàn hệ thống</p>
            </div>

            <VCT_StatRow items={stats} className="mb-6" />

            {/* ── Tabs ── */}
            <VCT_Tabs tabs={tabItems} activeTab={tab} onChange={v => setTab(v as typeof tab)} className="mb-6" />

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
                <VCT_SearchInput value={search} onChange={setSearch} placeholder={`Tìm ${tab === 'athlete' ? 'VĐV' : tab === 'coach' ? 'HLV' : 'trọng tài'}...`} className="flex-1 min-w-[220px]" />
                <VCT_Select value={filterStatus} onChange={setFilterStatus} options={[{ value: 'all', label: 'Tất cả trạng thái' }, ...Object.entries(STATUS_BADGE).map(([k, v]) => ({ value: k, label: v.label }))]} />
            </div>

            {/* ── Table ── */}
            <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl overflow-hidden mb-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-(--vct-border-subtle)">
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Họ tên</th>
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Mã</th>
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">{tab === 'athlete' ? 'CLB' : 'Chuyên môn'}</th>
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Tỉnh/TP</th>
                                <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">{tab === 'athlete' ? 'Đai' : 'Cấp chứng nhận'}</th>
                                <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Trạng thái</th>
                                <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? [...Array(5)].map((_, i) => <AdminSkeletonRow key={i} cols={7} />) : filtered.length === 0 ? (
                                <tr><td colSpan={7}><VCT_EmptyState icon={<VCT_Icons.Users size={40} />} title="Không tìm thấy" description="Thử thay đổi bộ lọc" /></td></tr>
                            ) : filtered.map(p => (
                                <tr key={p.id} className="border-b border-(--vct-border-subtle) hover:bg-(--vct-bg-base) cursor-pointer transition-colors" onClick={() => setSelected(p)}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <VCT_AvatarLetter name={p.name} size={36} />
                                            <div>
                                                <div className="font-bold text-(--vct-text-primary)">{p.name}</div>
                                                <div className="text-xs text-(--vct-text-tertiary)">{p.gender} · {p.dob}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-(--vct-text-tertiary)">{p.id}</td>
                                    <td className="p-4 text-(--vct-text-secondary)">{p.type === 'athlete' ? p.club : p.specialization}</td>
                                    <td className="p-4 text-(--vct-text-secondary)">{p.province}</td>
                                    <td className="p-4">
                                        {p.type === 'athlete' && p.belt ? (
                                            <VCT_Badge type={BELT_BADGE[p.belt] ?? 'neutral'} text={`${p.belt} · ${p.weight_class}`} />
                                        ) : (
                                            <span className="text-(--vct-text-secondary)">{p.cert_level ?? '-'}</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-center"><VCT_Badge type={STATUS_BADGE[p.status]?.type ?? 'neutral'} text={STATUS_BADGE[p.status]?.label ?? p.status} /></td>
                                    <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                        <VCT_Stack direction="row" gap={4} justify="center">
                                            {p.status === 'pending' && <VCT_Button size="sm" variant="ghost" onClick={() => setShowApproveConfirm(p.id)} icon={<VCT_Icons.CheckCircle size={14} />}>Duyệt</VCT_Button>}
                                            {p.status === 'active' && <VCT_Button size="sm" variant="ghost" onClick={() => handleSuspend(p.id)} icon={<VCT_Icons.Close size={14} />}>Ngưng</VCT_Button>}
                                            {p.status === 'suspended' && <VCT_Button size="sm" variant="ghost" onClick={() => handleReactivate(p.id)} icon={<VCT_Icons.Refresh size={14} />}>Kích hoạt</VCT_Button>}
                                        </VCT_Stack>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Detail Drawer ── */}
            <VCT_Drawer isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width={520}>
                {selected && (
                    <VCT_Stack gap={20}>
                        <div className="flex items-center gap-4">
                            <VCT_AvatarLetter name={selected.name} size={64} />
                            <div>
                                <div className="font-bold text-lg text-(--vct-text-primary)">{selected.name}</div>
                                <div className="text-sm text-(--vct-text-tertiary)">{selected.id} · {selected.gender} · {selected.dob}</div>
                                <div className="flex gap-2 mt-2">
                                    <VCT_Badge type={STATUS_BADGE[selected.status]?.type ?? 'neutral'} text={STATUS_BADGE[selected.status]?.label ?? selected.status} />
                                    {selected.belt && <VCT_Badge type={BELT_BADGE[selected.belt] ?? 'neutral'} text={selected.belt} />}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Liên hệ', value: `${selected.phone}\n${selected.email}` },
                                { label: 'CLB', value: selected.club },
                                { label: 'Tỉnh/TP', value: selected.province },
                                { label: 'Ngày tham gia', value: selected.joined_date },
                                ...(selected.type === 'athlete' ? [{ label: 'Hạng cân', value: selected.weight_class ?? '-' }] : []),
                                ...(selected.type !== 'athlete' ? [{ label: 'Chuyên môn', value: selected.specialization ?? '-' }, { label: 'Cấp chứng nhận', value: selected.cert_level ?? '-' }] : []),
                            ].map(item => (
                                <div key={item.label} className="p-3 bg-(--vct-bg-base) rounded-xl border border-(--vct-border-subtle)">
                                    <div className="text-[10px] uppercase tracking-wider text-(--vct-text-tertiary) font-bold mb-1">{item.label}</div>
                                    <div className="font-bold text-sm text-(--vct-text-primary) whitespace-pre-line">{item.value}</div>
                                </div>
                            ))}
                        </div>

                        <VCT_Stack direction="row" gap={8} className="pt-2 border-t border-(--vct-border-subtle)">
                            {selected.status === 'pending' && <VCT_Button variant="primary" onClick={() => { handleApprove(selected.id); setSelected(null) }} icon={<VCT_Icons.CheckCircle size={14} />}>Duyệt hồ sơ</VCT_Button>}
                            {selected.status === 'active' && <VCT_Button variant="ghost" onClick={() => { handleSuspend(selected.id); setSelected(null) }} icon={<VCT_Icons.Close size={14} />}>Tạm ngưng</VCT_Button>}
                            {selected.status === 'suspended' && <VCT_Button variant="primary" onClick={() => { handleReactivate(selected.id); setSelected(null) }} icon={<VCT_Icons.Refresh size={14} />}>Kích hoạt lại</VCT_Button>}
                        </VCT_Stack>
                    </VCT_Stack>
                )}
            </VCT_Drawer>

            <VCT_ConfirmDialog
                isOpen={!!showApproveConfirm}
                onClose={() => setShowApproveConfirm(null)}
                onConfirm={() => showApproveConfirm && handleApprove(showApproveConfirm)}
                title="Duyệt hồ sơ?"
                message="Xác nhận duyệt hồ sơ này? Người dùng sẽ được kích hoạt trong hệ thống."
                confirmLabel="Duyệt"
            />
        </VCT_PageContainer>
    )
}

'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import {
    VCT_Badge, VCT_Button, VCT_Stack, VCT_Toast,
    VCT_SearchInput, VCT_Select, VCT_EmptyState, VCT_Tabs,
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
interface FederationUnit {
    id: string; name: string; type: 'national' | 'provincial' | 'sub_association'
    province?: string; president: string; members: number
    clubs: number; athletes: number
    status: 'active' | 'pending' | 'suspended'
    established: string; phone: string; email: string
}

interface Personnel {
    id: string; name: string; role: string; department: string
    federation: string; status: 'active' | 'inactive'; phone: string
}

const STATUS_BADGE: Record<string, { label: string; type: string }> = {
    active: { label: 'Hoạt động', type: 'success' },
    pending: { label: 'Chờ duyệt', type: 'warning' },
    suspended: { label: 'Tạm ngưng', type: 'danger' },
    inactive: { label: 'Không hoạt động', type: 'neutral' },
}

const TYPE_BADGE: Record<string, { label: string; type: string }> = {
    national: { label: 'Quốc gia', type: 'danger' },
    provincial: { label: 'Tỉnh/TP', type: 'info' },
    sub_association: { label: 'Chi hội', type: 'success' },
}

const MOCK_UNITS: FederationUnit[] = [
    { id: 'FED-001', name: 'Liên đoàn Võ Cổ Truyền Việt Nam', type: 'national', president: 'Nguyễn Văn Quốc', members: 45, clubs: 320, athletes: 15000, status: 'active', established: '1991-01-15', phone: '028-38123456', email: 'info@vct.vn' },
    { id: 'FED-002', name: 'Liên đoàn VCT TP. Hồ Chí Minh', type: 'provincial', province: 'TP.HCM', president: 'Trần Minh Thắng', members: 12, clubs: 45, athletes: 2500, status: 'active', established: '1995-06-20', phone: '028-38234567', email: 'hcm@vct.vn' },
    { id: 'FED-003', name: 'Liên đoàn VCT Bình Định', type: 'provincial', province: 'Bình Định', president: 'Lê Đức Võ', members: 8, clubs: 30, athletes: 1800, status: 'active', established: '1993-03-10', phone: '0256-3823456', email: 'binhdinh@vct.vn' },
    { id: 'FED-004', name: 'Liên đoàn VCT Hà Nội', type: 'provincial', province: 'Hà Nội', president: 'Phạm Văn Hà', members: 10, clubs: 38, athletes: 2200, status: 'active', established: '1994-08-05', phone: '024-38345678', email: 'hanoi@vct.vn' },
    { id: 'FED-005', name: 'Liên đoàn VCT Đà Nẵng', type: 'provincial', province: 'Đà Nẵng', president: 'Ngô Thanh Hải', members: 6, clubs: 18, athletes: 900, status: 'pending', established: '2020-01-15', phone: '0236-3845678', email: 'danang@vct.vn' },
    { id: 'FED-006', name: 'Chi hội VCT Quận 1', type: 'sub_association', province: 'TP.HCM', president: 'Võ Minh Tuấn', members: 4, clubs: 8, athletes: 350, status: 'active', established: '2000-05-20', phone: '028-38456789', email: 'q1@vct-hcm.vn' },
]

const MOCK_PERSONNEL: Personnel[] = [
    { id: 'PER-001', name: 'Nguyễn Văn Quốc', role: 'Chủ tịch', department: 'Ban Chấp hành', federation: 'FED-001', status: 'active', phone: '0901111111' },
    { id: 'PER-002', name: 'Lê Thanh Sơn', role: 'Phó Chủ tịch', department: 'Ban Chấp hành', federation: 'FED-001', status: 'active', phone: '0902222222' },
    { id: 'PER-003', name: 'Trần Thị Hoa', role: 'Tổng Thư ký', department: 'Ban Thư ký', federation: 'FED-001', status: 'active', phone: '0903333333' },
    { id: 'PER-004', name: 'Phạm Đức Phong', role: 'Trưởng ban Chuyên môn', department: 'Ban Chuyên môn', federation: 'FED-001', status: 'active', phone: '0904444444' },
    { id: 'PER-005', name: 'Võ Thị Mai', role: 'Trưởng ban Tài chính', department: 'Ban Tài chính', federation: 'FED-001', status: 'active', phone: '0905555555' },
]



// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
export const Page_admin_federation = () => {
    const [tab, setTab] = useState<'units' | 'personnel'>('units')
    const [units, setUnits] = useState(MOCK_UNITS)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [isLoading, setIsLoading] = useState(true)
    const [selected, setSelected] = useState<FederationUnit | null>(null)
    const { toast, showToast, dismiss } = useAdminToast()

    React.useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const filtered = useMemo(() => {
        return units.filter(u => {
            const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.president.toLowerCase().includes(search.toLowerCase())
            const matchType = filterType === 'all' || u.type === filterType
            return matchSearch && matchType
        })
    }, [units, search, filterType])

    const totalAthletes = units.reduce((a, u) => a + u.athletes, 0)
    const totalClubs = units.reduce((a, u) => a + u.clubs, 0)

    const stats: StatItem[] = [
        { icon: <VCT_Icons.Building size={20} />, label: 'Tổ chức', value: units.length, color: '#0ea5e9' },
        { icon: <VCT_Icons.MapPin size={20} />, label: 'Liên đoàn tỉnh', value: units.filter(u => u.type === 'provincial').length, color: '#94a3b8' },
        { icon: <VCT_Icons.Users size={20} />, label: 'Tổng VĐV', value: totalAthletes.toLocaleString(), color: '#10b981' },
        { icon: <VCT_Icons.Home size={20} />, label: 'Tổng CLB', value: totalClubs, color: '#f59e0b' },
    ]

    const handleApprove = (id: string) => {
        setUnits(prev => prev.map(u => u.id === id ? { ...u, status: 'active' as const } : u))
        showToast('Đã duyệt tổ chức')
        setSelected(null)
    }

    const tabItems = [
        { value: 'units', label: `Tổ chức (${units.length})` },
        { value: 'personnel', label: `Nhân sự (${MOCK_PERSONNEL.length})` },
    ]

    return (
        <VCT_PageContainer size="wide" animated>
            <VCT_Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={dismiss} />

            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-(--vct-text-primary) flex items-center gap-3">
                    <VCT_Icons.Building size={28} className="text-[#8b5cf6]" /> Quản lý Liên đoàn
                </h1>
                <p className="text-sm text-(--vct-text-secondary) mt-1">Tổ chức, nhân sự, và cơ cấu Liên đoàn VCT các cấp</p>
            </div>

            <VCT_StatRow items={stats} className="mb-6" />
            <VCT_Tabs tabs={tabItems} activeTab={tab} onChange={v => setTab(v as typeof tab)} className="mb-6" />

            {tab === 'units' && (
                <>
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <VCT_SearchInput value={search} onChange={setSearch} placeholder="Tìm tổ chức..." className="flex-1 min-w-[220px]" />
                        <VCT_Select value={filterType} onChange={setFilterType} options={[{ value: 'all', label: 'Tất cả cấp' }, ...Object.entries(TYPE_BADGE).map(([k, v]) => ({ value: k, label: v.label }))]} />
                    </div>
                    <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-(--vct-border-subtle)">
                                        <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Tên</th>
                                        <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Cấp</th>
                                        <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Chủ tịch</th>
                                        <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">CLB</th>
                                        <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">VĐV</th>
                                        <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Trạng thái</th>
                                        <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? [...Array(5)].map((_, i) => <AdminSkeletonRow key={i} cols={7} />) : filtered.length === 0 ? (
                                        <tr><td colSpan={7}><VCT_EmptyState icon={<VCT_Icons.Building size={40} />} title="Không tìm thấy" /></td></tr>
                                    ) : filtered.map(u => (
                                        <tr key={u.id} className="border-b border-(--vct-border-subtle) hover:bg-(--vct-bg-base) cursor-pointer transition-colors" onClick={() => setSelected(u)}>
                                            <td className="p-4">
                                                <div className="font-bold text-(--vct-text-primary)">{u.name}</div>
                                                {u.province && <div className="text-xs text-(--vct-text-tertiary)">{u.province}</div>}
                                            </td>
                                            <td className="p-4"><VCT_Badge type={TYPE_BADGE[u.type]?.type} text={TYPE_BADGE[u.type]?.label} /></td>
                                            <td className="p-4 text-(--vct-text-secondary)">{u.president}</td>
                                            <td className="p-4 text-center font-bold text-(--vct-text-primary)">{u.clubs}</td>
                                            <td className="p-4 text-center font-bold text-(--vct-text-primary)">{u.athletes.toLocaleString()}</td>
                                            <td className="p-4 text-center"><VCT_Badge type={STATUS_BADGE[u.status]?.type} text={STATUS_BADGE[u.status]?.label} /></td>
                                            <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                                {u.status === 'pending' && <VCT_Button size="sm" variant="ghost" onClick={() => handleApprove(u.id)} icon={<VCT_Icons.CheckCircle size={14} />}>Duyệt</VCT_Button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {tab === 'personnel' && (
                <div className="bg-(--vct-bg-elevated) border border-(--vct-border-strong) rounded-2xl overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-(--vct-border-subtle)">
                                    <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Họ tên</th>
                                    <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Chức vụ</th>
                                    <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Ban</th>
                                    <th className="text-left p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">SĐT</th>
                                    <th className="text-center p-4 text-(--vct-text-tertiary) font-bold text-xs uppercase tracking-wider">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_PERSONNEL.map(p => (
                                    <tr key={p.id} className="border-b border-(--vct-border-subtle) hover:bg-(--vct-bg-base) transition-colors">
                                        <td className="p-4 font-bold text-(--vct-text-primary)">{p.name}</td>
                                        <td className="p-4 text-(--vct-text-secondary)">{p.role}</td>
                                        <td className="p-4 text-(--vct-text-secondary)">{p.department}</td>
                                        <td className="p-4 text-(--vct-text-tertiary)">{p.phone}</td>
                                        <td className="p-4 text-center"><VCT_Badge type={STATUS_BADGE[p.status]?.type} text={STATUS_BADGE[p.status]?.label} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Detail Drawer ── */}
            <VCT_Drawer isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''} width={520}>
                {selected && (
                    <VCT_Stack gap={20}>
                        <div className="flex items-center gap-3">
                            <VCT_Badge type={TYPE_BADGE[selected.type]?.type} text={TYPE_BADGE[selected.type]?.label} />
                            <VCT_Badge type={STATUS_BADGE[selected.status]?.type} text={STATUS_BADGE[selected.status]?.label} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Chủ tịch', value: selected.president },
                                { label: 'Thành lập', value: selected.established },
                                { label: 'CLB trực thuộc', value: String(selected.clubs) },
                                { label: 'VĐV', value: selected.athletes.toLocaleString() },
                                { label: 'Nhân sự', value: String(selected.members) },
                                { label: 'Liên hệ', value: `${selected.phone}\n${selected.email}` },
                            ].map(item => (
                                <div key={item.label} className="p-3 bg-(--vct-bg-base) rounded-xl border border-(--vct-border-subtle)">
                                    <div className="text-[10px] uppercase tracking-wider text-(--vct-text-tertiary) font-bold mb-1">{item.label}</div>
                                    <div className="font-bold text-sm text-(--vct-text-primary) whitespace-pre-line">{item.value}</div>
                                </div>
                            ))}
                        </div>
                        {selected.status === 'pending' && (
                            <VCT_Button variant="primary" onClick={() => handleApprove(selected.id)} icon={<VCT_Icons.CheckCircle size={14} />}>Duyệt tổ chức</VCT_Button>
                        )}
                    </VCT_Stack>
                )}
            </VCT_Drawer>
        </VCT_PageContainer>
    )
}

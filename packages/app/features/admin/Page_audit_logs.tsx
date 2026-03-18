'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import {
    VCT_Button, VCT_Stack, VCT_SearchInput, VCT_Badge, VCT_Select,
    VCT_Toast, VCT_PageContainer, VCT_StatRow
} from '../components/vct-ui'
import type { StatItem } from '../components/VCT_StatRow'
import { VCT_Icons } from '../components/vct-icons'
import { VCT_Drawer } from '../components/VCT_Drawer'
import { usePagination } from '../hooks/usePagination'
import { AdminPaginationBar } from './components/AdminPaginationBar'
import { AdminSkeletonRow } from './components/AdminSkeletonRow'
import { AdminErrorState } from './components/AdminErrorState'
import { useAdminToast } from './hooks/useAdminToast'
import { exportToCSV } from './utils/adminExport'

// ════════════════════════════════════════
// MOCK DATA — Expanded with more entries for date range demo
// ════════════════════════════════════════
const MOCK_LOGS = [
    { id: 'LOG-001', timestamp: '2024-03-09 00:32:15', user: 'admin@vct.vn', role: 'admin', action: 'UPDATE', resource: 'Tournament Config', detail: 'Cập nhật thông tin giải: Giải Vô địch QG 2024', ip: '192.168.1.100', severity: 'info' },
    { id: 'LOG-002', timestamp: '2024-03-09 00:28:40', user: 'btc@vct.vn', role: 'btc', action: 'APPROVE', resource: 'Athlete', detail: 'Phê duyệt hồ sơ VĐV #ATH-156 Nguyễn Văn A', ip: '10.0.0.55', severity: 'info' },
    { id: 'LOG-003', timestamp: '2024-03-09 00:25:12', user: 'system', role: 'system', action: 'BACKUP', resource: 'Database', detail: 'Backup tự động PostgreSQL - 2.3GB', ip: 'internal', severity: 'info' },
    { id: 'LOG-004', timestamp: '2024-03-09 00:20:05', user: 'referee@vct.vn', role: 'referee', action: 'LOGIN', resource: 'Auth', detail: 'Đăng nhập từ thiết bị mới', ip: '172.16.0.22', severity: 'warning' },
    { id: 'LOG-005', timestamp: '2024-03-09 00:15:30', user: 'admin@vct.vn', role: 'admin', action: 'CREATE', resource: 'Belt Exam', detail: 'Tạo kỳ thi thăng cấp đai Q2/2024', ip: '192.168.1.100', severity: 'info' },
    { id: 'LOG-006', timestamp: '2024-03-08 23:58:45', user: 'unknown', role: 'anonymous', action: 'LOGIN_FAILED', resource: 'Auth', detail: 'Đăng nhập thất bại 5 lần liên tiếp', ip: '45.67.89.12', severity: 'error' },
    { id: 'LOG-007', timestamp: '2024-03-08 23:45:10', user: 'admin@vct.vn', role: 'admin', action: 'DELETE', resource: 'User', detail: 'Xóa tài khoản test_user_01', ip: '192.168.1.100', severity: 'warning' },
    { id: 'LOG-008', timestamp: '2024-03-08 18:12:33', user: 'btc@vct.vn', role: 'btc', action: 'UPDATE', resource: 'Schedule', detail: 'Thay đổi lịch thi đấu vòng tứ kết', ip: '10.0.0.55', severity: 'info' },
    { id: 'LOG-009', timestamp: '2024-03-07 14:05:22', user: 'admin@vct.vn', role: 'admin', action: 'CREATE', resource: 'Tournament', detail: 'Tạo giải đấu: Cúp Vovinam Đông Nam Á 2024', ip: '192.168.1.100', severity: 'info' },
    { id: 'LOG-010', timestamp: '2024-03-07 09:30:11', user: 'system', role: 'system', action: 'MAINTENANCE', resource: 'Database', detail: 'Chạy VACUUM ANALYZE tự động', ip: 'internal', severity: 'info' },
    { id: 'LOG-011', timestamp: '2024-03-06 16:42:08', user: 'unknown', role: 'anonymous', action: 'LOGIN_FAILED', resource: 'Auth', detail: 'Brute force detected - IP blocked', ip: '103.56.78.90', severity: 'error' },
    { id: 'LOG-012', timestamp: '2024-03-05 11:15:44', user: 'coach@vct.vn', role: 'coach', action: 'UPDATE', resource: 'Athlete', detail: 'Cập nhật hồ sơ 12 VĐV đội tuyển TP.HCM', ip: '10.0.0.88', severity: 'info' },
]

const ACTION_OPTIONS = [
    { value: 'all', label: 'Tất cả hành động' },
    { value: 'CREATE', label: '➕ CREATE' },
    { value: 'UPDATE', label: '✏️ UPDATE' },
    { value: 'DELETE', label: '🗑️ DELETE' },
    { value: 'APPROVE', label: '✅ APPROVE' },
    { value: 'LOGIN', label: '🔑 LOGIN' },
    { value: 'LOGIN_FAILED', label: '🚫 LOGIN_FAILED' },
    { value: 'BACKUP', label: '💾 BACKUP' },
    { value: 'MAINTENANCE', label: '🔧 MAINTENANCE' },
]

const SEVERITY_MAP: Record<string, { badge: React.ReactNode }> = {
    info: { badge: <VCT_Badge type="info" text="INFO" /> },
    warning: { badge: <VCT_Badge type="warning" text="WARNING" /> },
    error: { badge: <VCT_Badge type="danger" text="ERROR" /> },
}

// Date range presets
const DATE_PRESETS = [
    { label: 'Hôm nay', days: 0 },
    { label: '24h', days: 1 },
    { label: '7 ngày', days: 7 },
    { label: '30 ngày', days: 30 },
    { label: 'Tất cả', days: -1 },
]

// ════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════
export const Page_audit_logs = () => {
    const [search, setSearch] = useState('')
    const [severityFilter, setSeverityFilter] = useState('all')
    const [actionFilter, setActionFilter] = useState('all')
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
    const [activePreset, setActivePreset] = useState('Tất cả')
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [drawerLog, setDrawerLog] = useState<typeof MOCK_LOGS[0] | null>(null)
    const { toast, showToast, dismiss } = useAdminToast()

    // Simulate initial loading
    React.useEffect(() => {
        const t = setTimeout(() => setIsLoading(false), 800)
        return () => clearTimeout(t)
    }, [])

    const handleDatePreset = (label: string, days: number) => {
        setActivePreset(label)
        if (days === -1) {
            setDateRange({ from: '', to: '' })
            return
        }
        const to = new Date()
        const from = new Date()
        from.setDate(from.getDate() - days)
        setDateRange({
            from: from.toISOString().slice(0, 10),
            to: to.toISOString().slice(0, 10),
        })
    }

    const handleRetry = () => {
        setHasError(false)
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 800)
    }

    const filtered = useMemo(() => {
        let v = MOCK_LOGS
        if (severityFilter !== 'all') v = v.filter(l => l.severity === severityFilter)
        if (actionFilter !== 'all') v = v.filter(l => l.action === actionFilter)
        if (dateRange.from) {
            v = v.filter(l => l.timestamp.slice(0, 10) >= dateRange.from)
        }
        if (dateRange.to) {
            v = v.filter(l => l.timestamp.slice(0, 10) <= dateRange.to)
        }
        if (search) {
            const q = search.toLowerCase()
            v = v.filter(l => l.user.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q) || l.resource.toLowerCase().includes(q))
        }
        return v
    }, [search, severityFilter, actionFilter, dateRange])

    const pagination = usePagination(filtered, { pageSize: 8 })

    const logStats = useMemo(() => ({
        total: filtered.length,
        info: filtered.filter(l => l.severity === 'info').length,
        warning: filtered.filter(l => l.severity === 'warning').length,
        error: filtered.filter(l => l.severity === 'error').length,
    }), [filtered])

    const clearAllFilters = () => {
        setSearch('')
        setSeverityFilter('all')
        setActionFilter('all')
        setDateRange({ from: '', to: '' })
        setActivePreset('Tất cả')
    }

    const hasActiveFilters = search || severityFilter !== 'all' || actionFilter !== 'all' || dateRange.from || dateRange.to

    return (
        <VCT_PageContainer size="wide" animated>
            <VCT_Toast isVisible={toast.show} message={toast.msg} type={toast.type} onClose={dismiss} />

            <div className="mb-6 flex flex-col sm:flex-row sm:flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-(--vct-text-primary)">Nhật Ký Hệ Thống</h1>
                    <p className="text-sm text-(--vct-text-secondary) mt-1">Theo dõi mọi hành động và thay đổi trong hệ thống.</p>
                </div>
                <VCT_Stack direction="row" gap={8} className="flex-wrap">
                    <VCT_Button variant="outline" icon={<VCT_Icons.Download size={16} />} onClick={() => {
                        exportToCSV({
                            headers: ['Mức độ', 'Thời gian', 'Người dùng', 'Role', 'Hành động', 'Tài nguyên', 'Chi tiết', 'IP'],
                            rows: filtered.map(l => [l.severity, l.timestamp, l.user, l.role, l.action, l.resource, l.detail, l.ip]),
                            filename: `vct_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`,
                        })
                        showToast(`Đã xuất ${filtered.length} nhật ký!`)
                    }}>Xuất CSV</VCT_Button>
                </VCT_Stack>
            </div>

            {/* ── KPI — reflects filtered data ── */}
            <VCT_StatRow items={[
                { label: 'Tổng logs', value: logStats.total, icon: <VCT_Icons.List size={18} />, color: '#8b5cf6' },
                { label: 'Info', value: logStats.info, icon: <VCT_Icons.Info size={18} />, color: '#0ea5e9' },
                { label: 'Warning', value: logStats.warning, icon: <VCT_Icons.AlertTriangle size={18} />, color: '#f59e0b' },
                { label: 'Error', value: logStats.error, icon: <VCT_Icons.Alert size={18} />, color: '#ef4444' },
            ] as StatItem[]} className="mb-6" />

            {/* ── DATE RANGE FILTER ── */}
            <div className="mb-4 p-4 bg-(--vct-bg-elevated) border border-(--vct-border-subtle) rounded-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-(--vct-text-tertiary) shrink-0">
                        <VCT_Icons.Calendar size={14} />
                        <span className="font-semibold uppercase tracking-wider">Khoảng thời gian</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {DATE_PRESETS.map(p => (
                            <button
                                key={p.label}
                                onClick={() => handleDatePreset(p.label, p.days)}
                                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                                    activePreset === p.label
                                        ? 'bg-(--vct-accent-blue,#3b82f6) text-white shadow-md'
                                        : 'bg-(--vct-bg-base) text-(--vct-text-secondary) hover:text-(--vct-text-primary) border border-(--vct-border-subtle)'
                                }`}
                            >{p.label}</button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <input
                            type="date"
                            aria-label="Từ ngày"
                            value={dateRange.from}
                            onChange={e => { setDateRange(d => ({ ...d, from: e.target.value })); setActivePreset('') }}
                            className="px-2 py-1.5 text-xs rounded-lg bg-(--vct-bg-base) border border-(--vct-border-subtle) text-(--vct-text-primary)"
                        />
                        <span className="text-xs text-(--vct-text-tertiary)">→</span>
                        <input
                            type="date"
                            aria-label="Đến ngày"
                            value={dateRange.to}
                            onChange={e => { setDateRange(d => ({ ...d, to: e.target.value })); setActivePreset('') }}
                            className="px-2 py-1.5 text-xs rounded-lg bg-(--vct-bg-base) border border-(--vct-border-subtle) text-(--vct-text-primary)"
                        />
                    </div>
                </div>
            </div>

            {/* ── FILTERS ── */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
                <div className="flex-1 min-w-[200px]">
                    <VCT_SearchInput placeholder="Tìm theo user, hành động, tài nguyên..." value={search} onChange={setSearch} onClear={() => setSearch('')} />
                </div>
                <VCT_Select
                    value={severityFilter}
                    onChange={setSeverityFilter}
                    options={[
                        { value: 'all', label: 'Tất cả mức độ' },
                        { value: 'info', label: 'ℹ️ Info' },
                        { value: 'warning', label: '⚠️ Warning' },
                        { value: 'error', label: '🔴 Error' },
                    ]}
                />
                <VCT_Select
                    value={actionFilter}
                    onChange={setActionFilter}
                    options={ACTION_OPTIONS}
                />
                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="px-3 py-1.5 text-xs rounded-lg bg-(--vct-bg-base) text-(--vct-accent-red,#ef4444) border border-(--vct-accent-red,#ef444430) hover:bg-[#ef444410] transition-colors font-semibold"
                    >✕ Xóa bộ lọc</button>
                )}
            </div>

            {/* ── TABLE ── */}
            {hasError ? (
                <AdminErrorState
                    message="Không thể tải nhật ký hệ thống"
                    detail="Vui lòng kiểm tra kết nối mạng và thử lại."
                    onRetry={handleRetry}
                />
            ) : (
                <div className="bg-(--vct-bg-card) border border-(--vct-border-strong) rounded-2xl overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-(--vct-bg-elevated) border-b border-(--vct-border-strong) text-[11px] uppercase tracking-wider text-(--vct-text-tertiary) font-bold">
                                <th className="p-4 w-20">Mức độ</th>
                                <th className="p-4 w-44">Thời gian</th>
                                <th className="p-4 w-36">Người dùng</th>
                                <th className="p-4 w-28">Hành động</th>
                                <th className="p-4">Chi tiết</th>
                                <th className="p-4 w-32">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-(--vct-border-subtle)">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => <AdminSkeletonRow key={i} cols={6} />)
                            ) : pagination.paginatedItems.length === 0 ? (
                                <tr><td colSpan={6} className="p-12 text-center text-(--vct-text-tertiary)">
                                    <div className="space-y-2">
                                        <VCT_Icons.Search size={32} className="mx-auto opacity-30" />
                                        <div>Không tìm thấy nhật ký nào</div>
                                        {hasActiveFilters && (
                                            <button onClick={clearAllFilters} className="text-xs text-(--vct-accent-cyan) hover:underline">
                                                Xóa bộ lọc để xem tất cả
                                            </button>
                                        )}
                                    </div>
                                </td></tr>
                            ) : (
                                pagination.paginatedItems.map(log => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors text-sm cursor-pointer" onClick={() => setDrawerLog(log)}>
                                        <td className="p-4">{SEVERITY_MAP[log.severity]?.badge}</td>
                                        <td className="p-4 font-mono text-[12px] text-(--vct-text-secondary)">{log.timestamp}</td>
                                        <td className="p-4">
                                            <span className="font-semibold text-(--vct-accent-cyan)">{log.user}</span>
                                            <div className="text-[10px] text-(--vct-text-tertiary)">{log.role}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-(--vct-bg-base) border border-(--vct-border-subtle) px-2 py-0.5 rounded text-[10px] font-bold text-(--vct-text-primary) uppercase">{log.action}</span>
                                        </td>
                                        <td className="p-4 text-(--vct-text-secondary)">
                                            <div className="line-clamp-1">{log.detail}</div>
                                            <div className="text-[10px] text-(--vct-text-tertiary) mt-0.5">Resource: {log.resource}</div>
                                        </td>
                                        <td className="p-4 font-mono text-[11px] text-(--vct-text-tertiary)">{log.ip}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {!isLoading && <AdminPaginationBar {...pagination} />}
                </div>
            )}

            {/* ── LOG DETAIL DRAWER ── */}
            <VCT_Drawer isOpen={!!drawerLog} onClose={() => setDrawerLog(null)} title="Chi tiết Nhật ký" width={520}>
                {drawerLog && (
                    <div className="space-y-5">
                        <div className="flex items-center gap-3 pb-4 border-b border-(--vct-border-subtle)">
                            {SEVERITY_MAP[drawerLog.severity]?.badge}
                            <span className="font-bold text-lg text-(--vct-text-primary) uppercase">{drawerLog.action}</span>
                            <span className="ml-auto font-mono text-xs text-(--vct-text-tertiary)">{drawerLog.id}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><div className="text-[10px] uppercase text-(--vct-text-tertiary) mb-1">Thời gian</div><div className="font-mono text-(--vct-text-primary)">{drawerLog.timestamp}</div></div>
                            <div><div className="text-[10px] uppercase text-(--vct-text-tertiary) mb-1">Người dùng</div><div className="font-semibold text-(--vct-accent-cyan)">{drawerLog.user}</div></div>
                            <div><div className="text-[10px] uppercase text-(--vct-text-tertiary) mb-1">Role</div><div className="text-(--vct-text-primary)">{drawerLog.role}</div></div>
                            <div><div className="text-[10px] uppercase text-(--vct-text-tertiary) mb-1">Tài nguyên</div><div className="text-(--vct-text-primary)">{drawerLog.resource}</div></div>
                            <div className="col-span-2"><div className="text-[10px] uppercase text-(--vct-text-tertiary) mb-1">Địa chỉ IP</div><div className="font-mono text-(--vct-text-primary)">{drawerLog.ip}</div></div>
                        </div>
                        <div><div className="text-[10px] uppercase text-(--vct-text-tertiary) mb-1">Chi tiết</div><div className="text-sm text-(--vct-text-primary) p-3 bg-(--vct-bg-base) rounded-xl border border-(--vct-border-subtle)">{drawerLog.detail}</div></div>
                        <div><div className="text-[10px] uppercase text-(--vct-text-tertiary) mb-2">User Agent</div><div className="text-xs font-mono text-(--vct-text-secondary) p-3 bg-(--vct-bg-base) rounded-xl border border-(--vct-border-subtle)">Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0</div></div>
                        <div><div className="text-[10px] uppercase text-(--vct-text-tertiary) mb-2">Request Payload</div><pre className="text-xs font-mono text-(--vct-text-secondary) p-3 bg-(--vct-bg-base) rounded-xl border border-(--vct-border-subtle) overflow-x-auto">{JSON.stringify({ action: drawerLog.action, resource: drawerLog.resource, timestamp: drawerLog.timestamp }, null, 2)}</pre></div>
                    </div>
                )}
            </VCT_Drawer>
        </VCT_PageContainer>
    )
}

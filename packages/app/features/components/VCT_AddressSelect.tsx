'use client'
import { useCallback, useMemo, useState } from 'react'
import {
    type AddressValue,
    type ProvinceInfo,
    type Ward,
    emptyAddress,
    useProvinces,
    useWards,
} from '../hooks/useDivisions'

interface VCTAddressSelectProps {
    /** Current value (controlled mode) */
    value?: AddressValue
    /** Called when address changes */
    onChange?: (value: AddressValue) => void
    /** Whether the component is disabled */
    disabled?: boolean
    /** CSS class for the container */
    className?: string
    /** Label displayed above the component */
    label?: string
}

/**
 * Cascading address selector for Vietnamese administrative divisions.
 * Step 1: Select Tỉnh/TP → Step 2: Select Xã/Phường
 *
 * @example
 * ```tsx
 * const [address, setAddress] = useState(emptyAddress)
 * <VCTAddressSelect value={address} onChange={setAddress} />
 * ```
 */
export function VCTAddressSelect({
    value,
    onChange,
    disabled = false,
    className = '',
    label = 'Địa chỉ hành chính',
}: VCTAddressSelectProps) {
    const [internalValue, setInternalValue] = useState<AddressValue>(emptyAddress)
    const currentValue = value ?? internalValue
    const setValue = useCallback(
        (v: AddressValue) => {
            if (onChange) onChange(v)
            else setInternalValue(v)
        },
        [onChange]
    )

    const [provinceSearch, setProvinceSearch] = useState('')
    const [wardSearch, setWardSearch] = useState('')

    const { provinces, isLoading: loadingProvinces } = useProvinces(
        provinceSearch.length >= 1 ? provinceSearch : undefined
    )
    const { wards, isLoading: loadingWards } = useWards(
        currentValue.provinceCode,
        wardSearch.length >= 1 ? wardSearch : undefined
    )

    const handleProvinceChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const code = parseInt(e.target.value, 10)
            if (isNaN(code)) {
                setValue(emptyAddress)
                setWardSearch('')
                return
            }
            const prov = provinces.find((p: ProvinceInfo) => p.code === code)
            setValue({
                provinceCode: code,
                provinceName: prov?.name ?? '',
                wardCode: null,
                wardName: '',
            })
            setWardSearch('')
        },
        [provinces, setValue]
    )

    const handleWardChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            const code = parseInt(e.target.value, 10)
            if (isNaN(code)) {
                setValue({
                    ...currentValue,
                    wardCode: null,
                    wardName: '',
                })
                return
            }
            const w = wards.find((ward: Ward) => ward.code === code)
            setValue({
                ...currentValue,
                wardCode: code,
                wardName: w?.name ?? '',
            })
        },
        [wards, currentValue, setValue]
    )

    const filteredProvinces = useMemo(() => {
        if (!provinceSearch) return provinces
        return provinces
    }, [provinces, provinceSearch])

    return (
        <div className={`${className}`}>
            {label && (
                <label className="block text-sm font-medium mb-2 text-(--vct-text-secondary)">
                    {label}
                </label>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Province Select */}
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="vct-province-select"
                        className="text-xs text-(--vct-text-muted)"
                    >
                        Tỉnh / Thành phố
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm tỉnh/TP..."
                            value={provinceSearch}
                            onChange={(e) => setProvinceSearch(e.target.value)}
                            disabled={disabled}
                            className="w-full px-3 py-1.5 text-xs rounded-t-lg border border-b-0 border-(--vct-border) bg-(--vct-bg-secondary) text-(--vct-text-primary) placeholder:text-(--vct-text-muted) focus:outline-none focus:ring-1 focus:ring-(--vct-accent)"
                        />
                        <select
                            id="vct-province-select"
                            value={currentValue.provinceCode ?? ''}
                            onChange={handleProvinceChange}
                            disabled={disabled || loadingProvinces}
                            className="w-full px-3 py-2 text-sm rounded-b-lg border border-(--vct-border) bg-(--vct-bg-secondary) text-(--vct-text-primary) focus:outline-none focus:ring-2 focus:ring-(--vct-accent) disabled:opacity-50 cursor-pointer"
                        >
                            <option value="">
                                {loadingProvinces
                                    ? 'Đang tải...'
                                    : `-- Chọn tỉnh/TP (${filteredProvinces.length}) --`}
                            </option>
                            {filteredProvinces.map((p: ProvinceInfo) => (
                                <option key={p.code} value={p.code}>
                                    {p.name} ({p.ward_count} xã/phường)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Ward Select */}
                <div className="flex flex-col gap-1">
                    <label
                        htmlFor="vct-ward-select"
                        className="text-xs text-(--vct-text-muted)"
                    >
                        Xã / Phường / Thị trấn
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm xã/phường..."
                            value={wardSearch}
                            onChange={(e) => setWardSearch(e.target.value)}
                            disabled={disabled || !currentValue.provinceCode}
                            className="w-full px-3 py-1.5 text-xs rounded-t-lg border border-b-0 border-(--vct-border) bg-(--vct-bg-secondary) text-(--vct-text-primary) placeholder:text-(--vct-text-muted) focus:outline-none focus:ring-1 focus:ring-(--vct-accent) disabled:opacity-50"
                        />
                        <select
                            id="vct-ward-select"
                            value={currentValue.wardCode ?? ''}
                            onChange={handleWardChange}
                            disabled={
                                disabled ||
                                !currentValue.provinceCode ||
                                loadingWards
                            }
                            className="w-full px-3 py-2 text-sm rounded-b-lg border border-(--vct-border) bg-(--vct-bg-secondary) text-(--vct-text-primary) focus:outline-none focus:ring-2 focus:ring-(--vct-accent) disabled:opacity-50 cursor-pointer"
                        >
                            <option value="">
                                {!currentValue.provinceCode
                                    ? '-- Chọn tỉnh/TP trước --'
                                    : loadingWards
                                      ? 'Đang tải...'
                                      : `-- Chọn xã/phường (${wards.length}) --`}
                            </option>
                            {wards.map((w: Ward) => (
                                <option key={w.code} value={w.code}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Selected address display */}
            {currentValue.provinceCode && (
                <div className="mt-2 px-3 py-1.5 rounded-lg bg-(--vct-bg-tertiary) text-xs text-(--vct-text-secondary)">
                    📍 {currentValue.wardName ? `${currentValue.wardName}, ` : ''}
                    {currentValue.provinceName}
                </div>
            )}
        </div>
    )
}

export { emptyAddress }
export type { AddressValue }

'use client'

import * as React from 'react'

interface AdminSkeletonRowProps {
    cols?: number
}

/**
 * Skeleton loading row for admin tables.
 * Renders animated placeholder cells matching column count.
 */
export const AdminSkeletonRow: React.FC<AdminSkeletonRowProps> = ({ cols = 6 }) => {
    // Pre-computed widths to avoid Math.random() on each render
    const widths = React.useMemo(
        () => Array.from({ length: cols }, () => `${50 + Math.floor(Math.random() * 50)}%`),
        [cols]
    )

    return (
        <tr>
            {widths.map((w, i) => (
                <td key={i} className="p-4">
                    <div
                        className="h-4 bg-(--vct-bg-elevated) rounded animate-pulse"
                        style={{ width: w }}
                    />
                </td>
            ))}
        </tr>
    )
}

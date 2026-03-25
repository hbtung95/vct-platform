import React from 'react'

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    interactive?: boolean
}

/**
 * Lõi Glassmorphism Component tái sử dụng cho toàn bộ VCT Platform.
 * Đảm bảo đồng bộ Giao diện Bóng kính (Glass) theo chuẩn Tailwind v4.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ children, className = '', interactive = false, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`
                    relative overflow-hidden rounded-2xl
                    border border-vct-border/40 
                    bg-white/80 backdrop-blur-xl
                    transition-all duration-300 ease-out
                    dark:border-white/10 dark:bg-white/5
                    ${
                        interactive
                            ? 'hover:-translate-y-1 hover:border-vct-accent/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]'
                            : ''
                    }
                    ${className}
                `}
                {...props}
            >
                {children}
            </div>
        )
    }
)

GlassCard.displayName = 'GlassCard'

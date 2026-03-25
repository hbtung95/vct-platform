'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function PortalBackground() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Dark mode friendly base glow */}
            <div className="absolute inset-0 bg-(--vct-bg-base) opacity-50 transition-colors duration-500" />
            
            {/* Colorful Orbs */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="absolute -top-[20%] -left-[10%] h-[60vh] w-[60vh] rounded-full bg-linear-to-br from-blue-600/20 to-cyan-500/10 blur-[120px]" 
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
                className="absolute top-[30%] -right-[15%] h-[50vh] w-[50vh] rounded-full bg-blue-500/15 blur-[120px]" 
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
                className="absolute -bottom-[20%] left-[20%] h-[70vh] w-[70vh] rounded-full bg-indigo-500/10 blur-[150px]" 
            />
        </div>
    )
}

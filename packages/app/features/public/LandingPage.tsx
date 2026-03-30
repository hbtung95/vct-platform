'use client'

import React, { useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { VCT_Icons, UI_Logo } from '@vct/ui'
import { useI18n } from '../i18n'
import Link from 'next/link'

/**
 * VCT PLATFORM — Strategic Landing Page (Phase 2)
 * Six Semantic Layers:
 * 1. VOID (Hero)
 * 2. PROOF BAR (Stats)
 * 3. PERSONA GATEWAY (Roles)
 * 4. HERITAGE STRIP (Tradition)
 * 5. SOCIAL TRUST (Partners)
 * 6. FINAL HOOK & CONTACT
 */

export default function LandingPage() {
  const { t } = useI18n()
  const { scrollYProgress } = useScroll()
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])

  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div className="bg-[#020617] text-slate-100 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* ── LAYER 1: VOID (Hero Section) ── */}
      <section className="relative h-screen flex items-center justify-center px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        </div>

        <motion.div 
            style={{ opacity, scale }}
            className="relative z-10 text-center max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-6 tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Next Gen Platform
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-tight">
              {t('home.hero.title')}
              <span className="block text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
                Phase 2 Launch
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/login" className="px-8 py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-lg hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20">
                {t('home.hero.cta')}
              </Link>
              <Link href="/register" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all">
                {t('auth.registerLink')}
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black tracking-widest uppercase">Scroll</span>
          <div className="w-px h-12 bg-linear-to-b from-emerald-500 to-transparent" />
        </motion.div>
      </section>

      {/* ── LAYER 2: PROOF BAR (Stats) ── */}
      <section className="bg-slate-900/50 border-y border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: t('home.proof.federations'), value: '63+', color: 'text-emerald-400' },
              { label: t('home.proof.clubs'), value: '1.2k+', color: 'text-cyan-400' },
              { label: t('home.proof.athletes'), value: '50k+', color: 'text-emerald-400' },
              { label: 'Uptime', value: '99.9%', color: 'text-cyan-400' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className={`text-4xl md:text-5xl font-black mb-2 tracking-tighter ${stat.color} group-hover:scale-110 transition-transform`}>
                  {stat.value}
                </div>
                <div className="text-xs uppercase tracking-[0.2em] font-bold text-slate-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LAYER 3: PERSONA GATEWAY (Roles) ── */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Tailored Experience</h2>
            <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: t('home.persona.athlete'), 
                desc: t('home.persona.athlete.desc'), 
                icon: <VCT_Icons.User size={32} />, 
                btn: 'Login as Athlete',
                color: 'emerald'
              },
              { 
                title: t('home.persona.coach'), 
                desc: t('home.persona.coach.desc'), 
                icon: <VCT_Icons.Book size={32} />, 
                btn: 'Login as Coach',
                color: 'cyan'
              },
              { 
                title: t('home.persona.org'), 
                desc: t('home.persona.org.desc'), 
                icon: <VCT_Icons.Shield size={32} />, 
                btn: 'Federation Portal',
                color: 'indigo'
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-3xl bg-slate-900 border border-white/5 hover:border-emerald-500/30 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                  {item.icon}
                </div>
                <div className="p-3 rounded-2xl bg-white/5 inline-block mb-6 text-emerald-400">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-black mb-3">{item.title}</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  {item.desc}
                </p>
                <Link href="/login" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald-400 group-hover:translate-x-2 transition-transform">
                  {item.btn} <VCT_Icons.ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LAYER 4: HERITAGE STRIP (Tradition) ── */}
      <section className="py-32 bg-slate-900/30 overflow-hidden relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[20vw] font-black text-white/5 select-none pointer-events-none whitespace-nowrap">
          HERITAGE — VO CO TRUYEN — DI SAN
        </div>
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-slate-800 border border-white/10 group">
              <div className="absolute inset-0 bg-linear-to-t from-slate-950 to-transparent z-10" />
              <div className="relative z-20 h-full flex flex-col justify-end p-10">
                <div className="text-emerald-400 font-mono text-sm mb-2">Established Tradition</div>
                <h3 className="text-3xl font-black text-white">{t('home.heritage.title')}</h3>
              </div>
              {/* Image Placeholder */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700 opacity-60" />
            </div>
          </div>
          <div className="max-w-md">
            <div className="text-emerald-400 text-sm font-black uppercase tracking-widest mb-4">The core mission</div>
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
              Honoring centuries of <span className="text-emerald-500">martial wisdom.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10">
              {t('home.heritage.desc')}
            </p>
            <Link href="/public/heritage" className="inline-flex items-center gap-3 text-lg font-bold hover:gap-5 transition-all">
              Learn about VCT <VCT_Icons.ArrowRight size={20} className="text-emerald-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── LAYER 5: SOCIAL TRUST (Partners) ── */}
      <section className="py-24 border-y border-white/5">
        <div className="text-center mb-12 text-slate-500 text-xs font-black uppercase tracking-[0.4em]">
          {t('home.trust.title')}
        </div>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all">
          {/* Partner Placeholders */}
          {['WVVF', 'LĐ Vovinam VN', 'LĐ Võ Tổng Hợp', 'NSE Việt Nam', 'Hòa Phát'].map((p, i) => (
            <div key={i} className="text-2xl font-black text-white italic tracking-tighter">
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* ── LAYER 6: FINAL HOOK & CONTACT ── */}
      <section id="contact" className="py-32 px-6 bg-linear-to-b from-transparent to-emerald-950/20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <h2 className="text-5xl font-black mb-6 leading-tight">{t('home.hook.title')}</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-sm">
              {t('home.hook.desc')}
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <VCT_Icons.Mail size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Support</div>
                  <div className="font-bold">hi@vct.vn</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <VCT_Icons.Phone size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">hotline</div>
                  <div className="font-bold">1900 6789</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1" />

          <div className="lg:col-span-6">
            <div className="p-8 md:p-12 rounded-[2rem] bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-emerald-500 to-cyan-500" />
                
                <h3 className="text-2xl font-black mb-8">{t('home.contact.title')}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('home.contact.name')}</label>
                      <input 
                        required
                        value={form.name}
                        onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition"
                        placeholder="Nguyễn Văn A" 
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('home.contact.email')}</label>
                       <input 
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition"
                        placeholder="name@company.com" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{t('home.contact.message')}</label>
                    <textarea 
                        required
                        rows={4}
                        value={form.message}
                        onChange={e => setForm({...form, message: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition resize-none"
                        placeholder="..." 
                    />
                  </div>
                  
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-2xl bg-emerald-500 text-slate-950 font-black tracking-widest uppercase hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
                  >
                    {t('home.contact.submit')}
                    <VCT_Icons.ArrowUpRight size={18} />
                  </motion.button>

                  <AnimatePresence>
                    {submitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold text-center"
                      >
                         {t('home.contact.success')}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Minimal */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <UI_Logo size={24} />
          <span className="font-black text-sm tracking-tighter">VCT PLATFORM</span>
        </div>
        <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">
          © 2026 VCT Ecosystem. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

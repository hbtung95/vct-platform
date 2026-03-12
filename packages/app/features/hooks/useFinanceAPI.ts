'use client'

import { useApiQuery, useApiMutation } from './useApiQuery'

// ═══════════════════════════════════════════════════════════════
// VCT PLATFORM — FINANCE API HOOKS
// Typed React hooks for transactions, invoices, budgets, fees, sponsorships.
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface Transaction {
    id: string; date: string; description: string; amount: number
    type: 'income' | 'expense'; status: 'completed' | 'pending' | 'cancelled'
    source?: string; reference_code?: string; category?: string
    created_at?: string
}

export interface Invoice {
    id: string; number?: string; title: string; amount: number
    due_date?: string; status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
    recipient_name?: string; recipient_email?: string
    items?: InvoiceItem[]; created_at?: string
}

export interface InvoiceItem {
    description: string; quantity: number; unit_price: number; amount: number
}

export interface Budget {
    id: string; name: string; fiscal_year: string; total_amount: number
    spent_amount: number; remaining_amount: number
    categories?: BudgetCategory[]; status?: string
}

export interface BudgetCategory {
    name: string; allocated: number; spent: number
}

export interface FeeSchedule {
    id: string; name: string; type: string; amount: number
    frequency?: string; due_date?: string; status?: string
    applicable_to?: string
}

export interface Sponsorship {
    id: string; sponsor_name: string; amount: number
    start_date: string; end_date?: string; status: 'active' | 'pending' | 'expired'
    contact_person?: string; contact_email?: string; notes?: string
}

export interface Payment {
    invoice_id: string; amount: number; method: string
    reference_code?: string; proof_url?: string
}

// ── Query Hooks ──────────────────────────────────────────────

export function useTransactions(params?: { type?: string; search?: string }) {
    const qs = new URLSearchParams()
    if (params?.type) qs.set('type', params.type)
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return useApiQuery<Transaction[]>(`/api/v1/transactions/${query ? '?' + query : ''}`)
}

export function useInvoices() {
    return useApiQuery<Invoice[]>('/api/v1/finance/invoices')
}

export function useInvoice(id: string) {
    return useApiQuery<Invoice>(`/api/v1/finance/invoices/${id}`, { enabled: !!id })
}

export function useBudgets() {
    return useApiQuery<Budget[]>('/api/v1/finance/budgets')
}

export function useFeeSchedules() {
    return useApiQuery<FeeSchedule[]>('/api/v1/finance/fee-schedules')
}

export function useSponsorships() {
    return useApiQuery<Sponsorship[]>('/api/v1/finance/sponsorships/')
}

// ── Mutation Hooks ───────────────────────────────────────────

export function useCreateInvoice() {
    return useApiMutation<Partial<Invoice>, Invoice>('POST', '/api/v1/finance/invoices')
}

export function useRecordPayment() {
    return useApiMutation<Payment, { status: string }>('POST', '/api/v1/finance/payments')
}

export function useCreateSponsorship() {
    return useApiMutation<Partial<Sponsorship>, Sponsorship>('POST', '/api/v1/finance/sponsorships')
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SAMPLE_ASSESSMENTS } from '../data/sampleData.js'

const genId = () => `hira-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

export const useStore = create(
  persist(
    (set, get) => ({
      assessments: SAMPLE_ASSESSMENTS,
      currentPage: 'dashboard',
      editingId:   null,
      toast:       null,

      // ── Navigation ──────────────────────────────────────────
      setPage: (page) => set({ currentPage: page, editingId: null }),

      startEdit: (id) => set({ editingId: id, currentPage: 'assessment' }),

      startNew: () => set({ editingId: null, currentPage: 'assessment' }),

      // ── CRUD ────────────────────────────────────────────────
      addAssessment: (data) => {
        const a = { ...data, id: genId() }
        set((s) => ({ assessments: [a, ...s.assessments] }))
        get().showToast('Assessment saved to risk register.', 'success')
        set({ currentPage: 'register', editingId: null })
      },

      updateAssessment: (id, data) => {
        set((s) => ({
          assessments: s.assessments.map((a) => (a.id === id ? { ...a, ...data } : a)),
          editingId:   null,
          currentPage: 'register',
        }))
        get().showToast('Assessment updated successfully.', 'success')
      },

      deleteAssessment: (id) => {
        set((s) => ({ assessments: s.assessments.filter((a) => a.id !== id) }))
        get().showToast('Assessment deleted.', 'info')
      },

      updateStatus: (id, status) => {
        set((s) => ({
          assessments: s.assessments.map((a) => (a.id === id ? { ...a, status } : a)),
        }))
        get().showToast(`Status updated to "${status}".`, 'success')
      },

      duplicateAssessment: (id) => {
        const original = get().assessments.find((a) => a.id === id)
        if (!original) return
        const copy = { ...original, id: genId(), status: 'Open', date: '' }
        set((s) => ({ assessments: [copy, ...s.assessments] }))
        get().showToast('Assessment duplicated.', 'success')
      },

      // ── Toast ────────────────────────────────────────────────
      showToast: (message, type = 'info') => {
        const id = Date.now()
        set({ toast: { message, type, id } })
        setTimeout(() => {
          set((s) => (s.toast?.id === id ? { toast: null } : s))
        }, 3500)
      },

      dismissToast: () => set({ toast: null }),
    }),
    {
      name: 'hira-store-v2',
    }
  )
)

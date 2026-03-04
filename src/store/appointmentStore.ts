import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CalendarViewType = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'

interface AppointmentState {
    selectedDate: Date | null
    selectedDoctor: string | null
    calendarView: CalendarViewType
    setSelectedDate: (date: Date) => void
    setSelectedDoctor: (doctorId: string | null) => void
    setCalendarView: (view: CalendarViewType) => void
}

export const useAppointmentStore = create<AppointmentState>()(
    persist(
        (set) => ({
            selectedDate: new Date(),
            selectedDoctor: null,
            calendarView: 'timeGridWeek',
            setSelectedDate: (date) => set({ selectedDate: date }),
            setSelectedDoctor: (doctorId) => set({ selectedDoctor: doctorId }),
            setCalendarView: (view) => set({ calendarView: view }),
        }),
        {
            name: 'appointment-storage',
            partialize: (state) => ({
                ...state,
                selectedDate: state.selectedDate ? state.selectedDate.toISOString() : null
            } as any),
            merge: (persistedState: any, currentState) => {
                return {
                    ...currentState,
                    ...persistedState,
                    selectedDate: persistedState.selectedDate ? new Date(persistedState.selectedDate) : null
                }
            }
        }
    )
)

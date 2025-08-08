import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookingData {
  hostId: string;
  hostName: string;
  selectedDate: string;
  selectedTime: string;
  selectedDuration: {
    duration: number;
    price: number;
  };
  selectedServices: {
    screenSharing: boolean;
    translation: boolean;
    recording: boolean;
    transcription: boolean;
  };
}

export interface BookingSessionState {
  session: {
    sessionId: string;
    expiresAt: string;
    bookingData: BookingData;
  } | null;
  setSession: (session: BookingSessionState['session']) => void;
  clearSession: () => void;
}

export const useBookingSessionStore = create<BookingSessionState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'booking-session',
    }
  )
);

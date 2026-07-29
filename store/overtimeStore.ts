import { create } from 'zustand';

interface OvertimeStore {
  shouldOpenModal: boolean;
  triggerModal: () => void;
  clearModalTrigger: () => void;
}

export const useOvertimeStore = create<OvertimeStore>((set) => ({
  shouldOpenModal: false,
  triggerModal: () => set({ shouldOpenModal: true }),
  clearModalTrigger: () => set({ shouldOpenModal: false }),
}));
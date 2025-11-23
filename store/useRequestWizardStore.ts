"use client";

import { create } from "zustand";

/**
 * 稟議ウィザード　ストア
 */
export type RequestWizardState = {
  step: number;
  maxStep: number;
  requestId?: string;
  title: string;
  type: string;
  typeId: string;
  jsonData: Record<string, any>;
  approverIds: string[];

  setField: (patch: Partial<Omit<RequestWizardState, "setField" | "next" | "prev" | "reset" | "setFromExisting">>) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  setFromExisting: (data: {
    requestId?: string;
    title: string;
    type: string;
    typeId: string;
    jsonData?: Record<string, any>;
    approverIds: string[];
  }) => void;
};

export const useRequestWizardStore = create<RequestWizardState>((set) => ({
  step: 1,
  maxStep: 3,
  title: "",
  type: "",
  typeId: "",
  jsonData: {},
  approverIds: [],

  setField: (patch) => set((state) => ({ ...state, ...patch })),
  next: () => set((state) => ({ ...state, step: Math.min(state.step + 1, state.maxStep) })),
  prev: () => set((state) => ({ ...state, step: Math.max(state.step - 1, 1) })),
  reset: () =>
    set({
      step: 1,
      maxStep: 3,
      requestId: undefined,
      title: "",
      type: "",
      typeId: "",
      jsonData: {},
      approverIds: [],
    }),
  setFromExisting: (data) =>
    set({
      step: 1,
      maxStep: 3,
      requestId: data.requestId,
      title: data.title,
      type: data.type,
      typeId: data.typeId,
      jsonData: data.jsonData ?? {},
      approverIds: data.approverIds,
    }),
}));

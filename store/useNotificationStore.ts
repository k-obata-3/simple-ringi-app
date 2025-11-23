"use client";

import { create } from "zustand";

export type NotificationItem = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

type NotificationState = {
  items: NotificationItem[];
  push: (item: Omit<NotificationItem, "id">) => void;
  remove: (id: string) => void;
};

/**
 * 通知（トースト）ストア
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  push: (item) =>
    set((state) => ({
      items: [
        ...state.items,
        { ...item, id: crypto.randomUUID() },
      ],
    })),
  remove: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    })),
}));

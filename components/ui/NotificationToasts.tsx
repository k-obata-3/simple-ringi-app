"use client";

import { useNotificationStore } from "@/store/useNotificationStore";
import { Toast, ToastContainer } from "react-bootstrap";

/**
 * 通知表示用コンポーネント
 * @returns 
 */
export const NotificationToasts = () => {
  const { items, remove } = useNotificationStore();
  return (
    <ToastContainer position="top-end" className="p-3">
      {items.map((item) => (
        <Toast
          key={item.id}
          onClose={() => remove(item.id)}
          bg={item.type === "error" ? "danger" : item.type === "success" ? "success" : "secondary"}
          autohide
          delay={3000}
        >
          <Toast.Body className="text-white">{item.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

"use client";

import { useState } from "react";
import { Modal, Button, Form, } from "react-bootstrap";
import { useNotificationStore } from "@/store/useNotificationStore";

export default function UserEditModal({
  user,
  onClose,
  onSaved,
}: {
  user: any;
  onClose: () => void;
  onSaved: (u: any) => void;
}) {
  const editing = !!user.id;
  const push = useNotificationStore((s) => s.push);

  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [role, setRole] = useState(user.role ?? "EMPLOYEE");
  const [password, setPassword] = useState("");

  const handleSave = async () => {
    const body = {
      id: user.id,
      name,
      email,
      role,
      password: password || undefined,
    };

    const res = await fetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!data.ok) {
      push({ type: "error", message: data.error?.message ?? "保存に失敗しました" });
      return;
    }

    push({ type: "success", message: "保存しました" });
    onSaved(data.data.user);
  };

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editing ? "ユーザ編集" : "新規ユーザ登録"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>名前</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>メール</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>ロール</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="ADMIN">管理者</option>
              <option value="EMPLOYEE">社員</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>パスワード{editing && "（変更時のみ）"}</Form.Label>
            <Form.Control
              type="password"
              value={password}
              placeholder={editing ? "変更する場合のみ入力" : ""}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          キャンセル
        </Button>
        <Button onClick={handleSave}>保存</Button>
      </Modal.Footer>
    </Modal>
  );
}

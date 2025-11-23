"use client";

import { useState } from "react";
import { Button, Card, Table, Row, Col, Badge } from "react-bootstrap";
import { useNotificationStore } from "@/store/useNotificationStore";
import UserEditModal from "./_UserEditModal";

export default function UserListPageClient({ users }: { users: any[] }) {
  const push = useNotificationStore((s) => s.push);
  const [list, setList] = useState(users);
  const [editing, setEditing] = useState<any | null>(null);

  const toggleActive = async (user: any) => {
    const res = await fetch("/api/admin/users/toggle-active", {
      method: "POST",
      body: JSON.stringify({ id: user.id, active: !user.isActive }),
    });
    const data = await res.json();
    if (!data.ok) return push({ type: "error", message: "更新に失敗しました" });

    setList((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u))
    );
    push({ type: "success", message: "更新しました" });
  };

  return (
    <div>
      <Row className="mb-3">
        <Col>
          <h3>ユーザ管理</h3>
        </Col>
        <Col className="text-end">
          <Button onClick={() => setEditing({})}>新規登録</Button>
        </Col>
      </Row>

      <Card>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>名前</th>
                <th>メール</th>
                <th>ロール</th>
                <th>状態</th>
                <th>作成日</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.role === "ADMIN" ? "管理者": u.role === "EMPLOYEE" ? "社員" : u.role}
                  </td>
                  <td>
                    {u.isActive ? (
                      <Badge bg="success">有効</Badge>
                    ) : (
                      <Badge bg="secondary">無効</Badge>
                    )}
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString("ja-JP")}</td>
                  <td className="text-end">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="me-2"
                      onClick={() => setEditing(u)}
                    >
                      編集
                    </Button>
                    <Button
                      size="sm"
                      variant={u.isActive ? "outline-danger" : "outline-success"}
                      onClick={() => toggleActive(u)}
                    >
                      {u.isActive ? "無効化" : "有効化"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {editing && (
        <UserEditModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setEditing(null);
            if (updated.id) {
              setList((prev) =>
                prev.map((u) => (u.id === updated.id ? updated : u))
              );
            } else {
              setList((prev) => [updated, ...prev]);
            }
          }}
        />
      )}
    </div>
  );
}

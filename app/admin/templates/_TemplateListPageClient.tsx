"use client";

import { useNotificationStore } from "@/store/useNotificationStore";
import { useState } from "react";
import { Button, Card, Table, Row, Col, Badge } from "react-bootstrap";
import TemplateEditModal from "./_TemplateEditModal";

export default function TemplateListPageClient({ templates }: { templates: any[] }) {
  const push = useNotificationStore((s) => s.push);
  const [list, setList] = useState(templates);
  const [editing, setEditing] = useState<any | null>(null);

  const toggleActive = async (template: any) => {
    // TODO: API呼び出し
    setList((prev) =>
      prev.map((t) => (t.id === template.id ? { ...t, isActive: !t.isActive } : t))
    );
    push({ type: "success", message: "更新しました" });
  };

  return (
    <div>
      <Row className="mb-3">
        <Col>
          <h3>稟議テンプレート管理</h3>
          <span className="text-danger">※登録/更新/削除機能は未実装です。</span>
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
                <th>テンプレート名</th>
                <th>項目数</th>
                <th>状態</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => {
                const fields = JSON.parse(t.fields);
                return (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{fields.length}</td>
                    <td>
                      {t.isActive ? (
                        <Badge bg="success">有効</Badge>
                      ) : (
                        <Badge bg="secondary">無効</Badge>
                      )}
                    </td>
                    <td className="text-end">
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => setEditing(t)}
                      >
                        編集
                      </Button>
                      <Button
                        size="sm"
                        variant={t.isActive ? "outline-danger" : "outline-success"}
                        onClick={() => toggleActive(t)}
                      >
                        {t.isActive ? "無効化" : "有効化"}
                      </Button>
                    </td>
                  </tr>
                )

              })}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {editing && (
        <TemplateEditModal
          template={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setEditing(null);
            if (updated.id) {
              setList((prev) =>
                prev.map((t) => (t.id === updated.id ? updated : t))
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

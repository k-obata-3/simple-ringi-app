"use client";

import { useNotificationStore } from "@/store/useNotificationStore";
import { useState } from "react";
import { Button, Card, Table, Row, Col, Badge } from "react-bootstrap";
import { deleteTemplateApi } from "./apiClient";
import { useMediaQuery } from "@/components/ui/useMediaQuery";
import TemplateEditModal from "./_TemplateEditModal";
import CommonCard from "@/components/ui/CommonCard";

export default function TemplateListPageClient({ templates }: { templates: any[] }) {
  const isMobile = useMediaQuery();
  const push = useNotificationStore((s) => s.push);
  const [list, setList] = useState(templates);
  const [editing, setEditing] = useState<any | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("削除しますか？")) return;

    const res = await deleteTemplateApi(id);
    if (!res.ok) {
      push({ type: "error", message: res.error?.message ?? "削除に失敗しました" });
      return;
    }

    setList((prev) => prev.filter((_: any, i: number) => _.id !== id));
    push({ type: "success", message: "削除しました" });
  };

  return (
    <div>
      <Row className="mb-3">
        <Col>
          <h3>テンプレート管理</h3>
        </Col>
        <Col className="text-end">
          <Button size={isMobile ? "sm" : undefined} onClick={() => setEditing({})}>新規登録</Button>
        </Col>
      </Row>

      {isMobile && (
        <>
          {list.map(t => {
            const body = () => {
              const fields = JSON.parse(t.fields);
              return (
                <Row>
                  <div className="text-end">
                    {t.isActive ? (
                      <Badge bg="success">有効</Badge>
                    ) : (
                      <Badge bg="secondary">無効</Badge>
                    )}
                    <span className="ps-2">({fields.length})</span>
                  </div>
                </Row>
              )
            }
            const footer = () => {
              return (
                <div className="d-flex">
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="d-grid w-100 me-2"
                    onClick={() => setEditing(t)}
                  >
                    編集
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="d-grid w-100 ms-2"
                    onClick={() => handleDelete(t.id)}
                  >
                    削除
                  </Button>
                </div>
              )
            }

            return (
              <div key={t.id}>
                <CommonCard title={t.name} children={body()} footer={footer()}></CommonCard>
              </div>
            )
          })}
        </>
      )}

      {!isMobile && (
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
                {list.map(t => {
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
                        <Button size="sm" variant="danger" className="ms-2" onClick={() => handleDelete(t.id)}>
                          削除
                        </Button>
                      </td>
                    </tr>
                  )

                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {editing && (
        <TemplateEditModal
          template={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            if (updated.id === editing.id) {
              setList((prev) =>
                prev.map((t) => (t.id === updated.id ? updated : t))
              );
            } else {
              setList((prev) => [...prev, updated]);
            }
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

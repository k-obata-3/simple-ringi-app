"use client";

import { useState } from "react";
import { Modal, Button, Form, Table, } from "react-bootstrap";
import { useNotificationStore } from "@/store/useNotificationStore";

export default function TemplateEditModal({
  template,
  onClose,
  onSaved,
}: {
  template: any;
  onClose: () => void;
  onSaved: (t: any) => void;
}) {
  const editing = !!template.id;
  const push = useNotificationStore((s) => s.push);
  const initialFields = template?.fields ? JSON.parse(template.fields) : [];

  const [name, setName] = useState(template?.name ?? "");
  const [fields, setFields] = useState(initialFields);
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  // 項目モーダル
  const [fieldModalShow, setFieldModalShow] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [fieldKey, setFieldKey] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldValue, setFieldValue] = useState("");

  const openFieldModal = (index?: number) => {
    if (index != null) {
      // 編集モード
      const f = fields[index];
      setEditingIndex(index);
      setFieldKey(f.key);
      setFieldLabel(f.label);
      setFieldType(f.inputType);
      setFieldRequired(f.required);
      setFieldValue(f.value);
    } else {
      // 新規
      setEditingIndex(null);
      setFieldKey("");
      setFieldLabel("");
      setFieldType("text");
      setFieldRequired(false);
      setFieldValue("");
    }
    setFieldModalShow(true);
  };

  const saveField = () => {
    const newField = {
      key: fieldKey,
      label: fieldLabel,
      inputType: fieldType,
      required: fieldRequired,
      value: fieldValue,
    };

    if (editingIndex != null) {
      // 上書き更新
      const updated = [...fields];
      updated[editingIndex] = newField;
      setFields(updated);
    } else {
      // 追加
      setFields([...fields, newField]);
    }

    setFieldModalShow(false);
  };

  const deleteField = (index: number) => {
    setFields(fields.filter((_: any, i: number) => i !== index));
  };

  const handleSave = async () => {
    // TODO: API呼び出し
    push({ type: "success", message: "保存しました" });
    onSaved(template);
  };

  return (
    <>
      <Modal show onHide={onClose} centered className="modal-xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "テンプレート編集" : "テンプレート作成"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form action={handleSave}>
            {editing && <input type="hidden" name="id" value={template.id} />}

            <Form.Group className="mb-3">
              <Form.Label>テンプレート名</Form.Label>
              <Form.Control
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>

            <hr />

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>項目一覧</h5>
              <Button size="sm" onClick={() => openFieldModal()}>項目追加</Button>
            </div>

            <Table bordered hover>
              <thead>
                <tr className="text-center">
                  <th>項目キー</th>
                  <th>項目名</th>
                  <th>型</th>
                  <th>必須</th>
                  <th>初期値</th>
                  <th style={{ width: 140 }}></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((f: any, idx: number) => (
                  <tr key={idx} className="text-center">
                    <td className="text-start">{f.key}</td>
                    <td className="text-start">{f.label}</td>
                    <td>{f.inputType}</td>
                    <td>{f.required ? "✓" : ""}</td>
                    <td>{f.value}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => openFieldModal(idx)}
                      >
                        編集
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        className="ms-2"
                        onClick={() => deleteField(idx)}
                      >
                        削除
                      </Button>
                    </td>
                  </tr>
                ))}
                {fields.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted">
                      項目がありません
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {editing && (
              <Form.Check
                type="checkbox"
                label="テンプレートを有効にする"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mb-3"
              />
            )}

            <Button type="submit">保存</Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* 項目の追加/編集モーダル */}
      <Modal show={fieldModalShow} onHide={() => setFieldModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>項目編集</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>キー名（key）</Form.Label>
            <Form.Control
              value={fieldKey}
              onChange={(e) => setFieldKey(e.target.value)}
              placeholder="itemName"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>表示名（label）</Form.Label>
            <Form.Control
              value={fieldLabel}
              onChange={(e) => setFieldLabel(e.target.value)}
              placeholder="品名"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>入力形式（inputType）</Form.Label>
            <Form.Select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value)}
            >
              <option value="text">text</option>
              <option value="number">number</option>
              <option value="textarea">textarea</option>
              <option value="date">date</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="必須項目"
              checked={fieldRequired}
              onChange={(e) => setFieldRequired(e.target.checked)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>初期値（value）</Form.Label>
            <Form.Control
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
            />
          </Form.Group>

          <Button onClick={saveField}>項目を保存</Button>
        </Modal.Body>
      </Modal>
    </>
  );
}

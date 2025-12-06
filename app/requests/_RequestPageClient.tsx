"use client";

import { useRequestWizardStore } from "@/store/useRequestWizardStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useEffect } from "react";
import { Button, Card, Row, Col, Form, ProgressBar, Badge } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { statusValueLabel } from "@/lib/utils";
import { useMediaQuery } from "@/components/ui/useMediaQuery";
import AuditLogsClient from "./_AuditLogsClient";
import ApprovalStatusClient from "./_ApprovalStatusClient";
import BottomActionBar from "@/components/ui/BottomActionBar";

interface Field {
  key: string;
  label: string;
  inputType: "text" | "number" | "textarea" | "date";
  required: boolean;
  value: string | number;
}

type Props = {
  currentUser: { id: string; role: string; name: string; email: string };
  templates: any;
  request: any; // 新規の場合は null を想定
  approvers: any
  isApprover: boolean
  mode: "view" | "edit";
};

export default function RequestPageClient({ currentUser, templates, request, approvers, isApprover, mode }: Props) {
  const router = useRouter();
  const isMobile = useMediaQuery();
  const wizard = useRequestWizardStore();
  const push = useNotificationStore((s) => s.push);

  const isNew = !request;
  const currentJsonData: any = wizard.typeId ? wizard.jsonData : [];
  const enabledApproveAction = request?.status === "PENDING" && request.approvals.some(
    (a: any) => a.approverId === currentUser.id && a.status === "PENDING")
  const getTemplate = (typeId: string) => {
    return templates.find((t: any) => t.id === typeId);
  }
  const getTemplateFields = (typeId: string) => {
    const selectedTemplate = getTemplate(typeId);
    return selectedTemplate ? JSON.parse(selectedTemplate.fields) : {};
  }

  const setFields = (key: string, value: string | number) => {
    let jsonData = wizard.jsonData;
    jsonData.map((f: Field) => {
      if(f.key === key) {
        f.value = value;
      }
    })
    wizard.setField({
      jsonData: jsonData
    })
  }

  useEffect(() => {
    if (request) {
      wizard.setFromExisting({
        requestId: request.id,
        title: request.title,
        type: request.type,
        typeId: request.typeId,
        jsonData: request.jsonData ? JSON.parse(request.jsonData) : {},
        approverIds: request.approvals.map((a: any) => a.approverId),
      });
    } else {
      wizard.reset();
    }
  }, [request]);

  // 下書き保存ボタンのハンドラ
  const handleSaveDraft = async () => {
    const body = {
      action: "saveDraft",
      title: wizard.title,
      type: wizard.type,
      typeId: wizard.typeId,
      jsonData: wizard.jsonData,
      approverIds: wizard.approverIds,
      requestId: wizard.requestId,
    };
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      push({ type: "error", message: data.error?.message ?? "保存に失敗しました。" });
      return;
    }
    push({ type: "success", message: "保存しました。" });
    router.replace('/dashboard');
  };

  // 申請・再申請ボタンのハンドラ
  const handleSubmit = async (action: "submit" | "resubmit") => {
    const body = {
      action,
      title: wizard.title,
      type: wizard.type,
      typeId: wizard.typeId,
      jsonData: wizard.jsonData,
      approverIds: wizard.approverIds,
      requestId: wizard.requestId,
    };
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      push({ type: "error", message: data.error?.message ?? "申請に失敗しました。" });
      return;
    }
    push({ type: "success", message: "申請しました。" });
    router.replace('/dashboard');
  };

  // 承認・却下・差戻しボタンのハンドラ
  const handleApprovalAction = async (action: "approve" | "reject" | "sendBack") => {
    const comment = window.prompt("コメントを入力してください（任意）");
    if(comment === null) {
      return;
    }

    const res = await fetch("/api/requests/approval", {
      method: "POST",
      body: JSON.stringify({
        action,
        requestId: request.id,
        comment,
      }),
    });

    const data = await res.json();

    if (!data.ok) {
      push({
        type: "error",
        message: data.error?.message ?? "操作に失敗しました",
      });
      return;
    }

    push({ type: "success", message: "処理が完了しました" });
    router.replace('/dashboard');
  };

  const enabledSubmitAction = () => {
    const title = wizard.title.trim();
    let errorJson:any = [];
    currentJsonData?.forEach((field: Field) => {
      if(field.inputType === "date") {
        if(field.value && isNaN(new Date(field.value).getDate())) {
          errorJson.push(field);
        } else if(field.required && !field.value) {
          errorJson.push(field);
        }
      } else if(field.required && (!field.value || !field.value.toString().trim())) {
        errorJson.push(field);
      }
    });

    if(title && wizard.type && wizard.approverIds.length && !errorJson.length) {
      return true;
    }

    return false;
  }

  return (
    <Row className="mb-3">
      <Row className="mb-3">
        <Col>
          <h3>{isNew ? "新規稟議申請" : "稟議申請 詳細"}</h3>
        </Col>
        <Col className="col-auto">
          {!isNew && (
            <Badge bg={statusValueLabel(request.status).bg}>{statusValueLabel(request.status).label}</Badge>
          )}
        </Col>
      </Row>
      {/* 詳細表示モード */}
      {mode === "view" && (
        <>
          <Col className="mb-3" sm={12}>
            <Card>
              <Card.Header>{wizard.title}</Card.Header>
              <Card.Body>
                {JSON.parse(request.jsonData)?.map((field: Field) => {
                  return (
                    <div
                      key={field.key}
                      className="d-flex align-items-start pb-2 mt-2 border-bottom"
                    >
                      <div
                        className="fw-bold"
                        style={{ width: "150px", minWidth: "150px" }}
                      >
                        {field.label}
                      </div>

                      <div style={{ flex: 1 }}>
                        {/* 値の表示方法（型によって切り替え可） */}
                        {field.inputType === "textarea" ? (
                          <pre className="mb-0" style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "inherit",
                          }}>
                            {field.value || "-"}
                          </pre>
                        ) : (
                          <span>{field.value || "-"}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>
          <Col className="mb-3">
            <ApprovalStatusClient approvals={request.approvals} />
          </Col>
          <Col xl={5} className="mb-3">
            <AuditLogsClient auditLogs={request.auditLogs}/>
          </Col>
          {/* 承認者用の操作ボタン */}
          {enabledApproveAction && isMobile && (
            <BottomActionBar
              actions={[
                {
                  label: "承認する",
                  variant: "success",
                  onClick: () => handleApprovalAction("approve")
                },
                {
                  label: "却下する",
                  variant: "danger",
                  onClick: () => handleApprovalAction("reject")
                },
                {
                  label: "差戻する",
                  variant: "secondary",
                  onClick: () => handleApprovalAction("sendBack")
                },
              ]}
            />
          )}
          {enabledApproveAction && !isMobile && (
            <div className="d-flex justify-content-end gap-2">
              <Button variant="success" onClick={() => handleApprovalAction("approve")}>承認する</Button>
              <Button variant="danger" onClick={() => handleApprovalAction("reject")}>却下する</Button>
              <Button variant="secondary" onClick={() => handleApprovalAction("sendBack")}>差戻する</Button>
            </div>
          )}
        </>
      )}

      {/* 編集表示モード */}
      {mode === "edit" && (
        <>
          {/* ウィザードステップ表示 */}
          <Col sm={12} className="mb-3">
            <ProgressBar now={(wizard.step / wizard.maxStep) * 100} label={`STEP${wizard.step}`} />
          </Col>
          <Col className="mb-3">
            {/* ステップ1: 基本情報 */}
            {wizard.step === 1 && (
              <Card className="mb-3">
                <Card.Header>基本情報</Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>タイトル</Form.Label>
                      <span className="ps-1 text-danger">*</span>
                      <Form.Control
                        value={wizard.title}
                        onChange={(e) => wizard.setField({ title: e.target.value })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>申請種類</Form.Label>
                      <span className="ps-1 text-danger">*</span>
                      <Form.Select
                        value={wizard.typeId}
                        onChange={(e) => wizard.setField({
                          typeId: e.target.value,
                          type: getTemplate(e.target.value).name,
                          jsonData: getTemplateFields(e.target.value)
                        })}
                      >
                        <option value={wizard.type ? wizard.typeId : ""}>{wizard.type ? wizard.type : "選択してください"}</option>
                        {templates.map((t: any) => (
                          wizard.typeId !== t.id && (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          )
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {/* ▼ Step2: 動的項目 */}
            {wizard.step === 2 && (
              <Card className="mb-3">
                <Card.Header>入力項目</Card.Header>
                <Card.Body>
                  {currentJsonData?.map((f: Field) => (
                    <Form.Group key={f.key} className="mb-3">
                      <Form.Label>{f.label}</Form.Label>
                      {f.required && (
                        <span className="ps-1 text-danger">*</span>
                      )}

                      {f.inputType === "text" && (
                        <Form.Control
                          value={f.value}
                          onChange={(e) => setFields(f.key, e.target.value)}
                        />
                      )}

                      {f.inputType === "number" && (
                        <Form.Control
                          type="number"
                          value={f.value}
                          onChange={(e) => setFields(f.key, Number(e.target.value))}
                        />
                      )}

                      {f.inputType === "textarea" && (
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={f.value}
                          onChange={(e) => setFields(f.key, e.target.value)}
                        />
                      )}

                      {f.inputType === "date" && (
                        <Form.Control
                          type="date"
                          value={f.value}
                          onChange={(e) => setFields(f.key, e.target.value)}
                        />
                      )}
                    </Form.Group>
                  ))}
                </Card.Body>
              </Card>
            )}

            {/* ステップ3: 承認者選択 */}
            {wizard.step === 3 && (
              <>
                {request?.status === "SENT_BACK" && (
                  <div className="mb-3">
                    <ApprovalStatusClient approvals={request.approvals} />
                  </div>
                )}
                {(isNew || request?.status === "DRAFT") && (
                  <Card className="mb-3">
                    <Card.Header>承認者選択</Card.Header>
                    <Card.Body>
                      <Form.Group>
                        <Form.Label>承認者（複数選択可能）</Form.Label>
                        <span className="ps-1 text-danger">*</span>
                        <Form.Select
                          multiple
                          value={wizard.approverIds}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                            wizard.setField({ approverIds: selected });
                          }}
                        >
                          {approvers.map((u: any) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                )}
              </>
            )}

            {isMobile && (
              <Row>
                <Col xs={6} className="d-grid">
                  <Button variant="outline-secondary" onClick={() => wizard.step > 1 ? wizard.prev() : router.back()} disabled={wizard.step === 1}>
                    戻る
                  </Button>
                </Col>
                {wizard.step < wizard.maxStep && (
                  <Col xs={6} className="d-grid">
                    <Button variant="outline-primary" onClick={wizard.next} disabled={!wizard.type}>次へ</Button>
                  </Col>
                )}
              </Row>
            )}

            {!isMobile && (
              <div className="d-flex justify-content-between gap-2">
                <Button variant="outline-secondary" onClick={wizard.prev} disabled={wizard.step === 1}>戻る</Button>
                <div>
                  {wizard.step < wizard.maxStep && (
                    <Button variant="outline-primary" onClick={wizard.next} disabled={!wizard.type}>次へ</Button>
                  )}
                </div>
              </div>
            )}
          </Col>

          {/* 操作履歴 */}
          {request && (
            <Col xl={5}>
              <AuditLogsClient auditLogs={request.auditLogs}/>
            </Col>
          )}

          {isMobile && (
            <BottomActionBar
              actions={[
                {
                  label: "下書き保存",
                  variant: "outline-secondary",
                  onClick: handleSaveDraft,
                  disabled:!enabledSubmitAction()
                },
                {
                  label: `${request?.status === "SENT_BACK" ? "再申請" : "申請"}`,
                  variant: "primary",
                  onClick: () => handleSubmit(request?.status === "SENT_BACK" ? "resubmit" : "submit"),
                  disabled:!enabledSubmitAction()
                },
              ]}
            />
          )}
          {!isMobile && (
            <div className="d-flex justify-content-end mt-3">
              <Button variant="outline-secondary" className="me-2" onClick={handleSaveDraft} disabled={!enabledSubmitAction()}>
                下書き保存
              </Button>
              <Button variant="primary" onClick={() => handleSubmit(request?.status === "SENT_BACK" ? "resubmit" : "submit")} disabled={!enabledSubmitAction()}>
                {request?.status === "SENT_BACK" ? "再申請" : "申請"}
              </Button>
            </div>
          )}
        </>
      )}
    </Row>
  );
}

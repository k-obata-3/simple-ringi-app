"use client";

import { useEffect, useState } from "react";
import { Button, Card, Row, Col, Table, Badge } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { statusValueLabel } from "@/lib/utils";
import Link from "next/link";
import { useMediaQuery } from "@/components/ui/useMediaQuery";
import CommonCard from "@/components/ui/CommonCard";

type RequestWithApprovals = any; // Prisma 型を入れてOK

type Props = {
  user: { id: string; role: string; name: string; email: string };
  myRequests: RequestWithApprovals[];
  pendingApprovals: RequestWithApprovals[];
  allRequests: RequestWithApprovals[];
  notifications: any[],
  unreadCount: any,
};

export default function DashboardPageClient({
  user,
  myRequests,
  pendingApprovals,
  allRequests,
  notifications,
  unreadCount,
}: Props) {
  const router = useRouter();
  const isMobile = useMediaQuery();
  const [tab, setTab] = useState<"my" | "approve" | "all">("my");
  const isAdmin = user.role === "ADMIN";
  const currentList =
    tab === "my"
      ? myRequests
      : tab === "approve"
      ? pendingApprovals
      : allRequests;

  useEffect(() => {
    router.refresh();
  }, []);

  const onClickNotification = async(e: any, notification: any) => {
    e.preventDefault();
    await fetch("/api/notifications/read", {
      method: "POST",
      body: JSON.stringify({ id: notification.id }),
    });

    router.push(`/requests/${notification.payload.requestId}`);
  }

  return (
    <div>
      <Row className="">
        {unreadCount > 0 && (
          <Card className="mb-4 shadow-sm notification-card">
            <Card.Header className="bg-white fw-bold d-flex align-items-center" 
              style={{ fontSize: "1.1rem" }}>
              {unreadCount}件の通知があります
            </Card.Header>
            <Card.Body className="py-2">
              <div className="list-group list-group-flush">
                {notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className="list-group-item d-flex justify-content-between align-items-start px-0 py-2"
                  >
                    <div style={{ fontSize: "0.9rem", cursor: "pointer" }} onClick={(e) => onClickNotification(e, n)}>
                      {n.payload.message}
                    </div>
                  </div>
                ))}

                {unreadCount > 3 && (
                  <div className="text-muted small mt-2">
                    他 {unreadCount - 3} 件の通知があります
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        )}
      </Row>
      <Row className="mb-3">
        <Col>
          <h3>ダッシュボード</h3>
        </Col>
        <Col className="text-end">
          <Button size={isMobile ? "sm" : undefined} onClick={() => router.push("/requests/new")}>
            新規申請
          </Button>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col>
          <Card>
            <Card.Body className="d-flex gap-2">
              <Button
                variant={tab === "my" ? "primary" : "outline-primary"}
                size={isMobile ? "sm" : undefined}
                onClick={() => setTab("my")}
              >
                自分の申請
              </Button>
              <Button
                variant={tab === "approve" ? "primary" : "outline-primary"}
                size={isMobile ? "sm" : undefined}
                onClick={() => setTab("approve")}
              >
                承認待ち
              </Button>
              {isAdmin && (
                <Button
                  variant={tab === "all" ? "primary" : "outline-primary"}
                  size={isMobile ? "sm" : undefined}
                  onClick={() => setTab("all")}
                >
                  すべて
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isMobile && (
        <>
          {currentList.map((req: any) => {
            const total = req.approvals.length;
            const approved = req.approvals.filter((a: any) => a.status === "APPROVED").length;
            const body = () => {
              return (
                <Row>
                  <div className="text-end">
                    <Badge bg={statusValueLabel(req.status).bg}>{statusValueLabel(req.status).label}</Badge>
                  </div>
                  <div className="d-flex">
                    <span className="me-auto">申請日</span>
                    <span>{new Date(req.requestedAt).toLocaleString("ja-JP")}</span>
                  </div>
                  <div className="d-flex">
                    <span className="me-auto">承認状況</span>
                    <span>{total > 0 && req.status !== "DRAFT" ? `${approved} / ${total}` : "-"}</span>
                  </div>
                </Row>
              )
            }
            const footer = () => {
              return (
                <div className="d-grid">
                  {(req.status === statusValueLabel("DRAFT").value || req.status === statusValueLabel("SENT_BACK").value) &&
                    req.requestedById === user.id ? (
                      <Link href={`/requests/${req.id}?mode=edit`} className="btn btn-sm btn-outline-secondary">
                        編集
                      </Link>
                    ) : (
                    <Link href={`/requests/${req.id}`} className="btn btn-sm btn-outline-primary">
                      詳細
                    </Link>
                    )}
                </div>
              )
            }

            return (
              <div key={req.id}>
                <CommonCard title={req.title} children={body()} footer={footer()}></CommonCard>
              </div>
            )
          })}
        </>
      )}

      {!isMobile && (
        <Row>
          <Col>
            <Card>
              <Card.Body className="p-0">
                <Table hover responsive className="mb-0">
                  <thead>
                    <tr className="text-center">
                      <th>タイトル</th>
                      <th>種類</th>
                      <th>ステータス</th>
                      <th>申請日</th>
                      <th>承認状況</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentList.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-3">
                          申請はありません。
                        </td>
                      </tr>
                    )}
                    {currentList.map((req: any) => {
                      const total = req.approvals.length;
                      const approved = req.approvals.filter((a: any) => a.status === "APPROVED").length;
                      return (
                        <tr key={req.id} className="text-center">
                          <td className="text-start">{req.title}</td>
                          <td>{req.type}</td>
                          <td>
                            <Badge bg={statusValueLabel(req.status).bg}>{statusValueLabel(req.status).label}</Badge>
                          </td>
                          <td>
                            {new Date(req.requestedAt).toLocaleString("ja-JP")}
                          </td>
                          <td>
                            {total > 0 && req.status !== "DRAFT" ? `${approved} / ${total}` : "-"}
                          </td>
                          <td>
                            {(req.status === statusValueLabel("DRAFT").value || req.status === statusValueLabel("SENT_BACK").value) &&
                              req.requestedById === user.id ? (
                                <Link href={`/requests/${req.id}?mode=edit`} className="btn btn-sm btn-outline-secondary">
                                  編集
                                </Link>
                              ) : (
                              <Link href={`/requests/${req.id}`} className="btn btn-sm btn-outline-primary">
                                詳細
                              </Link>
                              )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

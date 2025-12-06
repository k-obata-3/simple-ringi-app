"use client";

import { useMediaQuery } from "@/components/ui/useMediaQuery";
import { getActionValueLabel } from "@/lib/utils";
import { Badge, Card, Col, Row, Table, } from "react-bootstrap";

type Props = {
  auditLogs: any;
};

export default function AuditLogsClient({ auditLogs }: Props) {
  const isMobile = useMediaQuery();
  return (
    <div>
      {isMobile && (
        <Card>
          <Card.Header>操作履歴</Card.Header>
          <Card.Body className="pt-0">
            {auditLogs.map((log: any) => (
              <div key={log.id} className="pb-2 mt-2 border-bottom">
                <Row>
                  <Col className="text-truncate">
                    <p className="m-0">{new Date(log.createdAt).toLocaleString("ja-JP")}</p>
                    <span className="m-0 ps-2">{log.user?.name ?? "-"}</span>
                  </Col>
                  <Col xs={4} className="d-flex align-items-center justify-content-center">
                    <Badge bg={getActionValueLabel(log.action).bg}>{getActionValueLabel(log.action).label}</Badge>
                  </Col>
                </Row>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {!isMobile && (
        <Card>
          <Card.Header>操作履歴</Card.Header>
          <Card.Body>
            <Table size="sm" className="mb-0">
              <thead>
                <tr>
                  <th>日時</th>
                  <th>ユーザ</th>
                  <th>内容</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString("ja-JP")}</td>
                    <td>{log.user?.name ?? "-"}</td>
                    <td>{getActionValueLabel(log.action).label}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

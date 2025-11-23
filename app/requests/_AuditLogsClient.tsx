"use client";

import { getActionValueLabel } from "@/lib/utils";
import { Card, Table, } from "react-bootstrap";

type Props = {
  auditLogs: any;
};

export default function AuditLogsClient({ auditLogs }: Props) {
  return (
    <div>
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
    </div>
  );
}

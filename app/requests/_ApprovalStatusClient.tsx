"use client";

import { statusValueLabel } from "@/lib/utils";
import { Card, Table, } from "react-bootstrap";

type Props = {
  approvals: any;
};

export default function ApprovalStatusClient({ approvals }: Props) {
  return (
    <div>
      <Card>
        <Card.Header>承認状況</Card.Header>
        <Card.Body>
          <Table size="sm" className="mb-0">
            <thead>
              <tr>
                <th>順番</th>
                <th>承認者</th>
                <th>ステータス</th>
                <th>コメント</th>
              </tr>
            </thead>
            <tbody>
              {approvals.map((a: any) => (
                <tr key={a.id}>
                  <td>{a.order}</td>
                  <td>{a.approver.name}</td>
                  <td>{statusValueLabel(a.status).label}</td>
                  <td>{a.comment}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
}

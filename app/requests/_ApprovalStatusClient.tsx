"use client";

import { useMediaQuery } from "@/components/ui/useMediaQuery";
import { statusValueLabel } from "@/lib/utils";
import { Badge, Card, Col, Row, Table, } from "react-bootstrap";
import { BsChatText } from "react-icons/bs";

type Props = {
  approvals: any;
};

export default function ApprovalStatusClient({ approvals }: Props) {
  const isMobile = useMediaQuery();
  return (
    <div>
      {isMobile && (
        <Card>
          <Card.Header>承認状況</Card.Header>
          <Card.Body className="pt-0">
            {approvals.map((a: any) => (
              <div key={a.id} className="pb-2 mt-2 border-bottom">
                <Row>
                  <Col xs={3} className="text-center">
                      <Badge bg={statusValueLabel(a.status).bg}>{statusValueLabel(a.status).label}</Badge>
                  </Col>
                  <Col className="text-truncate p-0">
                    <span>{a.approver.name ?? "-"}</span>
                  </Col>
                  <Col xs={2}>
                    {a.comment && (
                      <BsChatText onClick={() =>{alert(a.comment)}} />
                    )}
                  </Col>
                </Row>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {!isMobile && (
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
      )}
    </div>
  );
}

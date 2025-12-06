"use client";

import { Card } from "react-bootstrap";

export default function CommonCard({ title, children, footer }: any) {
  return (
    <Card className="mb-2 shadow-sm">
      <Card.Body>
        {title && (
          <Card.Title className="text-truncate">{title}</Card.Title>
        )}
        <div>{children}</div>
        {footer && (
          <div className="mt-3">{footer}</div>
        )}
      </Card.Body>
      {/* {footer && <Card.Footer>{footer}</Card.Footer>} */}
    </Card>
  );
}

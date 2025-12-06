"use client";

import React from "react";
import { Button } from "react-bootstrap";

type Action = {
  label: string;
  variant?: string;
  onClick: () => void;
  disabled?: boolean;
};

export default function BottomActionBar({ actions }: { actions: Action[] }) {
  return (
    <div className="bottom-action-bar">
      <div className="action-container">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant ?? "primary"}
            onClick={action.onClick}
            disabled={action.disabled}
            className="action-btn"
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

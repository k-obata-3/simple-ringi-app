"use client";

import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";
import { Button, Card, Form, Row, Col } from "react-bootstrap";
import { useNotificationStore } from "@/store/useNotificationStore";

export default function LoginPageClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const push = useNotificationStore((s) => s.push);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      push({ type: "error", message: "ログインに失敗しました。" });
      return;
    }
    push({ type: "success", message: "ログインしました。" });
    window.location.href = "/dashboard";
  };

  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      <Row className="w-100 justify-content-center">
        <Col md={8} xl={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="mb-4 text-center">
                稟議申請システム ログイン
              </Card.Title>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>メールアドレス</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>パスワード</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit" className="w-100" disabled={loading}>
                  {loading ? "ログイン中..." : "ログイン"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

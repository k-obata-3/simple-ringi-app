"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Navbar, Nav, Button, } from "react-bootstrap";

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm mb-4 sticky-top ps-4 pe-4">
      <Navbar.Brand as={Link} href="/">
        稟議申請システム
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        {user && (
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/dashboard">
              ダッシュボード
            </Nav.Link>

            <Nav.Link as={Link} href="/requests/new">
              新規申請
            </Nav.Link>

            {/* 管理者だけ表示 */}
            {user.role === "ADMIN" && (
              <>
                <Nav.Link as={Link} href="/admin/users">
                  ユーザ管理
                </Nav.Link>
                <Nav.Link as={Link} href="/admin/templates">
                  稟議テンプレート管理
                </Nav.Link>
              </>
            )}
          </Nav>
        )}

        {user && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            ログアウト
          </Button>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
}

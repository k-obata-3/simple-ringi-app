# 稟議申請アプリ

稟議申請（ワークフロー）業務を Web で完結できるシンプルなアプリケーションです。  
申請・承認・テンプレート管理を最小構成で実装し、拡張にも対応できます。

## 1. 機能要件

### 基本機能

#### 申請関連

- 稟議の 新規作成 / 下書き保存 / 編集 / 下書き削除(TODO)
- 稟議の 申請 / 再申請
- 自分の申請一覧の確認
- 申請詳細表示（申請内容 + 承認状況）

#### 承認関連

- 指定された承認者による 承認 / 却下 / 差戻
- 承認待ち稟議の一覧表示
- 承認履歴の記録（承認・却下・差戻）

#### テンプレート関連

- 稟議テンプレートの 一覧 / 新規作成 / 編集 / 削除 / 有効化・無効化
- テンプレート項目（key / label / type / required / value）の GUI 管理
- JSON 形式で汎用的に項目を保持

#### 通知関連

- 重要操作に対する通知の保持
- ダッシュボード上部に未読通知を表示（押下で既読）

### ロール（権限）

| ロール     | 操作権限                                  |
| ------- | ------------------------------------- |
| **管理者** | 全ての申請閲覧、ユーザ管理（登録 / 編集 / 無効化）、テンプレート管理 |
| **社員**  | 基本の申請・承認フローのみ                         |

### 技術要件

- Next.js 14（App Router）
- React / React-Bootstrap
- Prisma（SQLite）※Enum 不使用
- NextAuth（メール + パスワード）
- 状態管理：Zustand
- バリデーション：Zod
- Server Component：データ取得のみ
- API：App Router の API Route
- Repository パターン：Service 層なし
- 共通レスポンス処理による統一的な API エラー管理
- Jest による Repository の単体テスト

## 2. 画面・機能一覧
### ログイン

- メールアドレス + パスワードでログイン
- NextAuth を使用

```
/login
```

### ダッシュボード（共通）

- 新規申請
- 自分の申請一覧
- 承認待ち一覧（承認者用）
- すべての申請一覧（管理者用）
- 未読通知の表示

```
/dashboard
```

### 稟議申請・承認画面

#### 申請

- テンプレート選択（標準稟議・備品購入など）
- JSON 項目に基づく動的フォーム
- 下書き保存 / 編集
- 申請 / 再申請
- 承認状況の表示

```
/requests/new
/requests/[id]
```

#### 承認

- 承認待ち一覧から遷移
- 申請内容と承認履歴を閲覧
- 承認 / 却下 / 差戻

```
/requests/[id]
```

### ユーザ管理（管理者のみ）

- 一覧表示
- 新規登録
- 編集
- 無効化

```
/admin/users
```

### 稟議テンプレート管理（管理者のみ）

- 一覧表示
- 新規作成
- 項目追加 / 編集
- 有効 / 無効化
- 削除
- 項目編集
  - key
  - label
  - inputType（text / number / textarea / date）
  - required
  - value

```
/admin/templates
```

## 3. セットアップ手順

プロジェクトを clone → setup → dev 起動までの手順です。

### 1. リポジトリ取得
```
git clone <repository-url>
cd simple-ringi-app
```

### 2. パッケージインストール
```
npm install
```

### 3. 環境変数設定

.env を作成
```
DATABASE_URL="file:./dev.db"

NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

※ NEXTAUTH_SECRET は
```
openssl rand -hex 32
```
で生成できます。

### 4. Prisma セットアップ
```
npx prisma generate
npx prisma migrate dev --name init
```

### 5. 開発サーバ起動
```
npm run dev
```

http://localhost:3000
 にアクセス。

## テスト実行（任意）
```
npm test
```
Repository の単体テストが Jest で実行されます。

## 初期ユーザー

※パスワード：test123
| ロール | 名前 | メールアドレス |
| --- | --- | --- |
| 管理者 | 管理者 太郎 | <foo>admin</foo>@example.com |
| 社員 | 社員 一郎 | <foo>employee1</foo>@example.com |
| 社員 | 社員 二郎 | <foo>employee2</foo>@example.com |
| 社員 | 社員 三郎 | <foo>employee3</foo>@example.com |

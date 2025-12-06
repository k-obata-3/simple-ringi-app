type ActionKey = "REQUEST_DRAFT_CREATED" | "REQUEST_DRAFT_UPDATED" | "REQUEST_DRAFT_DELETED"
  | "REQUEST_SUBMITTED" | "REQUEST_APPROVED" | "SENT_BACK" | "REQUEST_REJECTED";
type StatusKey = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "SENT_BACK";

export function getActionValueLabel(key: ActionKey) {
  switch (key) {
    case "REQUEST_DRAFT_CREATED":
      return {value: "REQUEST_DRAFT_CREATED", bg: "secondary", label: "下書き作成"};
    case "REQUEST_DRAFT_UPDATED":
      return {value: "REQUEST_DRAFT_UPDATED", bg: "primary", label: "更新"};
    case "REQUEST_DRAFT_DELETED":
      return {value: "REQUEST_DRAFT_DELETED", bg: "secondary", label: "削除"};
    case "REQUEST_SUBMITTED":
      return {value: "REQUEST_SUBMITTED", label: "申請"};
    case "REQUEST_APPROVED":
      return {value: "REQUEST_APPROVED", bg: "success", label: "承認"};
    case "SENT_BACK":
      return {value: "SENT_BACK", bg: "info", label: "差戻"};
    case "REQUEST_REJECTED":
      return {value: "REQUEST_REJECTED", bg: "danger", label: "却下"};
    default:
      return {value: "", bg: "light", label: ""};
  }
};

export const statusValueLabel = (status: StatusKey) => {
  switch (status) {
    case "DRAFT":
      return {value: status, bg: "secondary", label: "下書き"};
    case "PENDING":
      return {value: status, bg: "warning", label: "承認待ち"};
    case "APPROVED":
      return {value: status, bg: "success", label: "承認済"};
    case "REJECTED":
      return {value: status, bg: "danger", label: "却下"};
    case "SENT_BACK":
      return {value: status, bg: "info", label: "差戻"};
    default:
      return {value: status, bg: "light", label: status};
  }
};

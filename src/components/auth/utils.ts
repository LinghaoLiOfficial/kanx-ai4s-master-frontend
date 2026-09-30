import { ApiError } from "@/lib/api/client";

export function authErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const messages: Record<string, string> = {
      invalid_credentials: "邮箱或密码不正确。",
      email_not_verified: "请先完成邮箱验证后再登录。",
      email_already_registered: "该邮箱已经注册，请直接登录。",
      email_delivery_failed: "验证邮件发送失败，请稍后重试。",
      verification_token_expired: "验证链接已过期，请重新发送验证邮件。",
      invalid_verification_token: "验证链接无效或已经使用。",
      validation_error: "请检查填写的信息。",
    };
    const backendMessages: Record<string, string> = {
      "Invalid credentials": "邮箱或密码不正确。",
      "Email verification is required": "请先完成邮箱验证后再登录。",
      "Invalid or expired token": "验证链接无效、已过期或已经使用。",
      "Authentication required": "登录状态已失效，请重新登录。",
      "Session is no longer valid": "登录状态已失效，请重新登录。",
      "Origin is not allowed": "当前页面来源不在后端允许列表中。",
      "CSRF validation failed": "安全校验失败，请刷新页面后重试。",
    };
    return messages[error.error.code] ?? backendMessages[error.error.message] ?? error.error.message;
  }
  return error instanceof Error ? error.message : "请求失败，请稍后重试。";
}

export function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/workspace";
}

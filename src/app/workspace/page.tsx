import { redirect } from "next/navigation";

export default function WorkspacePageRedirect() {
  redirect("/workspace/files");
}

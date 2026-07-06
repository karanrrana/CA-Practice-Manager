import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/components/Login";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — CA Practice Manager" }] }),
  component: Login,
});

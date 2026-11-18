import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { HomePage } from "@/components/home-page";

export const Route = createFileRoute("/")({
  component: () => (
    <Shell>
      <HomePage />
    </Shell>
  ),
});

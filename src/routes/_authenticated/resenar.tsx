import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/_authenticated/resenar")({ beforeLoad: () => { throw redirect({ to: "/mis-resenas", replace: true }); } });

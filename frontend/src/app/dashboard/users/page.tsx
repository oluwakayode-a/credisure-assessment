import type { Metadata } from "next";
import { UsersPage } from "@/components/dashboard/users-page";

export const metadata: Metadata = { title: "Customers | CrediSure" };

export default function Page() {
  return <UsersPage />;
}

import { AdminAuthGate } from "@/components/admin/AdminAuthGate";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminAuthGate>{children}</AdminAuthGate>;
}

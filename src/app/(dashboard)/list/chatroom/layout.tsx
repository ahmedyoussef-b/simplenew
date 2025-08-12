// This layout is no longer needed as the main dashboard layout handles all necessary setup.
// Consolidating layouts simplifies the routing structure and prevents display conflicts.

export default function RedundantChatroomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

import { TransactionEditForm } from "@/components/transaction-edit-form";

export const metadata = {
  title: "Edit Transaction - Cashflow",
};

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TransactionEditForm transactionId={id} />;
}
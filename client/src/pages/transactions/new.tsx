import TransactionForm from "@/components/forms/transaction-form";

export default function NewTransaction() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Transaction</h1>
            <p className="text-slate-600">Create a new item request or return transaction</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl">
          <TransactionForm />
        </div>
      </div>
    </div>
  );
}

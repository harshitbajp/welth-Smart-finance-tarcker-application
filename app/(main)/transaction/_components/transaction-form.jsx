"use client";

import { createTransaction } from "@/actions/transaction";
import useFetch from "@/hooks/use-fetch";
import { transactionSchema } from "@/lib/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Button } from "@/components/ui/button";

function AddTransactionForm({ accounts, categories }) {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      date: new Date(),
      accountId: accounts.find((account) => account.isDefault)?.id,

      isRecurring: false,
    },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResultS,
  } = useFetch(createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  return (
    <form className="space-y-6">
      {/* AI Reciept feature */}

      <div>
      <div className="space-y-2">
        <label>Type</label>
        <Select
        onValueChange={(value)=> setValue("type", value)}
        defaultValue={type}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Expense</SelectItem>
            <SelectItem value="dark">Income</SelectItem>
          </SelectContent>
        </Select>

        {errors.type && (
            <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
      </div>

      <div className="space-y-2">
        <label>Amount</label>
        <Input
            type="number"
            placeholder="0.00"
            {...register("amount")}
        />

        {errors.type && (
            <p className="text-red-500 text-sm">{errors.amount.message}</p>
            )}
      </div>

      <div className="space-y-2">
        <label>Account</label>
        <Select
        onValueChange={(value)=> setValue("accountId", value)}
        defaultValue={getValues("accountId")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Account" />
          </SelectTrigger>
          <SelectContent>
          {
            accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                    {account.name} (${parseFloat(account.balance).toFixed(2)})
                </SelectItem>
                ))
          }
          <CreateAccountDrawer>
            <Button variant="ghost">Create Account</Button>
          </CreateAccountDrawer>
           
          </SelectContent>
        </Select>

        {errors.type && (
            <p className="text-red-500 text-sm">{errors.type.message}</p>
            )}
      </div>


      </div>
    </form>
  );
}

export default AddTransactionForm;

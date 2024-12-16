"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@lib/prisma";
import { revalidatePath } from "next/cache";

const serializeTransation = (obj) => {
    const serialized = {...obj};

    if(obj.balance){
        serialized.balance = obj.balance.toNumber();
    }
}

export async function createAccount(data) {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("Uauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    //convert balance to float
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;


      // if this account is default, unset other default accounts
    if(shouldBeDefault) {
        await db.account.updateMany({
            where: { userId: user.id, isDefault: true},
            data: {isDefault: false},
        });
    }

        const account = await db.account.create({
            data: {
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });

        const serializedAccount = serializeTransation(account);

        revalidatePath("/dashboard");

        return {success: true, data :serializeTransation};
  } catch (error) {
    throw new Error(error.message);
  }
}
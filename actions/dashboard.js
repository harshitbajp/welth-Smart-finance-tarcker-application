"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const serializeTransation = (obj) => {
    const serialized = {...obj};

    if(obj.balance){
        serialized.balance = obj.balance.toNumber();
    }

    if(obj.amount){
        serialized.amount = obj.amount.toNumber();
    }

    return serialized;
}

export async function createAccount(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    // console.log("balance amount",data.balance);
    if (isNaN(balanceFloat)) {
        console.error("Invalid balance amount received:", data.balance);
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
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });

        const serializedAccount = serializeTransation(account);

        revalidatePath("/dashboard");

        return {success: true, data : serializedAccount};
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserAccounts(){
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }


    const accounts = await db.account.findMany({
        where: {userId: user.id},
        orderBy: {createdAt: "desc"},
        include:{
            _count:{
                select: {
                    transactions: true,
                }
            }
        }
    });
    const serializedAccount = accounts.map(serializeTransation);

    return serializedAccount;
}



export async function getDashboardData(){
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  //Get all transactions
  const transactions = await db.transaction.findMany({
      where: {userId: user.id},
      orderBy: {date: "desc"},
  });
}
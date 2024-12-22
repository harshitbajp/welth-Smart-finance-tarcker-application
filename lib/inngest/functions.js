import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";

export const checkBudgetAlerts = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" }, // Every 6 hours
  async ({ step }) => {
    try {
      console.log("Fetching budgets...");
      const budgets = await step.run("fetch-budgets", async () => {
        return await db.budget.findMany({
          include: {
            user: {
              include: {
                accounts: {
                  where: {
                    isDefault: true,
                  },
                },
              },
            },
          },
        });
      });

      console.log(`Fetched ${budgets.length} budgets`);

      for (const budget of budgets) {
        const defaultAccount = budget.user.accounts[0];
        if (!defaultAccount) {
          console.log(
            `Skipping budget ${budget.id} as no default account found`
          );
          continue; // Skip if no default account
        }

        await step.run(`check-budget-${budget.id}`, async () => {
          const startDate = new Date();
          startDate.setDate(1); // Start of current month

          console.log(`Calculating expenses for budget ${budget.id}...`);
          const expenses = await db.transaction.aggregate({
            where: {
              userId: budget.userId,
              accountId: defaultAccount.id, // Only consider default account
              type: "EXPENSE",
              date: {
                gte: startDate,
              },
            },
            _sum: {
              amount: true,
            },
          });

          const totalExpenses = expenses._sum.amount?.toNumber() || 0;
          const budgetAmount = budget.amount;
          const percentageUsed = (totalExpenses / budgetAmount) * 100;

          console.log(`Budget ${budget.id}: ${percentageUsed}% used`);

          // Check if we should send an alert
          if (
            percentageUsed >= 80 && // Default threshold of 80%
            (!budget.lastAlertSent ||
              isNewMonth(new Date(budget.lastAlertSent), new Date()))
          ) {
            console.log(`Sending alert for budget ${budget.id}...`);
            await sendEmail({
              to: budget.user.email,
              subject: `Budget Alert for ${defaultAccount.name}`,
              react: EmailTemplate({
                userName: budget.user.name,
                type: "budget-alert",
                data: {
                  percentageUsed,
                  budgetAmount: parseInt(budgetAmount).toFixed(1),
                  totalExpenses: parseInt(totalExpenses).toFixed(1),
                  accountName: defaultAccount.name,
                },
              }),
            });

            // Update last alert sent
            await db.budget.update({
              where: { id: budget.id },
              data: { lastAlertSent: new Date() },
            });
            console.log(`Alert sent and updated for budget ${budget.id}`);
          }
        });
      }
    } catch (error) {
      console.error("Error in checkBudgetAlerts function:", error);
      throw error; // Re-throw the error to ensure it is logged by Inngest
    }
  }
);

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

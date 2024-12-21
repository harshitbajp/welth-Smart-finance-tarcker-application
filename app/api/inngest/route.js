import { inngest } from "@/lib/inngest/client";
import { checkBudgetAlerts } from "@/lib/inngest/functions";
import { serve } from "inngest/next";


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlerts, // <-- This is where you'll always add all your functions
  ],
});

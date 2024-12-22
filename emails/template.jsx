import {
  Body,
  Button,
  Container,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

export default function EmailTemplate({
  userName = "Harshit",
  type = "budget-alert",
  data = {
    percentageUsed: 85,
    budgetAmount: 4000,
    totalExpenses: 3400,
    accountName: "Personal",
  },
}) {
  if (type === "monthly-report") {
  }
  if (type === "budget-alert") {
  }
  return (
    <Html>
      <head>
        <Preview>Budget Alert for {data.accountName}</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Heading style={styles.title}>Budget Alert</Heading>
            <Text style={styles.text}>
              You have used {data.percentageUsed}% of your budget of $
              {data.budgetAmount} for {data.accountName}. You have spent $
              {data.totalExpenses} so far.
            </Text>
            <Section style={styles.statsContainer}>
              <div style={styles.stat}>
                <Text style={styles.text}>Amount</Text>
                <Text style={styles.heading}>${data.budgetAmount}</Text>
              </div>
              <div style={styles.stat}>
                <Text style={styles.text}>Spent So Far</Text>
                <Text style={styles.heading}>${data.totalExpenses}</Text>
              </div>

              <div style={styles.stat}>
                <Text style={styles.text}>Remaining</Text>
                <Text style={styles.heading}>
                  ${data?.budgetAmount - data?.totalExpenses}
                </Text>
              </div>
            </Section>
          </Container>
        </Body>
      </head>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily: "-apple-system, sans-serif",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "5px",
    margin: "0 auto",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    color: "#1f2937",
    fontSize: "32px",
    fontWeight: "bold",
    margin: "0 0 20px",
    textAlign: "center",
  },

  heading: {
    color: "#1f2937",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 016px",
  },
  text: {
    color: "#4b5563",
    fontSize: "16px",
    margin: "0 0 10px",
  },

  statsContainer: {
    margin: "32px 0",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: "5px",
  },
  stat: {
    marginBotton: "16px",
    padding: "12px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
};

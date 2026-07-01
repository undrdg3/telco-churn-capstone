# Executive Summary — Telco Customer Churn & Billing

## The question

Using data from 7,043 customers of a telecom company, we asked two things:

1. **Which customers are likely to cancel their service (churn)?**
2. **What should a customer's monthly bill be, given the services they've signed up for?**

## What we found

**On churn:** about 1 in 4 customers in this dataset had churned. The single biggest driver of
churn is **how the customer is billed and how long they've been a customer**:

- Customers on **month-to-month contracts** churn far more often than customers locked into
  1- or 2-year contracts.
- **New customers churn the most** — churn risk is highest in the first few months and drops off
  sharply the longer someone stays.

Our best model correctly separates likely churners from likely stayers meaningfully better than
guessing "nobody churns" (which would look 73.5% accurate but never actually catch a single
churner). It is a genuinely useful early-warning signal, though not perfect — it should support a
retention team's judgment, not replace it.

**On billing:** a customer's monthly bill is almost entirely explained by which services they've
signed up for (internet type, add-ons like tech support or streaming, and contract type). Given a
customer's plan, our model predicts their expected bill very precisely — useful as an automatic
sanity check to flag accounts that are being billed unusually high or low for their plan (which
could indicate a billing error or an undocumented discount), but it should not be used to set
prices unsupervised, since it has no visibility into promotions or negotiated rates.

## What we recommend

1. **Target retention efforts at new, month-to-month customers.** This is where churn risk
   concentrates, and it's a segment the company can act on directly (e.g., incentivize longer
   contracts early, or increase engagement in the first few months).
2. **Use the churn model as a triage tool**, not an automatic decision-maker — flag at-risk
   customers for a human to review and reach out to.
3. **Use the billing model as a pricing sanity-check**, not a pricing-setting tool — investigate
   accounts where actual billing deviates meaningfully from the model's expectation.
4. **Don't oversell either model.** The churn model is a meaningful, real improvement over
   guessing — not a crystal ball. The billing model is very accurate because this company's
   pricing is already fairly systematic, not because it uncovered anything hidden.

# 💰 Finsight AI — Smart Finance Tracker

Finsight AI is an **AI-powered personal finance tracker** built with **Next.js**.  
It helps you **manage budgets, track transactions, monitor accounts, and scan receipts** with AI assistance.  
The app detects **recurring transactions**, sends **budget alerts**, and automatically generates **monthly reports**.  

Built with **Next.js**, **MongoDB**, **Inngest** (for automation), and **Clerk** (for secure authentication).

---

## 🌐 Live Demo

🔗 **Live Site:** [https://finsight-ivory.vercel.app/](https://finsight-ivory.vercel.app/)  
---

## 🚀 Features

### 💵 Financial Management
- **Budget Tracking** – Create and monitor personal or shared budgets.
- **Transaction Logging** – Record income and expenses with smart categorization.
- **Account Management** – Manage multiple financial accounts (banks, wallets, etc.).
- **Receipt Scanning (AI OCR)** – Upload or scan receipts; auto-extract details via OCR and AI.

### 🔁 Automation
- **Recurring Transaction Detection** – Automatically find repeating transactions and alert users.
- **Monthly Budget Reports** – Automated reports via Inngest jobs.
- **AI Spending Insights** – Personalized summaries and suggestions based on spending patterns.

### 🔒 Authentication
- **Clerk Integration** – Secure user authentication and session management.
- Supports social logins (Google, Apple, GitHub).

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 15 (App Router) + React 19 |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Backend** | Next.js API Routes + Inngest Functions |
| **Database** | MongoDB (via Mongoose) |
| **Authentication** | Clerk |
| **Automation & Jobs** | Inngest |
| **AI & OCR** | OpenAI API + Tesseract / OCR.space |
| **Deployment** | Vercel |

---
## 📸 Screenshots

### 🏠 Dashboard
![Dashboard Screenshot](./public/screenshots/dashboard.png)

### 📊 Reports
![Reports Screenshot](./public/screenshots/reports.png)

### 🧾 Receipt Scanner
![Receipt Scanner Screenshot](./public/screenshots/receipt-scanner.png)


## ⚙️ Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yashwaje776/AI-Finance-Tracker/
cd finsight

Install Dependencies
npm install

Set Up Environment Variables

Create a .env.local file in the root directory:

Run the Development Server
npm run dev


Now open your browser and visit:
👉 http://localhost:3000

Inngest Workflows
Workflow	Description	Schedule
detectRecurringTransactions	Finds recurring expenses & notifies users	Daily
sendMonthlyReport	Generates and emails monthly reports	Monthly
budgetAlertTrigger	Alerts users when budgets are exceeded	On event



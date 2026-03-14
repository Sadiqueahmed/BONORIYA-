# Bonoriya Restaurant Website


# 🌸 Bonoriya

**A Modern Full-Stack Web Application**

Bonoriya is a high-performance web platform built with a focus on user experience, secure authentication, and scalable database management.

---

## ✨ Features

* 🔐 **Secure Authentication:** Integrated with Clerk for seamless social login and session management.
* 📱 **Responsive Design:** Fully optimized for all screen sizes using Tailwind CSS.
* 🗄️ **Relational Database:** Powered by Vercel Postgres and managed through Prisma ORM for type-safe queries.
* ⚡ **Server-Side Rendering:** Leveraging Next.js App Router for optimal SEO and speed.
* 🎨 **Modern UI:** Interactive components built with Radix UI and Lucide icons.

---

## 🛠️ Tech Stack

| Category | Technology |
| --- | --- |
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS / Shadcn UI |
| **Authentication** | Clerk |
| **Database** | Vercel Postgres / Neon |
| **ORM** | Prisma |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18.x or later
* A Clerk account for API keys
* A Postgres database (local or cloud)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Sadiqueahmed/BONORIYA-.git
cd BONORIYA-

```


2. **Install dependencies:**
```bash
npm install

```


3. **Set up Environment Variables:**
Create a `.env` file in the root directory and add your credentials:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_pub_key
CLERK_SECRET_KEY=your_sec_key
DATABASE_URL=your_postgres_url
DIRECT_DATABASE_URL=your_direct_url

```


4. **Initialize Database:**
```bash
npx prisma db push
npx prisma generate

```


5. **Run the development server:**
```bash
npm run dev

```



---

## 📂 Project Structure

```text
├── app/              # Next.js App Router (Pages, Layouts, API)
├── components/       # Reusable UI components
├── lib/              # Utility functions and Shared logic
├── prisma/           # Database schema and Seed files
├── public/           # Static assets (Images, Fonts)
└── types/            # TypeScript type definitions

```

---

## 🛡️ Security

This project uses **Clerk** for authentication and follows best practices for environment variable management to ensure user data remains secure.

---

## 👨‍💻 Author

**Sadique Ahmed**

* GitHub: [@Sadiqueahmed](https://www.google.com/search?q=https://github.com/Sadiqueahmed)
* Portfolio: [Visit My Portfolio](https://www.google.com/search?q=https://github.com/Sadiqueahmed)

---

⭐ *If you find this project helpful, please consider giving it a star!*

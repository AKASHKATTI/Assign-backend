```markdown
# Assign Backend 🚀
### *AI-Powered CSV Importer Application*

This is the backend service for the **AI-Powered CSV Importer**. Built on the MERN ecosystem, this REST API securely handles multipart CSV uploads, leverages the **Google Gemini API** for intelligent column schema mapping, validates data integrity using **Zod**, and processes records for asynchronous storage in **MongoDB**.

---

## 🛠️ Tech Stack & Architecture

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB via Mongoose ORM
* **AI Integration:** Google Gemini API (`@google/generative-ai`)
* **Data Parsing & Validation:** PapaParse & Zod
* **Security & Operations:** Helmet, CORS, Express Rate Limit, Multer (File Handling)

### 📂 Project Structure

```text
backend/
├── config/          # Database connection & environment setups
├── controllers/     # Route handlers & request/response logic
├── middleware/      # Auth, Multer upload, Rate limiting, Error handlers
├── models/          # Mongoose schemas (e.g., ImportedData, MappingLog)
├── routes/          # Express route definitions
├── services/        # Business logic & Google Gemini API integrations
├── utils/           # Helper functions & Zod validation schemas
├── index.js         # Application entry point
├── package.json     # Dependencies and scripts
└── README.md        # Documentation

```

---

## ⚙️ Getting Started

### Prerequisites

* Node.js (v18+ recommended)
* MongoDB instance (Local or Atlas)
* Google Gemini API Key

### Installation

1. **Clone the repository:**
```bash
git clone [https://github.com/AKASHKATTI/Assign-backend.git](https://github.com/AKASHKATTI/Assign-backend.git)
cd Assign-backend

```


2. **Install dependencies:**
```bash
npm install

```


3. **Configure Environment Variables:**
Create a `.env` file in the root directory and populate it with your credentials:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLIENT_CONNECTION=http://localhost:3000
GEMINI_API_KEY=your_api_key

```


4. **Spin up the server:**
```bash
# Production mode
node index.js

# Development mode (if nodemon is configured)
npm run dev

```


The server will be live at `http://localhost:5000`.

---

## 🔌 API Reference

### Health Check

```http
GET /

```

* **Description:** Verifies that the server is online and operational.
* **Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Hello World!"
}

```



### Process CSV Import

```http
POST /api/import

```

* **Description:** Accepts a multipart form containing a CSV file. Parses the headers, passes them to Google Gemini for structural alignment with target schemas, validates data contents against explicit Zod definitions, and commits valid entries to the database.
* **Content-Type:** `multipart/form-data`
* **Request Body:**
* `file`: `Required (Binary CSV file)`


* **Success Response:** `200 OK` / `201 Created`

---

## 🔒 Security & Optimization

To ensure production-grade resilience, the following layers are embedded out of the box:

* **Helmet:** Secures Express apps by setting various HTTP response headers.
* **CORS:** Configured explicitly to restrict cross-origin access to the designated `CLIENT_CONNECTION`.
* **Rate Limiting:** Protects resource-heavy endpoints (like AI mapping routes) from brute-force or DDoS vectors.
* **Robust Error Handling:** Global middleware catches syntax errors, validation failures, or unhandled promise rejections seamlessly without crashing the process.

---

## 🚀 Deployment

This service is fully containerized-ready and structurally streamlined to easily deploy across cloud application hosting providers:

* **Render** (Native Node.js Web Services)
* **Railway**
* **Fly.io**

---

## 📄 License

This project is licensed under the **MIT License**.

---

**Author:** [Akash Katti](https://www.google.com/search?q=https://github.com/AKASHKATTI)

*Crafting efficient full-stack solutions with AI-native workflows.*

```

```

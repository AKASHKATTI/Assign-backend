
### *AI-Powered CSV Importer Application* 
 ### *Backend*

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

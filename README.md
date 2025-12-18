markdown
# Movie Dashboard

A full‑stack Movie Dashboard application built with React (frontend) and Node/Express (backend), using **Neo4j** as the database. It displays movies, allows CRUD operations, and demonstrates integration between frontend and backend services.

🎥 **Working Demo (Loom Video):**  
👉 https://www.loom.com/share/1d1203636717425388bba9b87d7947e5

---

## 🚀 Overview

This project is a movie dashboard that lets users:

- View a list of movies
- Add new movies
- Edit or delete existing movies
- Interact with a backend API connected to a Neo4j database

The frontend is built using **React**, the backend is a **Node.js + Express** API, and **Neo4j** is used for data persistence.

---

## 🧱 Tech Stack

**Frontend**
- React
- CSS / Tailwind (optional)
- Axios (for API calls)

**Backend**
- Node.js
- Express
- REST API
- Neo4j Database (graph database)

---

## 📦 Installation

1. **Clone the repo**

```bash
git clone https://github.com/ankurm9/movie-dashboard.git
cd movie-dashboard
````

2. **Install dependencies**

> 📌 *If there are separate frontend & backend folders, install in each:*

```bash
# Root (if combined)
npm install

# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

3. **Set up Neo4j**

* Install Neo4j Desktop or use a cloud instance.
* Create a database.
* Add connection details in your backend `.env` file:

```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

4. **Run the application**

```bash
# Backend
npm run dev

# Frontend
npm start
```

The app should open at `http://localhost:3000`.

---

## 📁 Folder Structure

```
movie-dashboard/
├── backend/        # API server (Node.js + Express + Neo4j)
├── frontend/       # React app
├── .gitignore
├── package.json
└── README.md
```

---

## 📹 Demo

Watch the working demo here:
**[https://www.loom.com/share/YOUR_LOOM_VIDEO_LINK](https://www.loom.com/share/YOUR_LOOM_VIDEO_LINK)**

---

## ⭐ Contributing

PRs and issues are welcome! If you find bugs or want to add features, feel free to submit a pull request.

---

## 📄 License

This project is open‑source and available under the MIT License.

```

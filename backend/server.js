const express = require("express");
const neo4j = require("neo4j-driver");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

app.get("/movies", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (m:Movie)
      RETURN m
      ORDER BY m.rating DESC, m.revenue DESC
    `);

    const movies = result.records.map(r => r.get("m").properties);
    res.json(movies);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching movies...");
  } finally {
    await session.close();
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

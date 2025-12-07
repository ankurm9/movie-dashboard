const fs = require("fs");
const csv = require("csv-parser");
const dotenv = require("dotenv");
const neo4j = require("neo4j-driver");

dotenv.config();

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
const session = driver.session();

async function importMovies() {
  const results = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream("movies.csv")
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Loaded ${results.length} movies from CSV`);

  for (const row of results) {
    try {
      const actors = row.Actors ? row.Actors.split("|").map((a) => a.trim()) : [];

      await session.executeWrite(async (tx) => {
        await tx.run(
          `
          MERGE (m:Movie {title: $title})
          SET m.genre = $genre,
              m.description = $description,
              m.year = $year,
              m.runtime = $runtime,
              m.rating = $rating,
              m.votes = $votes,
              m.revenue = $revenue,
              m.metascore = $metascore
          MERGE (d:Director {name: $director})
          MERGE (d)-[:DIRECTED]->(m)
          WITH m
          UNWIND $actors AS actorName
          MERGE (a:Actor {name: actorName})
          MERGE (a)-[:ACTED_IN]->(m)
          `,
          {
            title: row.Title,
            genre: row.Genre || null,
            description: row.Description || null,
            year: row.Year ? Number(row.Year) : null,
            runtime: row.Runtime ? Number(row.Runtime) : 0,
            rating: row.Rating ? Number(row.Rating) : null,
            votes: row.Votes ? Number(row.Votes) : null,
            revenue: row.Revenue ? Number(row.Revenue) : 0,
            metascore: row.Metascore ? Number(row.Metascore) : null,
            director: row.Director || null,
            actors,
          }
        );
      });

      console.log(`Imported: ${row.Title}`);
    } catch (err) {
      console.error(`Error importing ${row.Title}:`, err.message);
    }
  }

  await session.close();
  await driver.close();
  console.log("Import completed successfully!");
}

importMovies();

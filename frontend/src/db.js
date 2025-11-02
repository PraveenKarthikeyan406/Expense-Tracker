const { MongoClient } = require("mongodb");

const uri = "";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");

    const databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

  } catch (err) {
    console.error(" Connection failed:", err);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);

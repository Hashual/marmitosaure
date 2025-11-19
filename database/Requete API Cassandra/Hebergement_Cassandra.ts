import { DataAPIClient } from "@datastax/astra-db-ts";

// Initialize the client
const client = new DataAPIClient('AstraCS:HRWcKnryqRSMrZqHIgpqaZWf:f07bb8c11326362093ab0f53dd374baaecb2fbef72348f52a4fd0013f67a0de8');
const db = client.db('https://7c54ee1c-ff64-4897-92f5-4c86a8c9b7ae-us-east-2.apps.astra.datastax.com');

(async () => {
  const colls = await db.listCollections();
  console.log('Connected to AstraDB:', colls);
})();


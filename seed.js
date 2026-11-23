const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { MongoClient } = require('mongodb');

const kittens = [
    {
        title: "Kitten 4",
        image: "images/kitten-4.jpg",
        link: "About Kitten 4-seed",
        description: "A playful kitten who loves chasing toys."
    },
    {
        title: "Kitten 5",
        image: "images/kitten-5.jpg",
        link: "About Kitten 5 seed",
        description: "A friendly kitten who enjoys cuddles."
    },
    {
        title: "Kitten 6 seed",
        image: "images/kitten-6-seed.jpg",
        link: "About Kitten 3",
        description: "A curious kitten who loves exploring."
    }
];

async function seed() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing from .env");
    }

    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();

        const database = client.db();
        const pets = database.collection("pets");

        const result = await pets.insertMany(kittens);

        console.log(`Database: ${database.databaseName}`);
        console.log(`${result.insertedCount} kittens inserted.`);
    } finally {
        await client.close();
    }
}

seed().catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
});
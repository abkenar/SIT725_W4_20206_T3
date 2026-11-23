var express = require("express")
var app = express()
var port = process.env.port || 3004
const mongoose = require('mongoose');
// Middleware
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
mongoose.connect('mongodb://127.0.0.1:27017/myDB');
mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});
// 2. Define your schema and model
const PetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3
    },
    image: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 500
    }
});
const Pet = mongoose.model('Pet', PetSchema);
// 3. REST API route
app.get('/api/pets', async (req, res) => {
    const pets = await Pet.find({});
    res.json({ statusCode: 200, data: pets, message: 'Success' });
});

app.post('/api/pets', async (req, res) => {
    try {
        // Allowlist: only keep fields we expect
        const { title, image, link, description } = req.body;
        const pet = new Pet({
            title, image, link,
            description
        });
        await pet.save(); // schema validation runs here
        res.status(201).json({
            statusCode: 201,
            message: "Pet created successfully",
            data: pet
        });
    } catch (err) {
        res.status(400).json({
            statusCode: 400,
            message: err.message
        });
    }
});

// 4. Start server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
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
        required: [true, 'Title is required'],
        minlength: [5, 'Title must contain at least 5 characters']
    },
    image: String,
    link: String,
    description: String
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

app.patch('/api/pets', async (req, res) => {
    try {
        const { id, title, image, link, description } = req.body;

        if (!mongoose.isObjectIdOrHexString(id)) {
            return res.status(400).json({
                message: 'A valid pet ID is required'
            });
        }

        // Include only the fields supplied by the client.
        const updates = {};

        if (title !== undefined) updates.title = title;
        if (image !== undefined) updates.image = image;
        if (link !== undefined) updates.link = link;
        if (description !== undefined) updates.description = description;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'Provide at least one field to update'
            });
        }

        const pet = await Pet.findOneAndUpdate(
            { _id: id },          // Select one pet
            { $set: updates },    // Change only supplied fields
            {
                runValidators: true, // Enforce schema validation
                new: true            // Return the updated document
            }
        );

        if (!pet) {
            return res.status(404).json({
                message: 'Pet not found'
            });
        }

        res.status(200).json({
            statusCode: 200,
            data: pet,
            message: 'Pet updated successfully'
        });
    } catch (error) {
        if (
            error.name === 'ValidationError' ||
            error.name === 'CastError'
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error(error);
        res.status(500).json({
            message: 'Unable to update pet'
        });
    }
});

// 4. Start server
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
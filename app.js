import express from "express";
import multer from "multer";
import csvtojson from "csvtojson";
import fs from "fs";

const app = express();
const PORT = 3000;

// Set up Multer for file uploads
const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

// Define Standard Database Fields
const standardFields = {
    id: "id",
    first_name: "first_name",
    middle_name: "middle_name",
    last_name: "last_name",
    phone_number: "phone_number",
    address_line_1: "address_line_1",
    address_line_2: "address_line_2",
    state: "state",
    pin_code: "pin_code",
    country: "country",
};

// Define Different CSV Format Mappings
const columnMappings = {
    format1: {
        f_name: "first_name",
        l_name: "last_name",
        mobile: "phone_number",
        address: "address_line_1",
        state: "state",
        postal_index_code: "pin_code",
        country: "country",
    },
    format2: {
        firstname: "first_name",
        middlename: "middle_name",
        lastname: "last_name",
        phoneNumber: "phone_number",
        address: "address_line_1",
        state: "state",
        pin: "pin_code",
        country: "country",
    },
};

// Function to map CSV columns to standard format
const mapToStandardFormat = (data, mapping) => {
    return data.map((row) => {
        let newRow = {};

        // Apply mapping
        Object.keys(row).forEach((csvColumn) => {
            const standardColumn = mapping[csvColumn]; // Map CSV column to standard field
            if (standardColumn) {
                newRow[standardColumn] = row[csvColumn];
            }
        });

        // Ensure all standard fields exist in JSON
        Object.keys(standardFields).forEach((field) => {
            if (!newRow[field]) {
                newRow[field] = ""; // Default empty if missing
            }
        });

        return newRow;
    });
};

// Handle file upload and CSV processing
app.post("/upload", upload.single("csvFile"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        // Convert CSV to JSON
        const jsonArray = await csvtojson().fromFile(req.file.path);

        // Guess format based on columns
        let detectedFormat = null;
        Object.keys(columnMappings).forEach((format) => {
            const mappingKeys = Object.keys(columnMappings[format]);
            if (mappingKeys.every((col) => jsonArray[0].hasOwnProperty(col))) {
                detectedFormat = format;
            }
        });

        if (!detectedFormat) {
            return res.status(400).json({ error: "Unknown CSV format" });
        }

        // Transform data to standard format
        const transformedData = mapToStandardFormat(
            jsonArray,
            columnMappings[detectedFormat]
        );

        // Cleanup
        fs.unlinkSync(req.file.path);

        res.json(transformedData);
    } catch (error) {
        console.error("Error processing CSV:", error);
        res.status(500).json({ error: "Error processing CSV file" });
    }
});

app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);

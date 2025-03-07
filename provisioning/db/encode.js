const fs = require('fs');

// Run this file using: node encode.js
const data = [
    {
        title: "some title",
        description: "some description",
        category: ["Strings", "Algorithms"],
        complexity: "Easy",
        createdAt: new Date(),
        modifiedAt: new Date()
    }
];

const encodedData = data.map(q => ({
    title: Buffer.from(q.title).toString('base64'),
    description: Buffer.from(q.description).toString('base64'),
    category: q.category,
    complexity: q.complexity,
    createdAt: q.createdAt,
    modifiedAt: q.modifiedAt
}));

fs.writeFileSync('encoded.json', JSON.stringify(encodedData, null, 2), 'utf8');
console.log("Encoded data saved to encoded.json file.");

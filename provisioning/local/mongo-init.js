db = db.getSiblingDB('peerprep-g02');

db.createCollection('usermodel');
db.usermodel.insertMany([
    {
        username: "adminuser",
        email: "email@domain.com",
        password: "$2b$10$0Pjjg1JWlOUVhX5LKzLEyOEe7oyY8yh4jVyDLn2EPWryMSwOQkegu",
        isAdmin: true,
        createdAt: new Date(),
    }
]);

db.usermodel.createIndex({ username: 1 }, { unique: true });

print("Users successfully initialized");

db.createCollection('questionmodel');
db.questionmodel.insertMany([
    {
        title: "This is where i would seed in 20 question if this repo wasn't PUBLIC",
        description: "Are the questions really copyrighted?",
        category: ["strings", "algorithms"],
        complexity: "easy",
        createdAt: new Date(1740669363288),
        modifiedAt: new Date(1740669363288)
    }
]);

print("Questions successfully initialized");

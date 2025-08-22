// Tests/auth.test.js
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server"); // ✅ Express app
require("dotenv").config({ path: ".env.test" });
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const path = require("path");

let token = "";
let userId = "";

beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI_TEST;
  if (!mongoUri) throw new Error("MONGO_URI_TEST is not defined in .env.test");

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// ========================
// Register
// ========================
describe("Auth - Register", () => {
  it("TC001: should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test1@mail.com",
      password: "Pass@123",
      role: "user",
      userName: "TestUser",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User created successfully");
    expect(res.body.user).toHaveProperty("email", "test1@mail.com");
    userId = res.body.user.id;
  });

  it("TC002: should not register a user with duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "test1@mail.com",
      password: "Pass@123",
      role: "user",
      userName: "DupUser",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/User already exists/i);
  });

  it("TC003: should fail when fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "onlyemail@mail.com",
    });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty("message");
  });
});

// ========================
// Login
// ========================
describe("Auth - Login", () => {
  it("TC004: should login successfully", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test1@mail.com",
      password: "Pass@123",
      role: "user",
      browser: "Chrome",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  it("TC005: should reject login with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test1@mail.com",
      password: "WrongPass",
      role: "user",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  });

  it("TC006: should reject login with wrong role", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test1@mail.com",
      password: "Pass@123",
      role: "Admin",
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Unauthorized role/i);
  });

  it("TC007: should reject login with non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "noone@mail.com",
      password: "Pass@123",
      role: "user",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/User not found/i);
  });
});

// ========================
// Users
// ========================
describe("Users CRUD", () => {
  let crudToken = "";
  let crudUserId = "";

  beforeAll(async () => {
    const newUser = {
      email: `cruduser_${Date.now()}@mail.com`,
      password: "Pass@123",
      role: "user",
      userName: "CrudUser",
    };
    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(newUser);
    crudUserId = registerRes.body.user.id;

    const loginRes = await request(app).post("/api/auth/login").send({
      email: newUser.email,
      password: newUser.password,
      role: "user",
    });
    crudToken = loginRes.body.token;
  });

  it("TC008: should get all users", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${crudToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("TC009: should update a user", async () => {
    const res = await request(app)
      .put(`/api/users/${crudUserId}`)
      .set("Authorization", `Bearer ${crudToken}`)
      .send({ email: "updatedcrud@mail.com", role: "Admin" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/User updated successfully/i);
  });

  it("TC010: should return 404 when updating non-existent user", async () => {
    const res = await request(app)
      .put(`/api/users/64b91cd9f111111111111111`)
      .set("Authorization", `Bearer ${crudToken}`)
      .send({ email: "ghost@mail.com" });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/User not found/i);
  });

  it("TC011: should delete a user", async () => {
    const res = await request(app)
      .delete(`/api/users/${crudUserId}`)
      .set("Authorization", `Bearer ${crudToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/User deleted successfully/i);
  });

  it("TC012: should return 404 when deleting non-existent user", async () => {
  const fakeUser = { _id: "1234567890abcdef12345678" }; // எந்த Mongo ObjectId மாதிரி string
  const token = jwt.sign({ userId: fakeUser._id }, process.env.JWT_SECRET);

  const res = await request(app)
    .delete("/users/doesnotexistid")  // non-existent user id
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(404);
});

});

// ========================
// Logout
// ========================
describe("Auth - Logout", () => {
  it("TC013: should logout successfully", async () => {
    const newUser = {
      email: "logout@mail.com",
      password: "Pass@123",
      userName: "LogoutUser",
      role: "user",
    };

    await request(app).post("/api/auth/register").send(newUser);

    const loginRes = await request(app).post("/api/auth/login").send({
      email: newUser.email,
      password: newUser.password,
      role: "user",
    });

    const newToken = loginRes.body.token;

    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${newToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Logged out successfully/i);
  });

  it("TC014: should fail logout with invalid token", async () => {
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", "Bearer invalidtoken123");

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body.message).toMatch(/Invalid or expired token/i);
  });
});

// ========================
// Profile Image
// ========================
describe("Profile Image", () => {
  let profileToken = "";
  let profileUserId = "";
  let profileImageFilename = "";

  beforeAll(async () => {
    const newUser = {
      email: `profileuser_${Date.now()}@mail.com`,
      password: "Pass@123",
      role: "user",
      userName: "ProfileUser",
    };
    const registerRes = await request(app).post("/api/auth/register").send(newUser);
    profileUserId = registerRes.body.user.id;

    const loginRes = await request(app).post("/api/auth/login").send({
      email: newUser.email,
      password: newUser.password,
      role: "user",
    });
    profileToken = loginRes.body.token;
  });



  it("TC015: should return 404 for a non-existent profile image", async () => {
    const res = await request(app)
      .get("/api/users/profile-image/nonexistentfile123.jpg")
      .set("Authorization", `Bearer ${profileToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Image not found/i);
  });
});

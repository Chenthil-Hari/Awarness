import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(req) {
  try {
    const { name, email, password, username } = await req.json();

    if (!name || !email || !password || !username) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection("users");

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Sanitize and check username
    const sanitizedUsername = username.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
    if (sanitizedUsername.length < 3) {
      return NextResponse.json({ error: "Username too short" }, { status: 400 });
    }

    const usernameExists = await usersCollection.findOne({ username: sanitizedUsername });
    if (usernameExists) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await usersCollection.insertOne({
      name,
      email,
      username: sanitizedUsername,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Send welcome email (async - don't block response)
    try {
      await sendWelcomeEmail(email, name);
    } catch (mailError) {
      console.error("Failed to send welcome email:", mailError);
      // We don't fail the signup if the email fails, but we log it
    }

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Signup error details:", {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    // Check for common MongoDB connection errors
    if (error.name === 'MongoServerSelectionError' || error.name === 'MongoNetworkError') {
      return NextResponse.json({ 
        error: "Database connection failed. Ensure your IP is whitelisted in MongoDB Atlas." 
      }, { status: 500 });
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

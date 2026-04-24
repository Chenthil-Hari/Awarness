import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/mail";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
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

    // Generate unique username
    let baseUsername = name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
    let username = baseUsername;
    while (await usersCollection.findOne({ username })) {
      username = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await usersCollection.insertOne({
      name,
      email,
      username,
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

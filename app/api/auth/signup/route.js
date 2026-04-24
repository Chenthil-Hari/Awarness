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

    // Generate unique username AUTOMATICALLY
    let baseUsername = name.toLowerCase().replace(/\s+/g, '_').replace(/[^\w]/g, '');
    let username = baseUsername;
    let count = 0;
    while (await usersCollection.findOne({ username }) && count < 10) {
      username = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
      count++;
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
    }

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Signup error details:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

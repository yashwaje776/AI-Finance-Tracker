import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(req) {
  try {

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "Invalid or missing file" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    const prompt = `
      Analyze this receipt image and extract the following details in **strict JSON format**:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      Only return JSON — no extra text or formatting.
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      { inlineData: { data: base64Image, mimeType: file.type } },
      prompt,
    ]);

    const text = result.response.text();

    const cleaned = text.replace(/```json|```/g, "").trim();

    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid response format from Gemini" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

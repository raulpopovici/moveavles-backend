import { Request, Response } from "express";
import axios from "axios";

export const askAI = async (req: Request, res: Response) => {
  const { message, product } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", 
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for a furniture online store. You help users with product info and availability.",
          },
          {
            role: "system",
            content: `Product Info:\nName: ${product.name}\nDescription: ${product.description}\nStock: ${product.quantity}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply = response.data.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("OpenAI error:", error.response?.data || error.message);
    return res.status(500).json({ error: "AI service is currently unavailable." });
  }
};

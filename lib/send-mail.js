"use server";

import nodemailer from "nodemailer";
import { render } from "@react-email/render"; 

export async function sendEmail({ to, subject, react }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const html = await render(react);

    const mailOptions = {
      from: `"Finance App" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html, 
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, info };
  } catch (error) {
    return { success: false, error };
  }
}

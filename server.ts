import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/alert", async (req, res) => {
    const { device, time } = req.body;
    
    // Check environment variables
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
      console.warn("SMTP credentials missing, skipping email alert.");
      return res.status(200).json({ success: true, message: "SMTP config missing, alert skipped" });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: `"Gudangku System" <${user}>`,
        to: "mohamadrizkiheriyana1@gmail.com",
        subject: "SECURITY ALERT: New Device Login",
        text: `System Alert: A new device (${device}) has accessed the Gudangku Control Center at ${time}.`
      });
      
      res.json({ success: true });
    } catch (error: any) {
      if (error.message && error.message.includes('Application-specific password required')) {
        console.warn("Email alert skipped: Application-specific password required. Please use a 16-character Google App Password for SMTP_PASS, not your regular Gmail password.");
      } else {
        console.warn("Email error:", error.message || error);
      }
      // Return 200 so the frontend doesn't show an unhandled promise rejection error on the client side
      res.status(200).json({ success: false, error: "Failed to send email due to SMTP auth." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

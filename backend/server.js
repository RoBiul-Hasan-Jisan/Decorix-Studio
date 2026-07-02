// ----------------------
// CORS Configuration
// ----------------------
const allowedOrigins = [
  "http://localhost:3000",
  "https://decorix-studio.vercel.app",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.trim());
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin (Postman, curl, server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      // Exact match
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments for this project
      if (/^https:\/\/decorix-studio.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked CORS Origin:", origin);

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());
import { handle } from "hono/vercel";
import app from "../server/boot.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handle(app);

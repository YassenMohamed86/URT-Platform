import { handle } from "hono/vercel";
import app from "./boot";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handle(app);

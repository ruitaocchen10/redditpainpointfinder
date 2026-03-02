import { serve } from "inngest/next";
import { inngest } from "../../../lib/inngest/client";
import { analyzeReddit } from "../../../lib/inngest/functions/analyzeReddit";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [analyzeReddit],
});

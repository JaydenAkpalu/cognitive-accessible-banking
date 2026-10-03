import { Router, type IRouter } from "express";
import {
  ExplainBankingContextBody,
  ExplainBankingContextResponse,
} from "@workspace/api-zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { buildAssistantSystemPrompt } from "./assistant-prompt";

const router: IRouter = Router();

router.post("/assistant/explain", async (req, res) => {
  const parsed = ExplainBankingContextBody.safeParse(req.body);

  if (!parsed.success) {
    req.log.warn(
      {
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          code: issue.code,
        })),
      },
      "[AI API] Invalid request body",
    );
    res.status(400).json({ error: "Please enter a valid question." });
    return;
  }

  const { question, context, preferences } = parsed.data;
  req.log.info(
    {
      page: context.page,
      mode: context.mode,
      questionReceived: Boolean(question.trim()),
      contextReceived: Boolean(context),
    },
    "[AI API] Request received",
  );
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-terra",
      max_completion_tokens: 300,
      messages: [
        {
          role: "system",
          content: buildAssistantSystemPrompt({
            mode: context.mode,
            preferences,
          }),
        },
        {
          role: "user",
          content: JSON.stringify({ question, context }),
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content?.trim();

    if (!answer) {
      throw new Error("The model returned an empty answer.");
    }

    const result = ExplainBankingContextResponse.parse({ answer });
    req.log.info(
      { page: context.page, answerReceived: true, answerLength: answer.length },
      "[AI API] Provider response parsed",
    );
    res.json(result);
  } catch (error) {
    req.log.error(
      { message: error instanceof Error ? error.message : "Unknown assistant provider error" },
      "Assistant explanation failed",
    );
    res.status(502).json({
      error: "I couldn't answer that right now. Try again, or ask about the information currently shown on this page.",
    });
  }
});

export default router;
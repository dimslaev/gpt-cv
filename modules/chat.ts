import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ParsedChatCompletion } from "openai/resources/beta/chat/completions";
import {
  ChatCompletion,
  ChatCompletionCreateParamsBase,
} from "openai/resources/chat/completions";
import { z } from "zod";
import { MODEL_CONFIG } from "../lib/config";
import { Usage } from "../lib/interfaces";

export class Chat {
  private openai: OpenAI;

  constructor() {
    this.init();
  }

  private init(): void {
    this.openai = new OpenAI();
  }

  async complete({
    system,
    user,
    options,
  }: {
    system: string;
    user: string;
    options?: Omit<
      ChatCompletionCreateParamsBase,
      "model" | "stream" | "messages"
    >;
  }): Promise<ChatCompletion> {
    return await this.openai.chat.completions.create({
      model: MODEL_CONFIG.MODEL,
      max_tokens: MODEL_CONFIG.MAX_TOKENS,
      temperature: MODEL_CONFIG.TEMPERATURE,
      stream: false,
      ...options,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
  }

  async completeParsed<T>({
    system,
    user,
    schema,
    schemaName,
    options,
  }: {
    system: string;
    user: string;
    schema: z.ZodType;
    schemaName: string;
    options?: Omit<
      ChatCompletionCreateParamsBase,
      "model" | "stream" | "messages"
    >;
  }): Promise<ParsedChatCompletion<T>> {
    return await this.openai.beta.chat.completions.parse({
      model: MODEL_CONFIG.MODEL,
      max_tokens: MODEL_CONFIG.MAX_TOKENS,
      temperature: MODEL_CONFIG.TEMPERATURE,
      ...options,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: zodResponseFormat(schema, schemaName),
    });
  }

  getParsedContent<T>(completion: ParsedChatCompletion<T>): T {
    const result = completion.choices[0].message.parsed;
    if (!result) {
      throw new Error("completion.choices[0].message.parsed is null");
    }
    return result;
  }

  getContent(completion: ChatCompletion): string {
    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("completion.choices[0].message.content is null");
    }
    return result;
  }

  getUsage(completion: ChatCompletion | ParsedChatCompletion<unknown>): Usage {
    return {
      promptTokens: completion.usage?.prompt_tokens || 0,
      cachedPromptTokens:
        completion.usage?.prompt_tokens_details?.cached_tokens || 0,
      completionTokens: completion.usage?.completion_tokens || 0,
      totalTokens: completion.usage?.total_tokens || 0,
    };
  }
}

/**
 * Converts OpenAI chat request format to Claude CLI input
 */
const MODEL_MAP = {
    // Versioned model names
    "claude-opus-4-6": "opus",
    "claude-sonnet-4-6": "sonnet",
    "claude-haiku-4-5": "haiku",
    "claude-haiku-4-5-20251001": "haiku",
    // Unversioned model names
    "claude-opus-4": "opus",
    "claude-sonnet-4": "sonnet",
    "claude-haiku-4": "haiku",
    // With claude-code-cli provider prefix
    "claude-code-cli/claude-opus-4": "opus",
    "claude-code-cli/claude-sonnet-4": "sonnet",
    "claude-code-cli/claude-haiku-4": "haiku",
    // Aliases
    "opus": "opus",
    "sonnet": "sonnet",
    "haiku": "haiku",
};
/**
 * Extract Claude model alias from request model string
 */
export function extractModel(model) {
    // Try direct lookup
    if (MODEL_MAP[model]) {
        return MODEL_MAP[model];
    }
    // Try stripping provider prefix (claude-code-cli/ or claude-max-proxy/)
    const stripped = model.replace(/^(claude-code-cli|claude-max-proxy)\//, "");
    if (MODEL_MAP[stripped]) {
        return MODEL_MAP[stripped];
    }
    // Default to opus (Claude Max subscription)
    return "opus";
}
/**
 * Extract plain text from a message content value.
 * Handles both string content and OpenAI array content blocks
 * (e.g. [{type:"text", text:"hello"}, {type:"image_url", ...}]).
 */
function extractContent(content) {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content
            .filter((block) => block && block.type === "text")
            .map((block) => block.text || "")
            .join("\n");
    }
    return "";
}
/**
 * Convert OpenAI messages array to a single prompt string for Claude CLI
 *
 * Two modes:
 * - isFirstTurn=true (default): send full context (system + all messages)
 * - isFirstTurn=false: send only the last user message — session already has history
 */
export function messagesToPrompt(messages, isFirstTurn = true) {
    if (!isFirstTurn) {
        // Subsequent turn: Claude session already holds history, only send new message
        const lastUser = [...messages].reverse().find((m) => m.role === "user");
        return lastUser ? extractContent(lastUser.content) : "";
    }
    // First turn: send full context so Claude session is bootstrapped
    const parts = [];
    for (const msg of messages) {
        const text = extractContent(msg.content);
        switch (msg.role) {
            case "system":
                parts.push(`<system>\n${text}\n</system>\n`);
                break;
            case "user":
                parts.push(text);
                break;
            case "assistant":
                parts.push(`<previous_response>\n${text}\n</previous_response>\n`);
                break;
        }
    }
    return parts.join("\n").trim();
}
/**
 * Convert OpenAI chat request to CLI input format
 *
 * sessionOptions:
 *   isFirstTurn     — true for first message, false for subsequent (default: true)
 *   claudeSessionId — UUID to pass as --session-id (overrides request.user)
 */
export function openaiToCli(request, sessionOptions = {}) {
    const { isFirstTurn = true, claudeSessionId } = sessionOptions;
    return {
        prompt: messagesToPrompt(request.messages, isFirstTurn),
        model: extractModel(request.model),
        sessionId: claudeSessionId || request.user,
        isFirstTurn,
    };
}
//# sourceMappingURL=openai-to-cli.js.map
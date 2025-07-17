declare module "@vapi-ai/web" {
  export type VapiEventNames =
    | "call-start"
    | "call-end"
    | "transcript"
    | "error"
    | "message";

  export interface TranscriptData {
    speaker: "assistant" | "user";
    text: string;
  }

  export default class Vapi {
    constructor(apiKey: string);
    on(event: VapiEventNames, callback: (data: any) => void): void;
    start(assistantId: string): Promise<void>;
    stop(): Promise<void>;
  }
}

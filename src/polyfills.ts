import { Buffer } from "buffer";

(window as any).global = window;
(window as any).global.Buffer = Buffer;
(window as any).process = { env: {}} ;
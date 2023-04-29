export default interface Env {
  readonly USE_TOKENS: boolean;
  readonly USE_SCH: boolean;
  readonly USE_CNF: boolean;

  readonly BLOQS_TOKENS: KVNamespace;

  readonly TOKENS_ALLOWED_ORIGINS: string[];

  readonly TOKENS_PRESHARED_AUTH_HEADER_KEY: string;
  readonly TOKENS_PRESHARED_AUTH_HEADER_VALUE: string;

  readonly TOKENS_BASIC_USER: string;
  readonly TOKENS_BASIC_PASS: string;

  readonly BLOQS_CREDENTIALS: D1Database;
}

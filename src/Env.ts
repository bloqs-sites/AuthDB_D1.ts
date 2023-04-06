export default interface Env {
  readonly DB: D1Database;

  readonly PRESHARED_AUTH_HEADER_KEY: string;
  readonly PRESHARED_AUTH_HEADER_VALUE: string;

  readonly BASIC_USER: string;
  readonly BASIC_PASS: string;
}

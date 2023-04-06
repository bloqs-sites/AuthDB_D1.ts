import { handleRtrErr } from ".";
import Env from "./Env";

import { extractReq, headers } from "./utils";

/** The router that handles Requests */
export default class Router {
  #env: Env;
  #ctx: FetchEvent;

  constructor(env: Env, ctx: FetchEvent) {
    this.#env = env;
    this.#ctx = ctx;
  }

  /** Handles Requests */
  async route(req: Request): Promise<Response> {
    const { segments, method } = extractReq(req);

    switch (segments[0]) {
      case "DDL":
        break;
      case "DML":
        return this.#crud(segments.slice(1), method, req);
    }

    return new Response(null, { status: 404 });
  }

  async #crud(
    params: string[],
    method: string,
    req: Request,
  ): Promise<Response> {
    switch (method) {
      case "GET": {
        const table = params[0];
        const columns = params.slice(1);

        const { results } = await this.#select(table, columns).all();
        return new Response(JSON.stringify(results ?? []), {
          headers: headers({
            "Content-Type": "application/json",
          }),
        });
      }
      case "POST": {
        const table = params[0];
        const body = await req.json<{
          columns: string[];
          rows: { [_: string]: any }[];
        }>();

        const { success, error } = await this.#insert(
          table,
          body.columns,
          body.rows,
        ).run();

        return success
          ? new Response(null, { status: 204 })
          : handleRtrErr(error);
      }
    }

    return new Response(null, { status: 404 });
  }

  #select(table: string, columns: string[]): D1PreparedStatement {
    const resultColumns = columns.length
      ? columns.map((i) => `\`${table}\`.\`${i}\``).join(", ")
      : "*";

    return this.#env.DB.prepare(`SELECT ${resultColumns} FROM \`${table}\`;`);
  }

  #insert(
    table: string,
    columns: readonly string[],
    rows: { [_ in typeof columns[number]]: any }[],
  ): D1PreparedStatement {
    const value_bindings = rows.map((_) =>
      `(${columns.map((_) => "?").join(", ")})`
    ).join(", ");

    function* values(): Generator<any> {
      for (const row of rows) {
        for (const column of columns) {
          yield row[column as typeof columns[number]];
        }
      }
    }

    return this.#env.DB.prepare(
      `INSERT INTO \`${table}\` (\`${
        columns.join("`, `")
      }\`) VALUES ${value_bindings};`,
    ).bind(...values());
  }
}

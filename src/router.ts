import { Database, KV, Table } from "cf-db-api";
import Env from "./Env";
import { segments } from "cf-db-api/dist/src/utils";
import { headers } from "./utils";
import sch from "../resources/schema.json";
import cnf from "../resources/conf.json";

/** The router that handles Requests */
export default class Router {
  #env: Env;
  #ctx: ExecutionContext;

  #db: Database<Table>;

  constructor(env: Env, ctx: ExecutionContext) {
    this.#env = env;
    this.#ctx = ctx;

    this.#db = new Database();
    if (env.USE_TOKENS) {
      this.#db.set(
        "tokens",
        new KV(env.BLOQS_TOKENS, env.TOKENS_ALLOWED_ORIGINS),
      );
    }
  }

  /** Handles Requests */
  async route(req: Request): Promise<Response> {
    const segs = segments(req);

    if (
      "https:" !== new URL(req.url).protocol ||
      "https" !== req.headers.get("x-forwarded-proto")
    ) {
      return new Response("Please use a HTTPS connection.", {
        status: 401,
        headers: headers({ "Content-Type": "text/plain" }),
      });
    }

    //if (req.headers.has("Authorization")) {
    //  const { response, credentials } = this.#basicAuthentication(req);

    //  const failed = response ?? this.#verifyCredentials(credentials);

    //  if (failed) {
    //    return failed;
    //  }
    //} else {
    //  return new Response("You need to login.", {
    //    status: 401,
    //    headers: headers({
    //      "WWW-Authenticate": 'Basic realm="my scope", charset="UTF-8"',
    //    }),
    //  });
    //}

    //const psk = req.headers.get(this.#env.PRESHARED_AUTH_HEADER_KEY);

    //if (psk !== this.#env.PRESHARED_AUTH_HEADER_VALUE) {
    //  return new Response("Sorry, you have supplied an invalid key.", {
    //    status: 403,
    //    headers: headers({ "Content-Type": "text/plain" }),
    //  });
    //}

    //switch (segs[0]) {
    //  case "DDL":
    //    return this.#schema(segments.slice(1), method, req.json);
    //  case "DML":
    //    return this.#crud(segments.slice(1), method, req.json);
    //}

    switch (segs[1]) {
      case "db":
        return this.#db.fetch(req, 2, segs);
      case "sch":
        if (this.#env.USE_SCH) {
          return new Response(JSON.stringify(sch), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
        break;
      case "cnf":
        if (this.#env.USE_CNF) {
          return new Response(JSON.stringify(cnf), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
        break;
    }

    return new Response(undefined, { status: 404 });
  }

  //async #schema(
  //  params: string[],
  //  method: string,
  //  json: <T>() => Promise<T>,
  //): Promise<Response> {
  //  if (method == "POST") {
  //    switch (params[0]) {
  //      case "table":
  //        const body = await json<{
  //          name: string;
  //          columns: string[];
  //        }[]>();

  //        async function* created(router: Router): AsyncGenerator<D1Result> {
  //          for (const { name, columns } of body) {
  //            yield router.#table(name, columns);
  //          }
  //        }

  //        for await (const { success, error } of created(this)) {
  //          if (!success) {
  //            return handleRtrErr(error);
  //          }
  //        }

  //        return new Response(null, { status: 204 });
  //      case "view":
  //        break;
  //      case "index":
  //        break;
  //    }
  //  }

  //  return new Response(null, { status: 404 });
  //}

  //async #crud(
  //  params: string[],
  //  method: string,
  //  json: <T>() => Promise<T>,
  //): Promise<Response> {
  //  switch (method) {
  //    case "GET": {
  //      const table = params[0];
  //      const columns = params.slice(1);

  //      const { results } = await this.#select(table, columns).all();
  //      return new Response(JSON.stringify(results ?? []), {
  //        headers: headers({
  //          "Content-Type": "application/json",
  //        }),
  //      });
  //    }
  //    case "POST": {
  //      const table = params[0];
  //      const body = await json<{
  //        columns: string[];
  //        rows: { [_: string]: any }[];
  //      }>();

  //      const { success, error } = await this.#insert(
  //        table,
  //        body.columns,
  //        body.rows,
  //      ).run();

  //      return success
  //        ? new Response(null, { status: 204 })
  //        : handleRtrErr(error);
  //    }
  //  }

  //  return new Response(null, { status: 404 });
  //}

  //#table(name: string, columns: string[]): Promise<D1Result> {
  //  return this.#env.DB.prepare(
  //    `CREATE TABLE IF NOT EXISTS \`${name}\`(${columns.join(", ")});`,
  //  ).run();
  //}

  //#select(table: string, columns: string[]): D1PreparedStatement {
  //  const resultColumns = columns.length
  //    ? columns.map((i) => `\`${table}\`.\`${i}\``).join(", ")
  //    : "*";

  //  return this.#env.DB.prepare(`SELECT ${resultColumns} FROM \`${table}\`;`);
  //}

  //#insert(
  //  table: string,
  //  columns: readonly string[],
  //  rows: { [_ in typeof columns[number]]: any }[],
  //): D1PreparedStatement {
  //  const value_bindings = rows.map((_) =>
  //    `(${columns.map((_) => "?").join(", ")})`
  //  ).join(", ");

  //  function* values(): Generator<any> {
  //    for (const row of rows) {
  //      for (const column of columns) {
  //        yield row[column as typeof columns[number]];
  //      }
  //    }
  //  }

  //  return this.#env.DB.prepare(
  //    `INSERT INTO \`${table}\` (\`${
  //      columns.join("`, `")
  //    }\`) VALUES ${value_bindings};`,
  //  ).bind(...values());
  //}

  //#verifyCredentials(
  //  { user, pass }: { user: string; pass: string },
  //): Response | null {
  //  if (this.#env.BASIC_USER !== user || this.#env.BASIC_PASS !== pass) {
  //    return new Response("Invalid credentials.", {
  //      status: 401,
  //      headers: headers({ "Content-Type": "text/plain" }),
  //    });
  //  }

  //  return null;
  //}

  //#basicAuthentication(request: Request) {
  //  const Authorization = request.headers.get("Authorization");

  //  if (!Authorization) {
  //    return {
  //      response: new Response("No authorization header.", {
  //        status: 400,
  //        headers: headers({ "Content-Type": "text/plain" }),
  //      }),
  //    } as const;
  //  }

  //  const [scheme, encoded] = Authorization.split(" ");

  //  if (!encoded || scheme !== "Basic") {
  //    return {
  //      response: new Response("Malformed authorization header.", {
  //        status: 400,
  //        headers: headers({ "Content-Type": "text/plain" }),
  //      }),
  //    } as const;
  //  }

  //  const buffer = Uint8Array.from(
  //    atob(encoded),
  //    (character) => character.charCodeAt(0),
  //  );
  //  const decoded = new TextDecoder().decode(buffer).normalize();

  //  const index = decoded.indexOf(":");

  //  if (index === -1 || /[\0-\x1F\x7F]/.test(decoded)) {
  //    return {
  //      response: new Response("Invalid authorization value.", {
  //        status: 400,
  //        headers: headers({ "Content-Type": "text/plain" }),
  //      }),
  //    } as const;
  //  }

  //  return {
  //    credentials: {
  //      user: decoded.substring(0, index),
  //      pass: decoded.substring(index + 1),
  //    },
  //  } as const;
  //}
}

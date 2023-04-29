import Env from "./Env.js";
import Router from "./router.js";
import { headers } from "./utils.js";

const handler: ExportedHandler<Env> = {
  async fetch(
    req: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      return new Router(env, ctx).route(req);
    } catch (e) {
      return handleRtrErr(e);
    }
  },
};

export default handler;

export async function handleRtrErr(e: any): Promise<Response> {
  let error = "Internal Error";

  if (e instanceof Error) {
    error += `:\t${e.toString()} --- ${e.stack}`;
  }

  return new Response(error, {
    status: 500,
    headers: headers({
      "Content-Type": "text/plain",
    }),
  });
}

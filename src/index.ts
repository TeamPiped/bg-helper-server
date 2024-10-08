import { Elysia, t } from "elysia";
import { BG } from "bgutils-js";
import { JSDOM } from "jsdom";
import { serverTiming } from "@elysiajs/server-timing";

const dom = new JSDOM();

Object.assign(globalThis, {
	window: dom.window,
	document: dom.window.document,
});

const app = new Elysia()
	.use(serverTiming())
	.post(
		"/generate",
		async ({ body }) => {
			const bgConfig = {
				fetch: (url: any, options: any) => fetch(url, options),
				globalObj: globalThis,
				identifier: body.visitorData,
				requestKey: body.requestKey,
			};

			const challenge = await BG.Challenge.create(bgConfig);

			if (!challenge) throw new Error("Could not get challenge");

			if (challenge.script) {
				const script = challenge.script.find((sc) => sc !== null);
				if (script) new Function(script)();
			} else {
				console.warn("Unable to load Botguard.");
			}

			const poToken = await BG.PoToken.generate({
				program: challenge.challenge,
				globalName: challenge.globalName,
				bgConfig,
			});

			return {
				poToken: poToken,
			};
		},
		{
			body: t.Object({
				requestKey: t.String({
					default: "O43z0dpjhgX20SCx4KAo",
				}),
				visitorData: t.String(),
			}),
		},
	)
	.listen(3000);

console.log("Server started at http://0.0.0.0:3000");

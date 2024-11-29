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
		async ({ body: { visitorData, requestKey } }) => {
			const bgConfig = {
				fetch: (url: any, options: any) => fetch(url, options),
				globalObj: globalThis,
				identifier: visitorData,
				requestKey,
			};

			const challenge = await BG.Challenge.create(bgConfig);

			if (!challenge) throw new Error("Could not get challenge");

			const script = challenge.interpreterJavascript.privateDoNotAccessOrElseSafeScriptWrappedValue;
			if (!script) throw new Error("Could not load VM");
			new Function(script)();

			const poTokenRes = await BG.PoToken.generate({
				program: challenge.program,
				globalName: challenge.globalName,
				bgConfig,
			});

			BG.PoToken.generatePlaceholder(visitorData);

			return {
				poToken: poTokenRes.poToken,
				visitorData,
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

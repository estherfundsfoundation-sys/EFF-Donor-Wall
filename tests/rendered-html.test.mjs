import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renders the consent-first EFF donor wall", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /The EFF Donor Wall/i);
  assert.match(html, /Let EFF add me to the donor wall/i);
  assert.match(html, /Gift amounts and private contact details are never displayed/i);
  assert.match(html, /Friend of EFF/i);
  assert.match(html, /Legacy Partner/i);
  assert.doesNotMatch(html, /Kitan A\.|Eleanor Greene/i);
  assert.doesNotMatch(html, /auth\.openai\.com|chatgpt\.site/i);
});

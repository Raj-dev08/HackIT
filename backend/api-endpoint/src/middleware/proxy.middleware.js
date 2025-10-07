import { request } from "undici";
export async function proxyRequest(req, res, targetService, serviceName) {
  try {
     const url = `${targetService}${req.originalUrl.replace(`/${serviceName}`, "")}`;

    let body;
    if (req.method !== "GET" && req.body && Object.keys(req.body).length > 0) {
      body = JSON.stringify(req.body);
    }

    const proxyRes = await request(url, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetService).host,
        "Content-Type": "application/json",
        ...(body ? { "content-length": Buffer.byteLength(body) } : {}),
      },
      body,
    });

   
    const setCookie = proxyRes.headers["set-cookie"];
    if (setCookie) {
      res.setHeader("set-cookie", setCookie);
    }

   
    Object.entries(proxyRes.headers).forEach(([key, value]) => {
      if (!["content-length", "set-cookie"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    const responseText = await proxyRes.body.text();

    // console.log(responseText)
    try {
      res.status(proxyRes.statusCode).json(JSON.parse(responseText));
    } catch {
      res.status(proxyRes.statusCode).send(responseText);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
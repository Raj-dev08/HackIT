import { request } from "undici";
export async function proxyRequest(req, res, targetService, serviceName) {
  try {
    // Build target URL
    const url = `${targetService}${req.originalUrl.replace(`/${serviceName}`, "")}`;
    // console.log(url)

    let body;
    // console.log(req.method)
    // console.log(req.body)


    if (req.method !== "GET" && req.body && Object.keys(req.body).length > 0) {
      body = JSON.stringify(req.body);
    }
    // Forward request
    const proxyRes = await request(url, {
      method: req.method,
      headers: {
        ...req.headers,
        host: new URL(targetService).host,
        "Content-Type": "application/json",//case insensitive so no worries about capitalizing
        ...(body ? { "content-length": Buffer.byteLength(body) } : {}),
      },
      body,
    });

    const responseText = await proxyRes.body.text();

    // Return response with service info
    res.status(proxyRes.statusCode).json({
      status: proxyRes.statusCode,
      data: responseText ? JSON.parse(responseText) : null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
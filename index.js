import express from "express";
import path from "path";
import https from "https";
import http from "http";
import fs from "fs";
import spdy from "spdy";
import { fileURLToPath } from "url";
import compression from "compression";
const __filenameNew = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filenameNew);
var app = express();
app.use(compression());
app.use((req, res, next) => {
  // 将 index.html 设为 no-cache
  if (~req.url.indexOf("html")) {
    res.setHeader("Cache-control", "no-cache");
  }

  next();
});

app.use(
  express.static(path.join(__dirname, "dist"), {
    etag: false,
    maxAge: 1000 * 60 * 60 * 24 * 365, // 缓存一年
  })
);
spdy
  .createServer(
    {
      key: fs.readFileSync("./privkey.pem"),
      cert: fs.readFileSync("./fullchain.pem"),
      spdy: {
        protocols: ["h2"],
      },
    },
    app
  )
  .listen(3100);

console.log("网站服务器启动成功");

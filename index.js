import express from "express";
import path from "path";
import https from "https";
import http from "http";
import fs from "fs";
import { fileURLToPath } from "url";

const __filenameNew = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filenameNew);
var app = express();
app.use(express.static(path.join(__dirname, "dist")));
http.createServer(app).listen(3100);
https
  .createServer(
    {
      key: fs.readFileSync("./privkey.pem"),
      cert: fs.readFileSync("./fullchain.pem"),
    },
    app
  )
  .listen(443);

console.log("网站服务器启动成功");

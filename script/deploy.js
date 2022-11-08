import Client from "ssh2-sftp-client";
import path from "path";
import { config } from "./config.js";
import { fileURLToPath } from "url";

const __filenameNew = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filenameNew);
let sftp = new Client();
const localPath = path.join(__dirname, "../dist").replace(/\\/g, "/");
const remotePath = "/opt/greenlock/dist";
sftp
  .connect({
    host: config.host,
    port: 22,
    username: config.username,
    password: config.password,
  })
  .then(() => {
    console.log("连接成功");
    return sftp.exists(`${remotePath}`);
  })
  .then((data) => {
    if (data) {
      console.log("删除dist");
      return sftp.rmdir(`${remotePath}`, true);
    }
  })
  .then(async () => {
    console.log("上传");
    await sftp.uploadDir(localPath, remotePath);
  })
  .then(() => {
    console.log("成功");
    sftp.end();
  })
  .catch((err) => {
    console.log(err.message, "catch error");
    sftp.end();
  });

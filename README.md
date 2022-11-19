## 本地运行

npm run dev

## 编译

npm run build

## 上传

需要在 script 目录下新建 config.js
内容如下：

```
export const config = {
  host: "106.23.87.241",
  port: 22,
  username: "root",
  password: "********",
};
```

"postbuild": "npm run deploy",//编译后自动运行

## 服务器上运行

npm run pm2

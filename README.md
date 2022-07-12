# daodao-talk

TypeScript + MongoDB 增删改查.

开发环境使用根目录 `.env` 配置的环境变量, 格式如下, 注意 MongoDB 的连接字符串中需要包含密码和数据库名

```
DB_CONN_STRING={YOUR_MONGO_URI}
ALLOW_DOMAIN=http://localhost:8080
PORT=5000
SECRET={YOUR_SECREK}
COOKIE_SECRET={YOUR_COOKIE_SECRET}
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=365d
```

生产环境为了方便部署在 vercel 上, 不使用文件配置, 而是直接读取系统环境变量

开发时本地测试
```bash
npm run dev 
```

编译

```bash
npm run build
```

生产环境运行
```bash
npm start
```



api

1. GET 所有文档
https://daodao-talk.vercel.app/api/posts 
2. GET 某 id
https://daodao-talk.vercel.app/api/posts/:id
3. POST 增加新文档
https://daodao-talk.vercel.app/api/posts
4. PUT 修改某文档
https://daodao-talk.vercel.app/api/posts/:id
5. DELETE 删除文档
https://daodao-talk.vercel.app/api/posts/:id





import http from "node:http";

const server = http.createServer((req, res) => {
  console.log("ping route hit");
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("pong 🏓");
});

server.listen(4000, () => console.log("listening on :4000"));

const express = require("express");
const cors = require("cors");
const chalk = require("chalk");
const mongoose = require("mongoose");
const routes = require("./routes");
const YAML = require("yamljs");
const swaggerUi = require("swagger-ui-express");
const path = require("path");
const { Server } = require("socket.io");
const onConnection = require("./socket_io/onConnection");
const { createServer } = require("http");
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use("/images/", express.static("./images"));

mongoose.set("strictQuery", false);

app.use("/api", routes);

const swaggerDocument = YAML.load(path.join(__dirname, "docs", "docs.yaml"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT;

async function start() {
  try {
    mongoose.connect(process.env.MONGOURI);
    console.log(chalk.green("mongoDB connected"));

    const server = createServer(app);

    server.listen(PORT, () => {
      console.log(chalk.green(`Server has been started on port: ${PORT}`));
    });

    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT"],
        allowedHeaders: ["Content-Type"],
      },
      serveClient: false,
    });

    io.on("connection", (socket) => {
      onConnection(io, socket);
    });
  } catch (error) {
    console.log(chalk.red(error.message));
    process.exit(1);
  }
}

start();

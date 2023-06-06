const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    version: "", // by default: '1.0.0'
    title: "CMSmall", // by default: 'REST API'
    description: "CMSmall by ExalFabu API Documentation ", // by default: ''
  },
  host: "localhost:3001", // by default: 'localhost:3000'
  basePath: "/api/", // by default: '/'
  tags: [
    {
      name: "User", // Tag name
      description: "Authentication and User related", // Tag description
    },
    {
      name: "Pages", // Tag name
      description: "Pages and blocks manipulation", // Tag description
    },
  ],
  securityDefinitions: {
    CookieAuth: {
      type: "apiKey",
      in: "cookie",
      name: "connect.sid",
    },
  }, // by default: empty object
  definitions: {
    Error: {
      $error: "Error message",
      details: "Error details",
    },
    User: {
      id: 1,
      $username: "buffa@test.com",
      $name: "Buffa",
      $role: "admin",
    },
    PageHead: {
      id: 1,
      $title: "Page Title",
      $created_at: "2021-01-01T00:00:00.000Z",
      published_at: "2021-01-01T00:00:00.000Z",
      $author: 1,
    },
    Block: {
      id: 1,
      $type: "header",
      $content: "Header content",
      $page_id: 1,
      $order: 1,
    },
    Page: {
      id: 1,
      $title: "Page Title",
      $created_at: "2021-01-01T00:00:00.000Z",
      published_at: "2021-01-01T00:00:00.000Z",
      $author: 1,
      blocks: [{ $ref: "#/definitions/Block" }],
    },
  },
  components: {}, // by default: empty object (OpenAPI 3.x)
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/index.js"];
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  require("./index.js");
});

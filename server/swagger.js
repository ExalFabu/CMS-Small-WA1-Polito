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
      name: "Auth", // Tag name
      description: "Authentication", // Tag description
    },
    {
        name: "Pages", // Tag name
        description: "Pages", // Tag description
    }
  ],
  securityDefinitions: {}, // by default: empty object
  definitions: {
    UserCredentials: {
        $username: "buffa@test.com",
        $password: "password"
    },
  }, // by default: empty object (Swagger 2.0)
  components: {}, // by default: empty object (OpenAPI 3.x)
};

const outputFile = "./swagger_output.json";
const endpointsFiles = ["./routes/index.js"];
swaggerAutogen(outputFile, endpointsFiles, doc);

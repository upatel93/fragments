# Running the Project

### Linting

To lint the project, run the following command:

```
npm run lint
```

This will run the ESLint linter on all JavaScript files in the "src" directory (including subdirectories) using the configuration defined in ".eslintrc.js". Any errors or warnings will be printed to the console.

### Starting the Server

To start the server, run the following command:

```
npm start
```

This will start the Node.js server by running the "server.js" file located in the "src" directory. You can then access the server at http://localhost:8080.

### Development Mode

To start the server in development mode, run the following command:

```
npm run dev
```

This will start the Node.js server using the "nodemon" package, which automatically restarts the server whenever a file in the "src" directory (including subdirectories) changes. It also sets the "LOG_LEVEL" environment variable to "debug", which can be useful for debugging.

### Debug Mode

To start the server in debug mode, run the following command:

```
npm run debug
```

This is similar to the "dev" script, but it also starts the Node.js server in debug mode and exposes the debugger on port 9229. This can be useful for debugging more complex issues in the code.

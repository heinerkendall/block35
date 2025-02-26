const db = require("./db");
const express = require("express");
const app = express();
app.use(express.json());

app.get("/api/users", async (req, res, next) => {
    try {
      const result = await db.fetchUsers();
      res.send(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:username/favorites", async (req, res, next) => {
    try {
      const result = await db.fetchFavorites(req.params.username);
      res.send(result);
    } catch (ex) {
      next(ex);
    }
  });

  app.get("/api/products", async (req, res, next) => {
    try {
      const result = await db.fetchProducts();
      res.send(result);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/users", async (req, res, next) => {
    try {
      const result = await db.createUser({
        username: req.body.username,
        password: req.body.password,
      });
      res.send(result);
    } catch (ex) {
      next(ex);
    }
  });

  app.post("/api/products", async (req, res, next) => {
    try {
      const result = await db.createProduct(req.body.name);
      res.send(result);
    } catch (ex) {
      next(ex);
    }
  });

  app.post("/api/users/:username/favorites", async (req, res, next) => {
    console.log(req.body);
    try {
      res.status(201).send(
        await db.createFavorite({
          username: req.params.username,
          name: req.body.name,
        })
      );
    } catch (ex) {
      next(ex);
    }
  });
  
  app.delete("/api/users/:username/favorites/:name", async (req, res, next) => {
    const { username } = req.params.username;
    const { name } = req.params.name;
  
    try {
      await db.destroyFavorite({
        username: username,
        name: name,
      });
      res.sendStatus(204);
    } catch (ex) {
      next(ex);
    }
  });


const init = async () => {
    app.listen(3000, () => console.log("listening on port 3000"));
  
    db.init();
  };
  
  init();
// client: A Node pg client.
// createTables: A method that drops and creates the tables for your application.
// createProduct: A method that creates a product in the database and then returns the created record.
// createUser: A method that creates a user in the database and then returns the created record. The password of the user should be hashed by using Bcrypt.
// fetchUsers: A method that returns an array of users in the database.
// fetchProducts: A method that returns an array of products in the database.
// createFavorite: A method that creates a favorite in the database and then returns the created record,
// fetchFavorites: A method that returns an array of favorites for a user,
// destroyFavorite: A method that deletes a favorite in the database.

const pg = require("pg");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const client = new pg.Client(
  "postgres://postgres:2123@localhost:5432/acme_store_db"
);

const createTables = async () => {
    const SQL = `
  DROP TABLE IF EXISTS favorites;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS products;
  
  CREATE TABLE users(
  id uuid PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(100)
  );
  
  CREATE TABLE products(
  id uuid PRIMARY KEY,
  name VARCHAR(50)
  );
  
  CREATE TABLE favorites(
  id uuid PRIMARY KEY,
  product_id uuid REFERENCES products(id) NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  CONSTRAINT unique_product_user UNIQUE (product_id, user_id)
  );
  `;
    await client.query(SQL);
  };
  
  const createProduct = async (name) => {
    const SQL = `INSERT INTO products(id, name) VALUES($1, $2) RETURNING *`;
    const result = await client.query(SQL, [uuid.v4(), name]);
    return result.rows[0];
  };
  
  const createUser = async ({ username, password }) => {
    const SQL = `INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *`;
    const hashedPassword = await bcrypt.hash(password, 5);
    const result = await client.query(SQL, [uuid.v4(), username, hashedPassword]);
    return result.rows[0];
  };
  
  const createFavorite = async ({ username, name }) => {
    const SQL = `
      INSERT INTO favorites(id, user_id, product_id)
      VALUES($1, (SELECT id FROM users WHERE username = $2), (SELECT id FROM products WHERE name = $3)) 
      RETURNING * `;
    const result = await client.query(SQL, [uuid.v4(), username, name]);
    return result.rows[0];
  };
  
  const fetchUsers = async () => {
    const SQL = `SELECT * FROM users`;
    result = await client.query(SQL);
    return result.rows;
  };
  
  const fetchProducts = async () => {
    const SQL = `SELECT * FROM products`;
    result = await client.query(SQL);
    return result.rows;
  };
  
  const fetchFavorites = async (username) => {
    const SQL = `SELECT * FROM favorites WHERE user_id = (SELECT id FROM users WHERE username = $1)`;
    result = await client.query(SQL, [username]);
    return result.rows;
  };
  
  const destroyFavorite = async (username, name) => {
    const SQL = `
      DELETE FROM favorites
      WHERE user_id = (SELECT id FROM users WHERE username = $1) AND product_id = (SELECT id FROM products WHERE name = $2)
    `;
    await client.query(SQL, [username, name]);
  };
  
  const init = async () => {
    await client.connect();
    await createTables();
    await createUser({ username: "heinerkendall", password: "password" });
    await createUser({ username: "dannykopp", password: "password" });
    console.table(await fetchUsers())
  };

  
  module.exports = {
    init,
    createTables,
    createUser,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite,
  };
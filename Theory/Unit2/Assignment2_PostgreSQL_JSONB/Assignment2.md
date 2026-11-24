# JSONB in PostgreSQL and How PostgreSQL Can Work as Both SQL and NoSQL

## 1. Introduction

PostgreSQL is mainly known as a **relational SQL database**, where data is stored in tables with rows and columns. But PostgreSQL also supports a data type called **JSONB**, which allows us to store JSON documents inside a table.

Because of this, PostgreSQL can handle both:

- **Structured data** using normal SQL tables and columns
- **Flexible, document-based data** using JSONB

This makes PostgreSQL useful in situations where we might otherwise consider using both PostgreSQL and MongoDB.

---

## 2. What is JSONB?

JSON stands for **JavaScript Object Notation**. It is a common format for storing data in key-value pairs.

For example:

```json
{
  "name": "Ritkriti",
  "age": 21,
  "skills": ["Java", "Python", "React"]
}
```

PostgreSQL provides two JSON data types:

- `JSON`
- `JSONB`

The main difference is that `JSON` stores the data as text, while `JSONB` stores it in a format that PostgreSQL can process more efficiently.

For applications where we need to frequently search or modify JSON data, **JSONB is generally more useful**.

---

## 3. Creating a JSONB Column

We can create a normal PostgreSQL table and add a JSONB column:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_data JSONB
);
```

Now we can store JSON documents inside the `user_data` column.

```sql
INSERT INTO users (user_data)
VALUES (
    '{
        "name": "Ritkriti",
        "age": 21,
        "skills": ["Java", "Python", "React"]
    }'
);
```

We can also insert another user with completely different fields:

```sql
INSERT INTO users (user_data)
VALUES (
    '{
        "name": "Aarav",
        "email": "aarav@example.com",
        "experience": 2
    }'
);
```

We didn't have to add new columns to the table for `email` or `experience`.

This is where JSONB gives PostgreSQL a **NoSQL-like flexibility**.

---

## 4. How is This Similar to MongoDB?

In MongoDB, data is stored as documents.

For example:

```json
{
  "name": "Ritkriti",
  "age": 21,
  "skills": ["Java", "Python"]
}
```

In PostgreSQL, we can store essentially the same document inside a JSONB column:

```sql
INSERT INTO users (user_data)
VALUES (
    '{
        "name": "Ritkriti",
        "age": 21,
        "skills": ["Java", "Python"]
    }'
);
```

The basic idea is:

| MongoDB         | PostgreSQL            |
| --------------- | --------------------- |
| Collection      | Table                 |
| Document        | JSONB data            |
| Field           | JSON key              |
| `_id`           | Primary key           |
| MongoDB queries | SQL + JSONB operators |

So, PostgreSQL can store data in a way that feels similar to MongoDB while still remaining a relational database.

---

## 5. Reading Data from JSONB

PostgreSQL provides operators for accessing values inside JSONB.

Suppose our data is:

```json
{
  "name": "Ritkriti",
  "age": 21,
  "skills": ["Java", "Python"]
}
```

We can get the `name` using:

```sql
SELECT user_data->>'name'
FROM users;
```

The result will be:

```text
Ritkriti
```

The `->` operator returns JSON, while `->>` returns the value as text.

For example:

```sql
SELECT user_data->'skills'
FROM users;
```

returns:

```json
["Java", "Python"]
```

---

## 6. Accessing Nested Data

JSONB also allows us to store nested objects.

For example:

```json
{
  "name": "Ritkriti",
  "address": {
    "city": "Dehradun",
    "country": "India"
  }
}
```

We can access the city using:

```sql
SELECT user_data->'address'->>'city'
FROM users;
```

Output:

```text
Dehradun
```

This is useful when our data has multiple levels of information.

---

## 7. Searching Inside JSONB

We can also search for specific values.

For example:

```sql
SELECT *
FROM users
WHERE user_data->>'name' = 'Ritkriti';
```

We can search nested values too:

```sql
SELECT *
FROM users
WHERE user_data->'address'->>'city' = 'Dehradun';
```

PostgreSQL also provides the `@>` operator for checking whether JSONB contains specific data:

```sql
SELECT *
FROM users
WHERE user_data @> '{"name": "Ritkriti"}';
```

This makes JSONB quite powerful for document-style queries.

---

## 8. Working with Arrays

JSONB can also store arrays.

For example:

```json
{
  "name": "Ritkriti",
  "skills": ["Java", "Python", "React"]
}
```

We can check whether the user has a particular skill:

```sql
SELECT *
FROM users
WHERE user_data->'skills' ? 'Python';
```

Here, the `?` operator checks whether `"Python"` exists in the JSON array.

---

## 9. Updating JSONB Data

JSONB data can also be updated.

For example, suppose we want to change the user's age:

```sql
UPDATE users
SET user_data = jsonb_set(
    user_data,
    '{age}',
    '22'
)
WHERE user_data->>'name' = 'Ritkriti';
```

We can also add a new field:

```sql
UPDATE users
SET user_data = user_data || '{"department": "CSE"}'
WHERE user_data->>'name' = 'Ritkriti';
```

Now the document can contain:

```json
{
  "name": "Ritkriti",
  "age": 22,
  "department": "CSE"
}
```

---

## 10. Indexing JSONB

One concern with storing flexible data is performance when the database becomes large.

PostgreSQL allows us to create indexes on JSONB columns.

For example:

```sql
CREATE INDEX users_data_index
ON users
USING GIN (user_data);
```

A **GIN index** can make many JSONB searches much faster.

For example:

```sql
SELECT *
FROM users
WHERE user_data @> '{"skills": ["Python"]}';
```

The index can help PostgreSQL find matching records efficiently.

---

## 11. PostgreSQL as Both SQL and NoSQL

This is where PostgreSQL becomes particularly interesting.

Normally, PostgreSQL works like this:

```text
PostgreSQL
    |
    v
  Tables
    |
    +--- Rows
    |
    +--- Columns
```

With JSONB, we can also have:

```text
PostgreSQL
    |
    v
  Table
    |
    v
 JSONB Column
    |
    +--- Document 1
    +--- Document 2
    +--- Document 3
```

Each JSONB document can have a slightly different structure.

For example:

```json
{
  "name": "Ritkriti",
  "skills": ["Java", "Python"]
}
```

and:

```json
{
  "name": "Aarav",
  "skills": ["C++"],
  "experience": 2,
  "projects": ["E-commerce", "Chat Application"]
}
```

Both can be stored in the same JSONB column.

This is the **NoSQL-like part** of PostgreSQL.

---

## 12. The Best Part: We Can Combine Both

We don't have to put everything inside JSONB.

For example:

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price DECIMAL(10,2),
    details JSONB
);
```

Here:

- `id`, `name`, and `price` are normal SQL columns.
- `details` contains flexible JSONB data.

A product could have:

```json
{
  "brand": "Samsung",
  "color": "Black",
  "storage": "256GB",
  "features": ["5G", "AMOLED", "Fast Charging"]
}
```

Another product could have:

```json
{
  "brand": "Dell",
  "ram": "16GB",
  "processor": "Intel i7",
  "storage": "512GB SSD"
}
```

We don't need to create separate columns for every possible product specification.

This is called a **hybrid approach**.

---

## 13. PostgreSQL vs MongoDB

| Feature               | PostgreSQL + JSONB | MongoDB                         |
| --------------------- | ------------------ | ------------------------------- |
| Main model            | Relational         | Document-based                  |
| Flexible data         | JSONB              | Documents                       |
| SQL                   | Yes                | No                              |
| Tables                | Yes                | Collections                     |
| Relationships         | Strong support     | Possible, but document-oriented |
| Joins                 | `JOIN`             | `$lookup`                       |
| Foreign keys          | Yes                | No traditional foreign keys     |
| JSON/document storage | Yes                | Native                          |
| Transactions          | Yes                | Yes                             |
| Flexible schema       | Through JSONB      | Yes                             |

The important point is that PostgreSQL doesn't actually become MongoDB. Instead, **JSONB gives PostgreSQL many of the flexible data-storage features that make document databases useful**.

---

## 14. When Should We Use JSONB?

JSONB is useful when:

- Different records can have different fields.
- The structure of the data changes frequently.
- We need to store nested objects or arrays.
- We are storing metadata or configuration.
- We already use PostgreSQL and don't want another database just for flexible data.
- We need both relational data and document-style data.

Some common examples are:

```text
User preferences
Product specifications
Application settings
Metadata
API responses
Configuration data
Dynamic forms
Event data
```

---

## 15. When Should We Use Normal Columns?

JSONB should not replace every normal SQL column.

If a field is frequently used for:

- Searching
- Sorting
- Joining
- Applying constraints
- Maintaining relationships

then keeping it as a normal column is often better.

For example:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    age INT,
    preferences JSONB
);
```

Here, `name`, `email`, and `age` are structured data, while `preferences` can remain flexible.

---

## 16. Conclusion

PostgreSQL is traditionally a **SQL relational database**, but JSONB allows it to also handle **NoSQL-style document data**.

The main idea is:

```text
                PostgreSQL
                    |
          -----------------------
          |                     |
     SQL / Relational       JSONB / Document
          |                     |
       Tables                JSON data
       Columns               Nested data
       JOINs                 Arrays
       Foreign Keys          Flexible schema
       Constraints           JSON queries
          |                     |
          -----------+-----------
                     |
              One Database
```

So instead of thinking of PostgreSQL and MongoDB as completely separate choices, we can use PostgreSQL's JSONB feature when an application needs **both structured relational data and flexible document-based data**.

> **PostgreSQL + JSONB = SQL capabilities + NoSQL-style flexibility**
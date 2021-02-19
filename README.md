# slow.db

### slow.db aims to make using a database easy but at the price of being slow.

Inspired by quick.db, slow.db is the opposite.

slow.db employs JSON to persist data (yikes).

Even though slow.db represents a degenerate database, we'll still recommend it to noobs as a prerequisite to actual databases.

This is because slow.db has some of the same ideas behind mongoose and mongodb.

We'd like to think of slow.db as a really bad mongodb for absolute noobs.

### Features

These are literally all the features:

-   Basic type validation
-   API similar to mongoose's
-   Asynchronous version

### Installation

Using npm:

```
npm install --save @aeroware/slow.db
```

Using yarn:

```
yarn add @aeroware/slow.db
```

Using your mom:

```
me: mom can i have mongoose?
mom: no we already have mongoose at home
at home: @aeroware/slow.db
```

### Example Usage

#### Synchronous

```js
const SlowDB = require("@aeroware/slow.db");

// create a synchronous driver
const db = new SlowDB();

// create a model
const users = db.model("users", {
    username: String,
    likes: Number,
    hearts: Number,
});

// create a document
const bob = users.create({
    username: "bob",
    // no one likes bob :(
    likes: 0,
    hearts: 0,
});

// the new revolutionary apple product, iFoundBob
const iFoundBob = users.findOne({
    username: "bob",
});
```

#### Asynchronous

```js
const SlowDB = require("@aeroware/slow.db");

// create an asynchronous driver
const db = SlowDB.async();

// create a model
const users = await db.model("users", {
    username: String,
    likes: Number,
    hearts: Number,
});

// create a document
const bob = await users.create({
    username: "bob",
    // no one likes bob :(
    likes: 0,
    hearts: 0,
});

// the new revolutionary apple product, iFoundBob
const iFoundBob = await users.findOne({
    username: "bob",
});
```

### Documentation

The code has been decorated with some JSDoc.

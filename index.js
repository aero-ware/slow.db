"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const uuid_1 = __importDefault(require("uuid"));
class Schema {
}
/**
 * Basically the synchronous driver but asynchronous.
 */
class AsyncSlowDB {
    constructor() {
        this.models = new Map();
        try {
            if (!fs_1.default.existsSync("./database.json"))
                fs_1.default.appendFileSync("./database.json", "{}", "utf-8");
        }
        catch (e) {
            throw new Error(`Failed to create database.json: ${e}`);
        }
        this.cache = JSON.parse(fs_1.default.readFileSync("./database.json", "utf-8"));
    }
    async model(name, schema) {
        var _a;
        Object.keys(schema).forEach((key) => {
            if (![Number, Boolean, Object, Array, Date, String].includes(schema[key]))
                throw new Error("Types must be either Number, Boolean, Object, Array, Date, or String.");
        });
        //@ts-ignore
        schema.createdAt = Date;
        //@ts-ignore
        schema.updatedAt = Date;
        this.models.set(name, schema);
        if (!this.cache[name])
            this.cache[name] = {};
        this.__save__();
        const that = this;
        return _a = class __ extends Schema {
                constructor(data) {
                    super();
                    const doc = {
                        __id__: that.__uuid__(),
                    };
                    Object.keys(data).forEach((key) => {
                        if (!Object.keys(__.schema).includes(key))
                            throw new Error(`Mismatched key: '${key}'`);
                        if (data[key].constructor !== __.schema[key])
                            throw new Error(`Mismatched type`);
                        this[key] = doc[key] = data[key] ?? null;
                    });
                    this.createdAt = new Date();
                    this.updatedAt = new Date();
                    this.__id__ = doc.__id__;
                    that.cache[name][this.__id__] = doc;
                    (async () => {
                        await this.__save__();
                    })();
                }
                static async create(data) {
                    return new __(data);
                }
                static async wipe() {
                    that.cache[name] = {};
                    await that.__save__();
                }
                async __delete__() {
                    delete that.cache[name][this.__id__];
                    await that.__save__();
                }
                async __save__() {
                    this.updatedAt = new Date();
                    Object.keys(__.schema).forEach((key) => {
                        if (this[key].constructor !== __.schema[key])
                            throw new Error(`Mismatched type`);
                        that.cache[name][this.__id__][key] = this[key];
                    });
                    await that.__save__();
                }
                static async findOne(query) {
                    return this.values.find((item) => Object.keys(query).every((key) => item[key] === query[key]));
                }
                static async findById(id) {
                    return this.values.find((item) => item.__id__ === id);
                }
                static async find(query) {
                    return this.values.filter((item) => Object.keys(query).every((key) => item[key] === query[key]));
                }
                static async findOneAndDelete(query) {
                    const item = await __.findOne(query);
                    if (!item)
                        throw new Error(`Could not find a document with that query`);
                    await item.__delete__();
                    return item;
                }
                static async findOneAndUpdate(query, update) {
                    const item = await __.findOne(query);
                    if (!item)
                        throw new Error(`Could not find a document with that query`);
                    Object.keys(update).forEach((key) => {
                        if (typeof item[key] !== "undefined")
                            item[key] = update[key];
                    });
                    await item.__save__();
                    return item;
                }
                static async upsert(query, data) {
                    const item = await __.findOne(query);
                    if (!item)
                        return await __.create(data);
                    await __.findOneAndUpdate(query, data);
                    return item;
                }
                static get values() {
                    return Object.values(that.cache[name]);
                }
            },
            _a.schema = schema,
            _a.__name__ = name,
            _a;
    }
    async wipe() {
        this.cache = {};
        await this.__save__();
    }
    __uuid__() {
        return uuid_1.default.v4();
    }
    async __save__() {
        await fs_1.default.promises.writeFile("./database.json", JSON.stringify(this.cache, null, 4), "utf-8");
    }
}
/**
 * A synchronous driver for your JSON database.
 */
class SlowDB {
    constructor() {
        this.models = new Map();
        try {
            if (!fs_1.default.existsSync("./database.json"))
                fs_1.default.appendFileSync("./database.json", "{}", "utf-8");
        }
        catch (e) {
            throw new Error(`Failed to create database.json: ${e}`);
        }
        this.cache = JSON.parse(fs_1.default.readFileSync("./database.json", "utf-8"));
    }
    /**
     * Creates a new model.
     * @param name Name of the table.
     * @param schema The schema of the table.
     */
    model(name, schema) {
        var _a;
        Object.keys(schema).forEach((key) => {
            if (![Number, Boolean, Object, Array, Date, String].includes(schema[key]))
                throw new Error("Types must be either Number, Boolean, Object, Array, Date, or String.");
        });
        //@ts-ignore
        schema.createdAt = Date;
        //@ts-ignore
        schema.updatedAt = Date;
        this.models.set(name, schema);
        if (!this.cache[name])
            this.cache[name] = {};
        this.__save__();
        const that = this;
        return _a = class __ extends Schema {
                /**
                 * Creates a document.
                 * @param data Data to use.
                 */
                constructor(data) {
                    super();
                    const doc = {
                        __id__: that.__uuid__(),
                    };
                    Object.keys(data).forEach((key) => {
                        if (!Object.keys(__.schema).includes(key))
                            throw new Error(`Mismatched key: '${key}'`);
                        if (data[key].constructor !== __.schema[key])
                            throw new Error(`Mismatched type`);
                        this[key] = doc[key] = data[key] ?? null;
                    });
                    this.createdAt = new Date();
                    this.updatedAt = new Date();
                    this.__id__ = doc.__id__;
                    that.cache[name][this.__id__] = doc;
                    this.__save__();
                }
                /**
                 * Creates a document.
                 * @param data Data to use.
                 */
                static create(data) {
                    return new __(data);
                }
                /**
                 * Wipes the table.
                 */
                static wipe() {
                    that.cache[name] = {};
                    that.__save__();
                }
                /**
                 * Deletes the document.
                 */
                __delete__() {
                    delete that.cache[name][this.__id__];
                    that.__save__();
                }
                /**
                 * Saves the changed document.
                 */
                __save__() {
                    this.updatedAt = new Date();
                    Object.keys(__.schema).forEach((key) => {
                        if (this[key].constructor !== __.schema[key])
                            throw new Error(`Mismatched type`);
                        that.cache[name][this.__id__][key] = this[key];
                    });
                    that.__save__();
                }
                /**
                 * Retrieves an item.
                 * @param query Query to search for the item.
                 */
                static findOne(query) {
                    return this.values.find((item) => Object.keys(query).every((key) => item[key] === query[key]));
                }
                /**
                 * Retrieves an item by id.
                 * @param id Id to get.
                 */
                static findById(id) {
                    return this.values.find((item) => item.__id__ === id);
                }
                /**
                 * Returns all items that satisfy the query.
                 * @param query Query to search for.
                 */
                static find(query) {
                    return this.values.filter((item) => Object.keys(query).every((key) => item[key] === query[key]));
                }
                /**
                 * Finds one item and deletes it.
                 * @param query Query to search for the item.
                 */
                static findOneAndDelete(query) {
                    const item = __.findOne(query);
                    if (!item)
                        throw new Error(`Could not find a document with that query`);
                    item.__delete();
                    return item;
                }
                /**
                 * Finds one item and updates it.
                 * @param query Query to search for the item.
                 * @param update Data to update.
                 */
                static findOneAndUpdate(query, update) {
                    const item = __.findOne(query);
                    if (!item)
                        throw new Error(`Could not find a document with that query`);
                    Object.keys(update).forEach((key) => {
                        if (typeof item[key] !== "undefined")
                            item[key] = update[key];
                    });
                    item.__save__();
                    return item;
                }
                /**
                 * Updates and inserts if the item does not exist, hence the name, upsert.
                 * @param query Query to search for the item.
                 * @param data Data to insert.
                 */
                static upsert(query, data) {
                    const item = __.findOne(query);
                    if (!item)
                        return __.create(data);
                    __.findOneAndUpdate(query, data);
                    return item;
                }
                /**
                 * All the values in the table.
                 */
                static get values() {
                    return Object.values(that.cache[name]);
                }
            },
            /**
             * The schema.
             */
            _a.schema = schema,
            /**
             * The name.
             */
            _a.__name__ = name,
            _a;
    }
    /**
     * Wipes the JSO-, er, database.
     */
    wipe() {
        this.cache = {};
        this.__save__();
    }
    __uuid__() {
        return uuid_1.default.v4();
    }
    __save__() {
        fs_1.default.writeFileSync("./database.json", JSON.stringify(this.cache, null, 4), "utf-8");
    }
    /**
     * Gets an async driver.
     */
    static async() {
        return new AsyncSlowDB();
    }
}
exports.default = SlowDB;
exports = SlowDB;
module.exports = SlowDB;

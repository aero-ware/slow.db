import fs from "fs";
import uuid from "uuid";

interface Schema {
    __id__?: string;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: Number | Boolean | any | Array<unknown> | Date | String;
}

abstract class Schema {}

/**
 * Basically the synchronous driver but asynchronous.
 */
class AsyncSlowDB {
    private cache: any;
    public models = new Map<string, Schema>();

    constructor() {
        try {
            if (!fs.existsSync("./database.json"))
                fs.appendFileSync("./database.json", "{}", "utf-8");
        } catch (e) {
            throw new Error(`Failed to create database.json: ${e}`);
        }

        this.cache = JSON.parse(fs.readFileSync("./database.json", "utf-8"));
    }

    public async model(name: string, schema: Schema) {
        Object.keys(schema).forEach((key) => {
            if (![Number, Boolean, Object, Array, Date, String].includes(schema[key]))
                throw new Error(
                    "Types must be either Number, Boolean, Object, Array, Date, or String."
                );
        });

        //@ts-ignore
        schema.createdAt = Date;
        //@ts-ignore
        schema.updatedAt = Date;

        this.models.set(name, schema);

        if (!this.cache[name]) this.cache[name] = {};

        this.__save__();

        const that = this;
        return class __ extends Schema {
            static schema = schema;
            static __name__ = name;

            constructor(data: Schema) {
                super();

                const doc: Schema = {
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

                that.cache[name][this.__id__!] = doc;

                (async () => {
                    await this.__save__();
                })();
            }

            public static async create(data: Schema) {
                return new __(data);
            }

            public static async wipe() {
                that.cache[name] = {};
                await that.__save__();
            }

            public async __delete__() {
                delete that.cache[name][this.__id__!];
                await that.__save__();
            }

            public async __save__() {
                this.updatedAt = new Date();
                Object.keys(__.schema).forEach((key) => {
                    if (this[key].constructor !== __.schema[key])
                        throw new Error(`Mismatched type`);
                    that.cache[name][this.__id__!][key] = this[key];
                });
                await that.__save__();
            }

            public static async findOne(query: any) {
                return this.values.find((item) =>
                    Object.keys(query).every((key) => item[key] === query[key])
                ) as __ | undefined;
            }

            public static async findById(id: any) {
                return this.values.find((item) => item.__id__ === id) as __ | undefined;
            }

            public static async find(query: any) {
                return this.values.filter((item) =>
                    Object.keys(query).every((key) => item[key] === query[key])
                ) as __[];
            }

            public static async findOneAndDelete(query: any) {
                const item = await __.findOne(query);
                if (!item) throw new Error(`Could not find a document with that query`);
                await item.__delete__();
                return item;
            }

            public static async findOneAndUpdate(query: any, update: any) {
                const item = await __.findOne(query);
                if (!item) throw new Error(`Could not find a document with that query`);
                Object.keys(update).forEach((key) => {
                    if (typeof item[key] !== "undefined") item[key] = update[key];
                });
                await item.__save__();
                return item;
            }

            public static async upsert(query: any, data: any) {
                const item = await __.findOne(query);
                if (!item) return await __.create(data);
                await __.findOneAndUpdate(query, data);
                return item;
            }

            public static get values() {
                return Object.values(that.cache[name]) as __[];
            }
        };
    }

    public async wipe() {
        this.cache = {};
        await this.__save__();
    }

    private __uuid__() {
        return uuid.v4();
    }

    private async __save__() {
        await fs.promises.writeFile(
            "./database.json",
            JSON.stringify(this.cache, null, 4),
            "utf-8"
        );
    }
}

/**
 * A synchronous driver for your JSON database.
 */
class SlowDB {
    private cache: any;
    public models = new Map<string, Schema>();

    constructor() {
        try {
            if (!fs.existsSync("./database.json"))
                fs.appendFileSync("./database.json", "{}", "utf-8");
        } catch (e) {
            throw new Error(`Failed to create database.json: ${e}`);
        }

        this.cache = JSON.parse(fs.readFileSync("./database.json", "utf-8"));
    }

    /**
     * Creates a new model.
     * @param name Name of the table.
     * @param schema The schema of the table.
     */
    public model(name: string, schema: Schema) {
        Object.keys(schema).forEach((key) => {
            if (![Number, Boolean, Object, Array, Date, String].includes(schema[key]))
                throw new Error(
                    "Types must be either Number, Boolean, Object, Array, Date, or String."
                );
        });

        //@ts-ignore
        schema.createdAt = Date;
        //@ts-ignore
        schema.updatedAt = Date;

        this.models.set(name, schema);

        if (!this.cache[name]) this.cache[name] = {};

        this.__save__();

        const that = this;
        return class __ extends Schema {
            /**
             * The schema.
             */
            static schema = schema;
            /**
             * The name.
             */
            static __name__ = name;

            /**
             * Creates a document.
             * @param data Data to use.
             */
            constructor(data: Schema) {
                super();

                const doc: Schema = {
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

                that.cache[name][this.__id__!] = doc;

                this.__save__();
            }

            /**
             * Creates a document.
             * @param data Data to use.
             */
            public static create(data: Schema) {
                return new __(data);
            }

            /**
             * Wipes the table.
             */
            public static wipe() {
                that.cache[name] = {};
                that.__save__();
            }

            /**
             * Deletes the document.
             */
            public __delete__() {
                delete that.cache[name][this.__id__!];
                that.__save__();
            }

            /**
             * Saves the changed document.
             */
            public __save__() {
                this.updatedAt = new Date();
                Object.keys(__.schema).forEach((key) => {
                    if (this[key].constructor !== __.schema[key])
                        throw new Error(`Mismatched type`);
                    that.cache[name][this.__id__!][key] = this[key];
                });
                that.__save__();
            }

            /**
             * Retrieves an item.
             * @param query Query to search for the item.
             */
            public static findOne(query: any) {
                return this.values.find((item) =>
                    Object.keys(query).every((key) => item[key] === query[key])
                ) as __ | undefined;
            }

            /**
             * Retrieves an item by id.
             * @param id Id to get.
             */
            public static findById(id: any) {
                return this.values.find((item) => item.__id__ === id) as __ | undefined;
            }

            /**
             * Returns all items that satisfy the query.
             * @param query Query to search for.
             */
            public static find(query: any) {
                return this.values.filter((item) =>
                    Object.keys(query).every((key) => item[key] === query[key])
                ) as __[];
            }

            /**
             * Finds one item and deletes it.
             * @param query Query to search for the item.
             */
            public static findOneAndDelete(query: any) {
                const item = __.findOne(query);
                if (!item) throw new Error(`Could not find a document with that query`);
                item.__delete();
                return item;
            }

            /**
             * Finds one item and updates it.
             * @param query Query to search for the item.
             * @param update Data to update.
             */
            public static findOneAndUpdate(query: any, update: any) {
                const item = __.findOne(query);
                if (!item) throw new Error(`Could not find a document with that query`);
                Object.keys(update).forEach((key) => {
                    if (typeof item[key] !== "undefined") item[key] = update[key];
                });
                item.__save__();
                return item;
            }

            /**
             * Updates and inserts if the item does not exist, hence the name, upsert.
             * @param query Query to search for the item.
             * @param data Data to insert.
             */
            public static upsert(query: any, data: any) {
                const item = __.findOne(query);
                if (!item) return __.create(data);
                __.findOneAndUpdate(query, data);
                return item;
            }

            /**
             * All the values in the table.
             */
            public static get values() {
                return Object.values(that.cache[name]) as __[];
            }
        };
    }

    /**
     * Wipes the JSO-, er, database.
     */
    public wipe() {
        this.cache = {};
        this.__save__();
    }

    private __uuid__() {
        return uuid.v4();
    }

    private __save__() {
        fs.writeFileSync("./database.json", JSON.stringify(this.cache, null, 4), "utf-8");
    }

    /**
     * Gets an async driver.
     */
    public static async() {
        return new AsyncSlowDB();
    }
}

export default SlowDB;
exports = SlowDB;
module.exports = SlowDB;

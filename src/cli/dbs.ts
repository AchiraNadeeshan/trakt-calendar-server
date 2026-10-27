import path from "node:path"
import { getDb } from "../utils/authentication";
import { readdir, readFile } from "node:fs/promises";
import dotenv from 'dotenv'


async function main(): Promise<void> {

    dotenv.config({ path: ['.env.local', '.env'] })

    const sqlDir = path.join(__dirname, "..", "..", "..", "src", "dbs");

    const sql = getDb();

    const files = (await readdir(sqlDir))
        .filter((file) => file.endsWith(".sql"))
        .sort();

    const contents = await Promise.all(files.map(async (file) => {
        return readFile(
            path.join(sqlDir, file),
            "utf8"
        );
    }))


    await sql.transaction(contents.map(c =>
        sql.query(c)
    ))

}



void main()

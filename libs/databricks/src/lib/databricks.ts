import { DBSQLClient } from "@databricks/sql";

export class Databricks {
  protected client: DBSQLClient

  constructor() {
    this.client = new DBSQLClient({})
  }

  public async doQuery(queryString: string): Promise<any> {
    const client = await this.client.connect({
      host: process.env["DATABRICKS_HOSTNAME"] || '',
      token: process.env["DATABRICKS_TOKEN"] || '',
      path: process.env["DATABRICKS_SQL_PATH"] || '',
    })

    const session = await client.openSession()
    const query = await session.executeStatement(queryString, {runAsync: true})

    //@TODO Handle progress
    const result = await query.fetchAll({ progress: false })
    await query.close()
    await session.close()
    client.close()

    return result
  }
}

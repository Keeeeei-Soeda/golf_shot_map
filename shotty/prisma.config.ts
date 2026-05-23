import * as dotenvx from 'dotenv'
import path from 'path'
import { defineConfig } from 'prisma/config'

// .env.local を優先して読み込む
dotenvx.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenvx.config({ path: path.resolve(process.cwd(), '.env') })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})

const { Client } = require('pg');

async function test() {
  // Try with sslmode=require
  const configs = [
    { connectionString: 'postgresql://postgres:raeadmin@84.46.254.137:5432/postgres?sslmode=require' },
    { connectionString: 'postgresql://postgres:raeadmin@84.46.254.137:5432/postgres?sslmode=allow' },
    { connectionString: 'postgresql://postgres:raeadmin@84.46.254.137:5432/postgres?sslmode=prefer' },
    { host: '84.46.254.137', port: 5432, user: 'postgres', password: 'raeadmin', database: 'postgres', ssl: false },
    { host: '84.46.254.137', port: 5432, user: 'postgres', password: 'raeadmin', database: 'postgres', ssl: { rejectUnauthorized: false } },
  ];
  
  for (const cfg of configs) {
    const client = new Client({ ...cfg, connectionTimeoutMillis: 10000 });
    try {
      await client.connect();
      console.log('Connected with:', JSON.stringify(cfg).substring(0, 100));
      const res = await client.query('SELECT current_database(), current_user, version()');
      console.log('DB:', res.rows[0]);
      await client.end();
      return;
    } catch (e) {
      console.log('Failed:', e.message.substring(0, 80));
    }
  }
  console.log('All connection attempts failed');
}

test();

import { pool } from '../backend/src/db/pool.js';

async function main() {
  try {
    await pool.query('SET GLOBAL innodb_buffer_pool_size = 2147483648');
    console.log('✓ InnoDB buffer pool size set to 2GB');
  } catch (err) {
    console.warn('Could not set buffer pool dynamically:', err.message);
  }

  try {
    await pool.query('SET GLOBAL innodb_io_capacity = 1000');
    await pool.query('SET GLOBAL innodb_flush_log_at_trx_commit = 2');
    console.log('✓ InnoDB IO capacity and flush settings optimized');
  } catch (err) {
    console.warn('IO settings:', err.message);
  }

  const [vars] = await pool.query("SHOW VARIABLES LIKE 'innodb_buffer_pool_size'");
  console.log('Active Buffer Pool:', vars);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

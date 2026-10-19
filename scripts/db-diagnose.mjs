import { pool } from '../backend/src/db/pool.js';

async function main() {
  const [rows] = await pool.query('SHOW FULL PROCESSLIST');
  console.log('Total MySQL threads:', rows.length);
  rows.filter(r => r.Command !== 'Sleep').forEach(r => {
    console.log('ID:', r.Id, 'Time:', r.Time, 'Command:', r.Command, 'State:', r.State, 'Info:', (r.Info || '').slice(0, 150));
  });

  const [vars] = await pool.query("SHOW VARIABLES WHERE Variable_name IN ('innodb_buffer_pool_size', 'max_connections', 'innodb_io_capacity', 'innodb_log_file_size', 'innodb_flush_log_at_trx_commit', 'sync_binlog')");
  console.log('\n--- InnoDB Variables ---');
  vars.forEach(v => console.log(`${v.Variable_name}: ${v.Value} (${(Number(v.Value) / (1024*1024)).toFixed(1)} MB)`));

  const [indexes] = await pool.query("SHOW INDEX FROM posts");
  console.log('\n--- Posts Indexes ---');
  const indexMap = {};
  indexes.forEach(idx => {
    indexMap[idx.Key_name] = (indexMap[idx.Key_name] || []).concat(idx.Column_name);
  });
  console.log(indexMap);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

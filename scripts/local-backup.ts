import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
const source = path.resolve(process.env.LOCAL_DATA_DIR || '.local-data');
const target = path.resolve('backups', `local-${new Date().toISOString().replace(/[:.]/g, '-')}`);
await mkdir(path.dirname(target), { recursive: true });
await cp(source, target, { recursive: true, errorOnExist: true, force: false });
console.log(`백업: ${target}\n일관된 백업은 서버를 중지하고 실행해야 합니다.`);

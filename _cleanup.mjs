import { unlinkSync } from 'fs'
try { unlinkSync('./src/middleware.ts'); console.log('deleted') } catch(e) { console.log(e.message) }
try { unlinkSync('./_cleanup.mjs'); } catch {}

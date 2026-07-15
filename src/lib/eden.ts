import { edenTreaty } from '@elysiajs/eden';
// TODO: Fix monorepo type sharing (App generic constraint mismatch due to separate node_modules).
// Requires setting up a bun workspace or generating a shared .d.ts file.
// import type { App } from '../../../kwickly-api/src/server.ts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const eden = edenTreaty<any>(API_URL);

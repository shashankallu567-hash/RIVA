const http = require('http');

const routes = [
  '/',
  '/customer',
  '/customer/assistant',
  '/customer/products',
  '/customer/returns',
  '/customer/profile',
  '/staff',
  '/staff/inventory',
  '/staff/returns',
  '/staff/tickets',
  '/staff/profile',
  '/admin',
  '/admin/products',
  '/admin/inventory',
  '/admin/policies',
  '/admin/users',
  '/admin/tickets',
  '/admin/analytics',
  '/admin/audit-logs',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/unauthorized'
];

async function checkRoutes() {
  console.log('--- Testing RIVA HTTP Route Endpoints ---');
  let passed = 0;
  for (const r of routes) {
    await new Promise((resolve) => {
      http.get(`http://localhost:3000${r}`, (res) => {
        console.log(`[HTTP ${res.statusCode}] ${r}`);
        if (res.statusCode === 200) passed++;
        resolve();
      }).on('error', (e) => {
        console.error(`[ERROR] ${r}: ${e.message}`);
        resolve();
      });
    });
  }
  console.log(`\nResult: ${passed}/${routes.length} routes responded with HTTP 200 OK!`);
}

checkRoutes();

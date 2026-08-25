async function testLogin() {
  const res = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'demo.patient@aabha.ai', password: 'demo123' })
  });
  const data = await res.json();
  console.log('API Login Response:', data);
}
testLogin();

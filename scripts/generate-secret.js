// scripts/generate-secret.js
// Script untuk generate NEXTAUTH_SECRET yang kuat

const crypto = require('crypto');

const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString('base64');
};

console.log('\n🔐 NEXTAUTH_SECRET Generator\n');
console.log('Copy salah satu secret di bawah ke file .env Anda:\n');
console.log('NEXTAUTH_SECRET="' + generateSecret(32) + '"');
console.log('\nAtau yang lebih panjang (64 bytes):');
console.log('NEXTAUTH_SECRET="' + generateSecret(64) + '"');
console.log('\n✅ Secret telah di-generate! Simpan dengan aman.\n');

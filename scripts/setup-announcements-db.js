// Script to set up announcements database tables
// Run this with: node scripts/setup-announcements-db.js

const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up announcements database tables...');
    
    const sqlPath = path.join(__dirname, '../database-announcements-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL Schema loaded:');
    console.log('- announcements table');
    console.log('- announcement_deliveries table');
    console.log('- indexes for performance');
    console.log('- sample data');
    
    console.log('\n📋 To execute this schema, run one of these commands:');
    console.log('\n🔧 If you have psql installed:');
    console.log('psql -h localhost -U postgres -d nvcc_techclub -f database-announcements-schema.sql');
    
    console.log('\n🔧 Or using your database management tool:');
    console.log('Copy and paste the SQL content from database-announcements-schema.sql');
    
    console.log('\n📊 Tables that will be created:');
    console.log('1. announcements - stores announcement details');
    console.log('2. announcement_deliveries - tracks individual email deliveries');
    
    console.log('\n✨ Features enabled:');
    console.log('- Send to all approved members');
    console.log('- Send to specific recipients');  
    console.log('- Priority levels (low, normal, high, urgent)');
    console.log('- Delivery status tracking');
    console.log('- Failed delivery error logging');
    console.log('- Draft system');
    
    console.log('\n🎯 Next steps:');
    console.log('1. Run the SQL schema in your database');
    console.log('2. Visit /admin/announcements to start sending announcements');
    console.log('3. Check the "Delivery Tracking" tab to monitor email status');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupDatabase();

// Direct script to import the tech_club_contacts.csv data
// Run this with: node scripts/import-contacts-csv.js

const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvPath = path.join(__dirname, '../public/tech_club_contacts.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Parse CSV
function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.some(v => v !== '')) { // Skip completely empty lines
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
  }

  return data;
}

// Convert to membership applications format
function convertToApplications(csvData) {
  return csvData.map(row => {
    // Skip empty rows
    if (!row.Name || row.Name.trim() === '') {
      return null;
    }

    // Split name into first and last name
    const nameParts = row.Name.trim().split(' ');
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || 'Unknown';

    // Create email from prefix
    const emailPrefix = row['Email Prefix']?.trim();
    const email = emailPrefix ? `${emailPrefix}@email.vccs.edu` : `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.vccs.edu`;

    // Handle phone number
    const phone = row['Phone Number']?.trim() || null;

    return {
      first_name: firstName,
      last_name: lastName,
      email: email,
      major: 'Computer Science', // Default major
      areas_of_interest: 'General Technology, Programming', // Default interests
      technical_experience_level: 'beginner', // Default experience level
      goals: 'Learn and grow with the tech club', // Default goals
      github_username: null,
      linkedin_url: null,
      phone: phone,
      graduation_year: '2025', // Default graduation year
      preferred_contact_method: 'email',
      status: 'pending'
    };
  }).filter(app => app !== null);
}

// Main execution
async function importContacts() {
  try {
    console.log('Reading CSV file...');
    const csvData = parseCSV(csvContent);
    console.log(`Found ${csvData.length} rows in CSV`);

    console.log('Converting to applications format...');
    const applications = convertToApplications(csvData);
    console.log(`Created ${applications.length} applications`);

    // Make API call to import
    console.log('Sending to API...');
    const response = await fetch('http://localhost:3000/api/admin/import-csv-members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ csvData }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Import successful!');
      console.log(`📊 Imported: ${result.imported} applications`);
      
      if (result.errors && result.errors.length > 0) {
        console.log('⚠️  Warnings:');
        result.errors.forEach(error => console.log(`  - ${error}`));
      }
    } else {
      console.error('❌ Import failed:', result.message);
      if (result.errors) {
        result.errors.forEach(error => console.error(`  - ${error}`));
      }
    }

  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

// For direct execution
if (require.main === module) {
  importContacts();
}

module.exports = { parseCSV, convertToApplications };

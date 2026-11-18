# Email Domain Constraint Setup

This guide explains how to set up the email domain constraint to ensure only `@email.vccs.edu` addresses are accepted.

## 🔧 **Database Setup**

### **Step 1: Run the Email Constraint SQL**

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Create a **New Query**
4. Copy and paste the content from `email-constraint.sql`
5. Click **Run**

This will add constraints to:
- `user_profiles` table
- `membership_applications` table

### **Step 2: Verify the Constraints**

Run this query to verify the constraints were added:

```sql
SELECT 
    table_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE constraint_name LIKE '%email%' 
AND table_schema = 'public';
```

## ✅ **Application-Level Validation**

The following validation has been implemented:

### **1. Authentication (`lib/auth.ts`)**
- ✅ Email validation in `signUp()` function
- ✅ Email validation in `signIn()` function
- ✅ Helper functions: `validateEmailDomain()` and `getEmailDomainError()`

### **2. Membership Applications (`lib/database.ts`)**
- ✅ Email validation in `submitMembershipApplication()` function

### **3. User Interface**
- ✅ **Login Page**: Email validation and helpful placeholder
- ✅ **Register Page**: Email validation and helpful placeholder  
- ✅ **Home Page**: Email validation in membership form

## 🎯 **How It Works**

### **Database Level**
- **Constraint**: `CHECK (email LIKE '%@email.vccs.edu')`
- **Tables**: `user_profiles`, `membership_applications`
- **Effect**: Prevents invalid emails from being stored

### **Application Level**
- **Validation**: `validateEmailDomain(email)` function
- **Error Message**: "Email must end with @email.vccs.edu"
- **Effect**: Provides immediate feedback to users

## 🚨 **Error Handling**

### **Database Errors**
If someone tries to insert an invalid email, they'll get:
```
ERROR: new row for relation "user_profiles" violates check constraint "check_email_domain"
```

### **Application Errors**
Users will see:
```
Email must end with @email.vccs.edu
```

## 📝 **Testing**

### **Valid Emails**
- ✅ `john.doe@email.vccs.edu`
- ✅ `jane.smith@email.vccs.edu`
- ✅ `student123@email.vccs.edu`

### **Invalid Emails**
- ❌ `john.doe@gmail.com`
- ❌ `jane.smith@yahoo.com`
- ❌ `student123@hotmail.com`
- ❌ `john.doe@vccs.edu` (missing 'email.')

## 🔄 **Migration Notes**

If you have existing data with invalid emails:

1. **Update existing records**:
```sql
-- Update user_profiles (if needed)
UPDATE user_profiles 
SET email = REPLACE(email, '@vccs.edu', '@email.vccs.edu')
WHERE email LIKE '%@vccs.edu' AND email NOT LIKE '%@email.vccs.edu';

-- Update membership_applications (if needed)
UPDATE membership_applications 
SET email = REPLACE(email, '@vccs.edu', '@email.vccs.edu')
WHERE email LIKE '%@vccs.edu' AND email NOT LIKE '%@email.vccs.edu';
```

2. **Then add the constraints** using the `email-constraint.sql` file

## 🎉 **Benefits**

- ✅ **Security**: Ensures only legitimate VCCS students can register
- ✅ **Data Integrity**: Prevents invalid emails at database level
- ✅ **User Experience**: Clear error messages and helpful placeholders
- ✅ **Consistency**: All forms validate email domain uniformly 
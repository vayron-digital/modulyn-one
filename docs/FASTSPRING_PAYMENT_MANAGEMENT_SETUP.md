# FastSpring Store Builder Library (SBL) Setup

Complete guide for setting up FastSpring's Store Builder Library for payment management in your Modulyn CRM.

## 🚀 Overview

The Store Builder Library (SBL) is FastSpring's newer, more secure integration method that uses encryption and certificates. This provides better security and more control over the payment management experience.

## 📋 Setup Steps

### Step 1: Configure SBL in FastSpring Dashboard

1. **Go to FastSpring Dashboard**
   - Login to your FastSpring account
   - Navigate to **Developer Tools** → **Store Builder Library**

2. **Your SBL Configuration**
   - **Access Key**: `G4FOKIZVRYCT66QQENEBJG`
   - **Public Certificate**: (You need to generate this)

### Step 2: Generate Encryption Keys

You need to generate a **private key** and **public certificate**:

#### **Generate Private Key** (keep this secret):
```bash
openssl genrsa -out private_key.pem 2048
```

#### **Generate Public Certificate** (upload to FastSpring):
```bash
openssl req -new -x509 -key private_key.pem -out public_cert.pem -days 365
```

#### **Upload Certificate**:
1. Copy the contents of `public_cert.pem`
2. Paste it into the **Public Certificate** field in FastSpring
3. Click **Save**

### Step 3: Environment Variables

Add these to your Vercel environment:

```env
# FastSpring SBL Configuration
FASTSPRING_SBL_ACCESS_KEY=G4FOKIZVRYCT66QQENEBJG
FASTSPRING_SBL_PRIVATE_KEY=your_private_key_content_here
FASTSPRING_STORE_ID=usercentraltechnologies_store

# Frontend
VITE_FASTSPRING_STORE_ID=usercentraltechnologies_store
```

### Step 4: Integration in Your CRM

The payment management component is already integrated into your subscription page. Here's how it works:

#### Component Location
- **File**: `frontend/src/components/settings/PaymentManagement.tsx`
- **Page**: `/settings/subscription`
- **Visibility**: Only shown to active subscribers

#### Features Included
- ✅ **Secure SBL Integration** - Uses encryption and certificates
- ✅ **Add/Remove Payment Methods**
- ✅ **Update Default Payment Method**
- ✅ **Edit Existing Payment Methods**
- ✅ **Branded UI Matching Your Theme**

### Step 5: How It Works

#### Script Loading
The component automatically loads the FastSpring SBL script:
```html
<script src="https://d1f8f9xcsvx3ha.cloudfront.net/sbl/0.8.3/fastspring-builder.min.js"></script>
```

#### User Interaction
1. **User clicks** "Manage Payment Methods" button
2. **SBL component** creates payment management interface
3. **User manages** payment methods securely
4. **Component closes** and returns to your CRM

#### Required Data
- **Customer ID**: From `subscription.fastspring_customer_id`
- **Subscription ID**: From `subscription.subscription_id`
- **Store ID**: `usercentraltechnologies_store`
- **Access Key**: `G4FOKIZVRYCT66QQENEBJG`

## 🧪 Testing

### 1. Test Payment Management Access
1. **Login as an active subscriber**
2. **Go to**: `https://modulyn.vayronhq.com/settings/subscription`
3. **Scroll down** to see the Payment Management section
4. **Click** "Manage Payment Methods" button
5. **Verify** SBL component loads correctly

### 2. Test Payment Operations
1. **Add a new payment method** using SBL interface
2. **Update default payment method**
3. **Remove an existing payment method**
4. **Edit payment method details**

### 3. Test Security
1. **Verify** encryption is working
2. **Check** that only active subscribers can access
3. **Confirm** secure communication with FastSpring

## 🔧 Configuration

#### Environment Variables
Make sure these are set in your Vercel environment:

```env
# FastSpring SBL Configuration
FASTSPRING_SBL_ACCESS_KEY=G4FOKIZVRYCT66QQENEBJG
FASTSPRING_SBL_PRIVATE_KEY=your_private_key_content_here
FASTSPRING_STORE_ID=usercentraltechnologies_store

# Frontend
VITE_FASTSPRING_STORE_ID=usercentraltechnologies_store
```

#### Component Configuration
The component is configured with:

```javascript
{
  id: 'payment-management-component',
  storeId: 'usercentraltechnologies_store',
  customerId: customerId,
  subscriptionId: subscriptionId,
  theme: {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderRadius: '8px',
    fontFamily: 'Inter, system-ui, sans-serif'
  }
}
```

## 🚨 Troubleshooting

### Component Not Loading?
1. **Check** SBL access key is correct
2. **Verify** private/public key pair is valid
3. **Check browser console** for JavaScript errors
4. **Confirm** subscription status is 'active'

### SBL Errors?
1. **Verify** encryption keys are properly configured
2. **Check** FastSpring SBL documentation
3. **Review** browser console for SBL errors
4. **Test** with different browsers

### Styling Issues?
1. **Check** theme configuration
2. **Verify** colors match your CRM theme
3. **Test** on different screen sizes
4. **Confirm** SBL component displays correctly

## 📊 Monitoring

### FastSpring Dashboard
- **SBL Usage**: Monitor component usage
- **Transactions**: Track payment method updates
- **Errors**: Review any failed operations

### Your CRM Logs
- **Component Load**: Check if SBL script loads
- **Button Clicks**: Track user interactions
- **SBL Errors**: Monitor for encryption issues

## 🔒 Security Features

### Built-in Security
- ✅ **Encryption**: All requests encrypted with your keys
- ✅ **Certificate-based**: Uses public/private key pairs
- ✅ **Secure Communication**: All data encrypted in transit
- ✅ **No Data Storage**: Payment data never stored on your servers

### Best Practices
- **Keep Private Key Secure**: Never expose in client-side code
- **Rotate Keys**: Update certificates periodically
- **Monitor Usage**: Track SBL component usage
- **Error Handling**: Graceful fallbacks for security issues

## 🎯 User Experience

### For Active Subscribers
- **One-Click Access**: Simple button to open payment management
- **Secure SBL Interface**: Encrypted communication with FastSpring
- **Branded Experience**: Matches your CRM's design
- **Quick Return**: Easy to return to CRM after managing payments

### For Trial Users
- **Clear Messaging**: Shows why payment management isn't available
- **Upgrade Prompt**: Encourages subscription upgrade
- **Consistent UI**: Maintains design consistency

## 📞 Support

### FastSpring Support
- **SBL Documentation**: [FastSpring SBL Docs](https://docs.fastspring.com)
- **API Reference**: [FastSpring API Docs](https://api.fastspring.com)
- **Support Portal**: Contact FastSpring support for SBL issues

### Your CRM Support
- **Component Issues**: Check browser console and network logs
- **SBL Problems**: Review encryption key configuration
- **Styling Issues**: Verify theme settings

## 🚀 Next Steps

1. **Generate encryption keys** using OpenSSL
2. **Upload public certificate** to FastSpring
3. **Set environment variables** in Vercel
4. **Deploy** the updated subscription page
5. **Test** SBL payment management functionality
6. **Monitor** usage and performance

Your customers can now manage their payment methods through FastSpring's secure SBL integration! 🎉

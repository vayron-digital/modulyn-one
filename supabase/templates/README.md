# Modulyn CRM Email Templates

This directory contains custom email templates for Supabase authentication flows that match the Modulyn CRM native UI design system.

## 📧 Available Templates

### 1. **Confirm Signup** (`confirm-signup.html`)
- **Purpose**: Email confirmation for new user registrations
- **Variable**: `{{ .ConfirmationURL }}`
- **Use Case**: When users sign up and need to verify their email address

### 2. **Invite User** (`invite-user.html`)
- **Purpose**: Team invitation emails
- **Variable**: `{{ .ConfirmationURL }}`
- **Use Case**: When existing users invite new team members

### 3. **Magic Link** (`magic-link.html`)
- **Purpose**: Passwordless authentication
- **Variable**: `{{ .ConfirmationURL }}`
- **Use Case**: When users request a magic link to sign in

### 4. **Change Email Address** (`change-email.html`)
- **Purpose**: Email address change confirmation
- **Variable**: `{{ .ConfirmationURL }}`
- **Use Case**: When users request to change their email address

### 5. **Reset Password** (`reset-password.html`)
- **Purpose**: Password reset functionality
- **Variable**: `{{ .ConfirmationURL }}`
- **Use Case**: When users forget their password and request a reset

### 6. **Reauthentication** (`reauthentication.html`)
- **Purpose**: Multi-factor authentication or security verification
- **Variable**: `{{ .Token }}`
- **Use Case**: When users need to reauthenticate for sensitive operations

## 🎨 Design System Integration

All templates use the Modulyn CRM design system:

### Colors
- **Primary**: `#ff0141` (Modulyn Flame)
- **Secondary**: `#1a1a20` (Charcoal Tint)
- **Background**: `#ffffff` (Snowfield)
- **Text**: `#4a4a4f` (On Surface Soft)
- **Success**: `#06d6a0` (Emerald Rise)
- **Warning**: `#ffb703` (Amber Pulse)
- **Error**: `#e63946` (Inferno Red)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300-900
- **Responsive Design**: Mobile-first approach

### Components
- **Buttons**: Gradient primary buttons with hover effects
- **Info Boxes**: Color-coded information containers
- **Warning Boxes**: Security and important notices
- **Token Display**: Monospace font for verification tokens

## ⚙️ Configuration

The templates are configured in `supabase/config.toml`:

```toml
[auth.email.template.confirm]
subject = "Confirm Your Email Address - Modulyn CRM"
content_path = "./supabase/templates/confirm-signup.html"

[auth.email.template.invite]
subject = "You've Been Invited to Join Modulyn CRM"
content_path = "./supabase/templates/invite-user.html"

[auth.email.template.magic_link]
subject = "Your Magic Link - Modulyn CRM"
content_path = "./supabase/templates/magic-link.html"

[auth.email.template.change_email]
subject = "Confirm Your New Email Address - Modulyn CRM"
content_path = "./supabase/templates/change-email.html"

[auth.email.template.recovery]
subject = "Reset Your Password - Modulyn CRM"
content_path = "./supabase/templates/reset-password.html"

[auth.email.template.reauthentication]
subject = "Reauthentication Required - Modulyn CRM"
content_path = "./supabase/templates/reauthentication.html"
```

## 🚀 Usage

### Local Development
1. Ensure Supabase is running locally: `supabase start`
2. Templates will be automatically used for email testing
3. View sent emails in the Inbucket interface (usually at `http://localhost:54324`)

### Production Deployment
1. Deploy templates to your Supabase project
2. Update the `config.toml` with production paths
3. Restart Supabase services: `supabase stop && supabase start`

## 📱 Responsive Design

All templates are mobile-responsive and include:
- Flexible layouts that adapt to screen size
- Optimized typography for mobile devices
- Touch-friendly button sizes
- Proper spacing for mobile viewing

## 🔧 Customization

### Modifying Templates
1. Edit the HTML files in this directory
2. Maintain the Supabase template variables (e.g., `{{ .ConfirmationURL }}`)
3. Keep the design system colors and typography consistent
4. Test changes locally before deploying

### Adding New Templates
1. Create a new HTML file following the existing structure
2. Add the template configuration to `config.toml`
3. Use the base styling from existing templates
4. Test thoroughly with different email clients

## 🧪 Testing

### Email Client Compatibility
Templates are tested and optimized for:
- Gmail (Web & Mobile)
- Outlook (Web & Desktop)
- Apple Mail
- Thunderbird
- Mobile email apps

### Browser Testing
- Chrome, Firefox, Safari, Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📋 Best Practices

1. **Keep it Simple**: Avoid complex layouts that may break in email clients
2. **Use Inline Styles**: Email clients often strip external CSS
3. **Test Thoroughly**: Always test in multiple email clients
4. **Maintain Branding**: Keep consistent with the Modulyn CRM design system
5. **Security First**: Include appropriate security notices and warnings
6. **Clear CTAs**: Make action buttons prominent and clear

## 🆘 Support

If you encounter issues with the email templates:
1. Check the Supabase logs for template errors
2. Verify template paths in `config.toml`
3. Test templates locally first
4. Consult Supabase documentation for template syntax

## 📄 License

These templates are part of the Modulyn CRM project and follow the same licensing terms.

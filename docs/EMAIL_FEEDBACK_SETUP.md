# Email & Feedback Setup Guide

## ✅ What's Been Added

### 1. Email Capture Component
- **Location**: Appears on homepage below the CTA section
- **Features**: 
  - Clean, professional design matching your brand
  - Email validation
  - Success/error states
  - "No spam" messaging for trust
  - Currently stores emails in localStorage (temporary)

### 2. Feedback Button
- **Location**: Floating button on bottom-right of all pages
- **Features**:
  - Visible feedback button with icon
  - Modal form for quick feedback
  - Direct mailto link option
  - Stores feedback locally for backup
  - Non-intrusive but discoverable

---

## 🚀 Quick Setup Options

### Option 1: Google Forms (Easiest - 5 minutes)

1. **Create a Google Form**:
   - Go to [Google Forms](https://forms.google.com)
   - Create a new form with just one field: "Email"
   - Click "Send" → Click the `<>` icon to get the embed code
   - Copy the form URL

2. **Update EmailCapture.tsx**:
   ```tsx
   // In src/components/EmailCapture.tsx, line ~24
   const formData = new FormData();
   formData.append('entry.XXXXXX', email); // Replace XXXXXX with your entry ID
   
   await fetch('YOUR_GOOGLE_FORM_URL', {
     method: 'POST',
     body: formData,
     mode: 'no-cors',
   });
   ```

3. **Find your entry ID**:
   - Right-click on the email field → Inspect
   - Look for `name="entry.XXXXXX"` in the HTML
   - Use that number in your code

**Pros**: Free, instant setup, emails go to Google Sheets
**Cons**: No automated emails, requires Google account

---

### Option 2: Buttondown (Recommended - 10 minutes)

1. **Sign up**: [Buttondown.email](https://buttondown.email) (free up to 100 subscribers)

2. **Get API Key**: Settings → API → Create API key

3. **Update EmailCapture.tsx**:
   ```tsx
   // Replace the handleSubmit function
   await fetch('https://api.buttondown.email/v1/subscribers', {
     method: 'POST',
     headers: {
       'Authorization': `Token YOUR_API_KEY`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       email: email,
       tags: ['specifythat'],
     }),
   });
   ```

**Pros**: Professional, can send automated emails, great UI
**Cons**: Requires sign-up (but free tier is generous)

---

### Option 3: Mailchimp (Enterprise - 15 minutes)

1. **Sign up**: [Mailchimp](https://mailchimp.com) (free up to 500 subscribers)

2. **Create Audience**: Create new audience list

3. **Get API Key**: Profile → Extras → API keys

4. **Update EmailCapture.tsx**:
   ```tsx
   await fetch('https://YOUR_DC.api.mailchimp.com/3.0/lists/YOUR_LIST_ID/members', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer YOUR_API_KEY`,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       email_address: email,
       status: 'subscribed',
     }),
   });
   ```

**Pros**: Industry standard, powerful features, great analytics
**Cons**: More complex, overkill for starting out

---

## 📧 Email Configuration

### Update Feedback Email
Replace `feedback@specifythat.com` with your actual email in:
- `src/components/FeedbackButton.tsx` (line ~32 and ~144)

### Recommended Setup
1. Create a free email: `feedback@yourdomain.com` or use personal email
2. Update both occurrences in FeedbackButton.tsx
3. Test by clicking feedback button and sending email

---

## 🧪 Testing Checklist

Before launching, test:

- [ ] Email signup works (check localStorage for now)
- [ ] Email validation catches invalid emails
- [ ] Success message displays correctly
- [ ] Feedback button is visible on all pages
- [ ] Feedback modal opens and closes
- [ ] Mailto link works with your email client
- [ ] Feedback submission shows success state
- [ ] Mobile responsive on both components

---

## 🎨 Customization Options

### Change Email Button Text
In `EmailCapture.tsx`, line ~79:
```tsx
{status === 'loading' ? 'Signing up...' : 'Notify Me'}
```

### Change Feedback Button Position
In `FeedbackButton.tsx`, line ~47:
```tsx
className="fixed bottom-6 right-6..."  // Change bottom-6, right-6
```

### Hide Feedback on Specific Pages
In `page.tsx`, conditionally render:
```tsx
{!isSpecialPage && <FeedbackButton />}
```

---

## 📊 Tracking Signups (Current Setup)

Emails are currently stored in browser localStorage. To view them:

1. Open browser console (F12)
2. Run: `JSON.parse(localStorage.getItem('email_signups'))`
3. Export manually before launch

**Before launch, implement one of the options above!**

---

## 🚨 Pre-Launch Checklist

- [ ] Choose and implement email service (Option 1, 2, or 3)
- [ ] Update feedback email address
- [ ] Test email signup flow
- [ ] Test feedback submission
- [ ] Check mobile responsiveness
- [ ] Verify no console errors
- [ ] Test mailto links work
- [ ] Add email to privacy policy if you have one

---

## 💡 Post-Launch Tips

1. **First Week**: Check localStorage daily for signups
2. **Send First Email**: Within 24 hours, send "thanks for signing up"
3. **Monitor Feedback**: Check feedback daily for the first week
4. **Iterate**: Update copy based on user feedback

---

## 🆘 Troubleshooting

**Email not submitting?**
- Check browser console for errors
- Verify API keys are correct
- Check network tab for failed requests

**Feedback button not showing?**
- Verify FeedbackButton is imported
- Check z-index isn't being overridden
- Look for console errors

**Need help?**
- The components store data locally as backup
- All user submissions are logged in console
- Check browser localStorage for debugging

---

## Next Steps

1. Pick an email service (I recommend starting with Google Forms for launch day)
2. Update the email in FeedbackButton.tsx
3. Test both features
4. You're ready to launch! 🚀

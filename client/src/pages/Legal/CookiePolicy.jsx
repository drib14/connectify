import React from 'react';

const CookiePolicy = () => {
  return (
    <div className="legal-content-body">
      <p className="legal-subtitle">Last Updated: June 20, 2026</p>
      
      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies and local storage are small text files or database keys placed on your computer or mobile device when you browse websites. We use cookies and local browser storage to ensure Connectify operates smoothly, safely, and honors your personal preferences.
      </p>

      <h2>2. How Connectify Uses Cookies</h2>
      <p>
        We do not use advertising or tracking cookies. We utilize cookies and browser storage solely for core functional and security operations:
      </p>
      <ul>
        <li><strong>Authentication & Security:</strong> We use secure JSON Web Tokens (JWT) stored in your browser to maintain your logged-in session. These verify your identity and protect your data from unauthorized access.</li>
        <li><strong>User Preferences:</strong> Local storage is used to remember your active screen preferences, such as Like-Free Mode status, Dark Mode configurations, and Slow Feed settings. This prevents you from having to re-configure them on every page load.</li>
        <li><strong>Session Limits (Wellbeing):</strong> Temporary timers track session intervals to calculate doomscroll notifications and trigger break reminders.</li>
      </ul>

      <h2>3. Third-Party Cookies</h2>
      <p>
        Some components of our platform rely on external services which may place cookies to enable integration features:
      </p>
      <ul>
        <li><strong>Paymongo:</strong> When conducting payment transactions or upgrading to Premium, Paymongo may set functional cookies to secure the checkout session and prevent fraudulent activity.</li>
        <li><strong>Cloudinary:</strong> Media loaders may save transient cookies to optimize photo layouts and improve loading performance.</li>
      </ul>

      <h2>4. Managing Your Cookies</h2>
      <p>
        You can control or delete cookies through your web browser settings. However, please note that disabling essential authentication cookies will prevent you from logging in, creating posts, or updating your goals on Connectify.
      </p>
    </div>
  );
};

export default CookiePolicy;

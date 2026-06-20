import React from 'react';

const TermsOfService = () => {
  return (
    <div className="legal-content-body">
      <p className="legal-subtitle">Last Updated: June 20, 2026</p>
      
      <h2>1. Acceptance of Terms</h2>
      <p>
        By creating an account, accessing, or using the <strong>Connectify</strong> platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you are prohibited from using the platform.
      </p>

      <h2>2. User Registration & Eligibility</h2>
      <p>
        You must be at least 13 years of age to register for Connectify. You represent and warrant that all registration details submitted are accurate, truthful, and complete. You are solely responsible for protecting your account credentials and passwords.
      </p>

      <h2>3. Trust Circles & Content Scope</h2>
      <p>
        Connectify provides selective sharing mechanics known as <strong>Trust Circles</strong> (Family, Friends, Coworkers, Classmates).
      </p>
      <ul>
        <li>Content restricted to a specific circle is only queried and delivered to verified members of that circle.</li>
        <li>While Connectify deploys software constraints to restrict visibility, you should exercise prudent judgment when sharing highly sensitive personal material.</li>
        <li>Connectify is not liable for unauthorized distribution, screenshotting, or offline leaks of content shared within private circles.</li>
      </ul>

      <h2>4. Disposable Profiles & Anon Policy</h2>
      <p>
        Connectify allows users to generate temporary, self-destructing personas (<strong>Disposable Profiles</strong>) tied to specific communities.
      </p>
      <ul>
        <li>Disposable profiles must adhere to our standard Community Guidelines. Hate speech, harassment, spam, and cyberbullying are strictly prohibited under any alias.</li>
        <li>Connectify retains internal logging mapping the disposable profile to the primary account for security and legal moderation compliance. We do not expose this linkage to other users unless compelled by legal processes.</li>
      </ul>

      <h2>5. Mental Wellbeing & Doomscroll Prevention</h2>
      <p>
        Connectify offers features to support mental health, including Like-Free Mode, Slow Feed limits, and screen timers.
      </p>
      <ul>
        <li>These features are indicators and support tools and should not be used as a substitute for professional mental health care or medical advice.</li>
        <li>Connectify is not responsible for the user's emotional or psychological state. Enabling or disabling these limits remains the sole responsibility of the user.</li>
      </ul>

      <h2>6. Digital Legacy Protocol</h2>
      <p>
        By configuring your Digital Legacy, you designate a trustee and set an execution policy (Memorialize, Delete, or Transfer) upon a prolonged period of inactivity (default 180 days).
      </p>
      <ul>
        <li>You agree that Connectify may notify and transfer account data or metadata to your designated trustee upon verification of inactivity or probate documentation.</li>
        <li>You release Connectify from liability for disclosing, deleting, or preserving account content in accordance with your configured preferences.</li>
      </ul>

      <h2>7. Monetization, Premium Tiers, & Peace Coins</h2>
      <p>
        Premium subscriptions are billed monthly. Peace Coins are a virtual utility token used within Connectify to reward constructive contributions and tip posts or comments.
      </p>
      <ul>
        <li>Peace Coins have no real-world monetary value, cannot be traded for fiat currency, and are non-refundable.</li>
        <li>All payment processing is handled by third-party processors (Paymongo). Connectify does not store raw credit card details.</li>
      </ul>

      <h2>8. Limitations of Liability</h2>
      <p>
        Connectify is provided on an "as is" and "as available" basis. We make no warranties, expressed or implied, regarding system availability, security, or error-free operations. We disclaim all liability for user-generated content, comments, or external links.
      </p>
    </div>
  );
};

export default TermsOfService;

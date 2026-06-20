import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="legal-content-body">
      <p className="legal-subtitle">Last Updated: June 20, 2026</p>
      
      <h2>1. Information We Collect</h2>
      <p>
        We collect information to deliver a personalized, growth-oriented, and secure social experience.
      </p>
      <ul>
        <li><strong>Account Information:</strong> Your name, username, email address, password (hashed using bcrypt), and premium subscription status.</li>
        <li><strong>Profile Data:</strong> Avatars, cover photos, bio, skills, mood trackers, and custom categories.</li>
        <li><strong>User-Generated Content:</strong> Posts, goals, comments, reviews, anonymous questions, and private journal entries (saved securely).</li>
        <li><strong>Trust Circle Definitions:</strong> User IDs grouped into Family, Friends, Coworkers, or Classmates.</li>
        <li><strong>Usage Analytics:</strong> Screen time minutes and feed refresh frequencies used solely to calculate and trigger doomscroll warnings.</li>
      </ul>

      <h2>2. How We Process Your Data</h2>
      <p>
        Your data is processed in accordance with strict privacy principles:
      </p>
      <ul>
        <li><strong>Feed Customization:</strong> Enforcing Trust Circle visibility and delivering slow feed rate-limits.</li>
        <li><strong>Wellbeing Alerts:</strong> Active timing computations to notify you when daily screen limits are breached.</li>
        <li><strong>Reputation Logic:</strong> Aggregating constructive feedback scores, contribution scores, and trust ratings.</li>
        <li><strong>Digital Legacy Claims:</strong> Initiating trustee notifications if no activity is logged past your designated threshold.</li>
      </ul>

      <h2>3. Third-Party Data Disclosures</h2>
      <p>
        We never sell your personal data. We utilize trusted third-party APIs to deliver specialized functionalities:
      </p>
      <ul>
        <li><strong>Cloudinary:</strong> Image and video storage. Your media files are hosted on Cloudinary's secure content delivery network.</li>
        <li><strong>Paymongo:</strong> Processes subscription billing. Payment card data is processed directly by Paymongo under PCI-compliance rules.</li>
        <li><strong>LocationIQ:</strong> Resolves text locations to coordinate maps. Only text strings entered in location fields are queried.</li>
      </ul>

      <h2>4. GDPR & Your Privacy Rights</h2>
      <p>
        In accordance with the General Data Protection Regulation (GDPR) and similar privacy rules, you possess full authority over your data:
      </p>
      <ul>
        <li><strong>Right to be Forgotten:</strong> Deleting your account will trigger immediate, recursive deletion of all posts, profile documents, and database entries.</li>
        <li><strong>Right to Portability:</strong> You can view, copy, and request extraction of your personal goals, journal entries, and profile history.</li>
        <li><strong>Consent Withdrawal:</strong> You can modify or turn off wellbeing tracking, location features, and notification preferences at any time from your settings panel.</li>
      </ul>

      <h2>5. Security of Private Journals</h2>
      <p>
        We recognize the sensitive nature of your personal goals and diary entries. Your personal journal content is marked private by default and stored behind token-based authorization filters. It is never exposed to public crawlers or internal recommendations.
      </p>
    </div>
  );
};

export default PrivacyPolicy;

import { Link } from 'react-router-dom';
import './Auth.css';

const Terms = () => {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <Link to="/register" className="auth-link">← Back to Registration</Link>
          <h1 className="heading-1" style={{ marginTop: '16px' }}>
            <span className="text-gradient">Connectify</span>
          </h1>
          <p style={{ color: 'var(--text-tertiary)', marginTop: '8px' }}>Legal Terms & Privacy Policy</p>
        </div>

        <div className="terms-content">
          <h2>Terms of Service</h2>
          <p><strong>Effective Date:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p>Welcome to Connectify! By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By creating an account on Connectify, you confirm that you are at least 13 years of age and agree to comply with and be bound by these terms and all applicable laws and regulations.</p>

          <h2>2. User Accounts</h2>
          <ul>
            <li>You must provide accurate and complete information during registration.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You may not use another person's account without permission.</li>
            <li>You are responsible for all activities that occur under your account.</li>
          </ul>

          <h2>3. Trust Circles & Privacy</h2>
          <p>Connectify provides Trust Circles to help you control content visibility. While we implement technical measures to enforce these boundaries, you should share sensitive content only with people you trust.</p>
          <ul>
            <li>Content shared within a Trust Circle is visible only to members of that circle.</li>
            <li>Anonymous posts are not linked to your public profile, but we retain records for safety purposes.</li>
            <li>Disposable profiles are subject to the same community guidelines as primary accounts.</li>
          </ul>

          <h2>4. Community Guidelines</h2>
          <p>Connectify is built on authentic connections and mutual respect. The following are prohibited:</p>
          <ul>
            <li>Harassment, bullying, or threatening behavior</li>
            <li>Hate speech or discrimination based on identity</li>
            <li>Sharing illegal, violent, or explicit content</li>
            <li>Spam, scams, or misleading content</li>
            <li>Impersonation or identity fraud</li>
            <li>Manipulation of engagement metrics or contribution scores</li>
          </ul>

          <h2>5. Content Ownership</h2>
          <p>You retain ownership of content you create and share on Connectify. By posting content, you grant us a non-exclusive, royalty-free license to display, distribute, and promote your content within the platform.</p>

          <h2>6. Content Lifespan & Deletion</h2>
          <ul>
            <li>Content with an expiration date will be automatically removed at the specified time.</li>
            <li>Time Capsule posts are stored securely until their unlock date.</li>
            <li>You may delete your content at any time.</li>
            <li>Digital Legacy settings are honored according to your preferences.</li>
          </ul>

          <h2>7. Mental Health Features</h2>
          <p>Features like Social Burnout Detection, Like-Free Mode, and Slow Feed are tools to support healthy usage. They are not substitutes for professional mental health support.</p>

          <h2>8. Limitation of Liability</h2>
          <p>Connectify is provided "as is" without warranties. We are not liable for content posted by users, accuracy of reviews, or outcomes of community interactions.</p>

          <h2>Privacy Policy</h2>
          <p>Your privacy matters to us. Here's how we handle your data:</p>

          <h2>Data We Collect</h2>
          <ul>
            <li><strong>Account Information:</strong> Name, email, username, password (encrypted)</li>
            <li><strong>Profile Data:</strong> Bio, skills, avatar, location (if provided)</li>
            <li><strong>Usage Data:</strong> Platform activity for burnout detection and analytics</li>
            <li><strong>Content:</strong> Posts, comments, reviews, and journal entries</li>
          </ul>

          <h2>How We Use Your Data</h2>
          <ul>
            <li>Providing and improving our platform services</li>
            <li>Enforcing Trust Circle visibility settings</li>
            <li>Powering mental health features (usage tracking, break reminders)</li>
            <li>Calculating contribution scores and community trust ratings</li>
            <li>Sending notifications and emails you've opted into</li>
          </ul>

          <h2>Data Protection</h2>
          <ul>
            <li>Passwords are hashed using bcrypt with salt rounds</li>
            <li>All API communications are encrypted</li>
            <li>Journal entries are private by default and encrypted at rest</li>
            <li>We never sell your personal data to third parties</li>
          </ul>

          <h2>Contact</h2>
          <p>For questions about these terms, please contact us at <a href="mailto:support@connectify.app" className="auth-link">support@connectify.app</a>.</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link to="/register" className="btn btn-primary">Back to Registration</Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;

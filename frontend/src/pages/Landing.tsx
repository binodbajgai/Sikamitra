import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      {/* NAVIGATION BAR */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="brand">
            <div className="brand-mark">S</div>
            <div className="brand-text">
              <span className="brand-name">Sikamitra</span>
              <span className="brand-tagline">AI Study Companion</span>
            </div>
          </Link>

          <nav className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#benefits">Why Us</a>
          </nav>

          <div className="landing-nav-actions">
            {user ? (
              <Link to="/dashboard" className="btn-primary-gradient">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-text">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary-gradient">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="glow-sphere sphere-1" />
          <div className="glow-sphere sphere-2" />
        </div>

        <div className="landing-container">
          <div className="hero-badge">
            <span>✨ Powered by Next-Gen Study AI</span>
          </div>

          <h1 className="hero-title">
            Master Any Subject with Your Personal <span className="text-gradient">AI Study Partner</span>
          </h1>

          <p className="hero-subtitle">
            Upload notes, textbooks, and syllabus PDFs. Sikamitra automatically transforms your materials into instant summaries, customized flashcards, and realistic mock exam tests.
          </p>

          <div className="hero-cta-group">
            <Link to="/register" className="hero-cta-btn">
              Start Studying Free <span>→</span>
            </Link>
            <Link to="/login" className="hero-secondary-btn">
              Sign In with Existing Account
            </Link>
          </div>

          {/* FLOATING PREVIEW CARD */}
          <div className="hero-preview-wrapper">
            <div className="hero-card-preview">
              <div className="preview-top-bar">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="preview-bar-title">sikamitra.ai/dashboard</span>
              </div>

              <div className="preview-grid">
                <div className="preview-stat-card">
                  <span className="stat-label">AI Summaries</span>
                  <span className="stat-value">Instant</span>
                  <p>Concise bullet points & key takeaways in seconds.</p>
                </div>
                <div className="preview-stat-card">
                  <span className="stat-label">Custom Quizzes</span>
                  <span className="stat-value">Adaptive</span>
                  <p>Auto-generated multiple choice questions with reasoning.</p>
                </div>
                <div className="preview-stat-card">
                  <span className="stat-label">Performance Analytics</span>
                  <span className="stat-value">98.4%</span>
                  <p>Track your score improvements across every study session.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-kicker">POWERFUL CAPABILITIES</span>
            <h2>Everything You Need to Ace Your Exams</h2>
            <p>Spend less time re-reading and more time active-recalling what actually matters.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Smart Document Processing</h3>
              <p>Upload lecture slides, research papers, and textbook chapters. Our AI extracts core concepts without missing crucial details.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Dynamic Mock Tests</h3>
              <p>Generate timed, exam-standard multiple choice tests from any syllabus or uploaded notes. Test your knowledge in a real test environment.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🧠</div>
              <h3>Instant Explanations</h3>
              <p>Review every correct and incorrect answer with contextual explanations and citations directly referencing your study notes.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Detailed Progress Tracking</h3>
              <p>Visualize your progress, identify knowledge gaps, and see which topics need more attention before test day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="landing-steps">
        <div className="landing-container">
          <div className="section-header-center">
            <span className="section-kicker">SIMPLE WORKFLOW</span>
            <h2>From Raw Notes to Exam Ready in 3 Steps</h2>
          </div>

          <div className="steps-row">
            <div className="step-card">
              <span className="step-num">01</span>
              <h4>Upload Your Material</h4>
              <p>Drop your lecture notes, textbook chapters, or syllabus documents into your secure personal library.</p>
            </div>
            <div className="step-card">
              <span className="step-num">02</span>
              <h4>AI Synthesizes Content</h4>
              <p>Sikamitra generates structured summaries, flashpoints, and interactive question sets instantly.</p>
            </div>
            <div className="step-card">
              <span className="step-num">03</span>
              <h4>Take Mock Tests</h4>
              <p>Take interactive quizzes, review explanations, and build unshakeable confidence for exam day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="landing-cta-banner">
        <div className="landing-container">
          <div className="cta-banner-content">
            <h2>Ready to Transform the Way You Study?</h2>
            <p>Join students using Sikamitra AI to understand faster and score higher.</p>
            <Link to="/register" className="cta-large-btn">
              Get Started Now — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="landing-container footer-inner">
          <div className="footer-left">
            <span className="brand-name">Sikamitra</span>
            <p>© {new Date().getFullYear()} Sikamitra. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/forgot-password">Reset Password</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

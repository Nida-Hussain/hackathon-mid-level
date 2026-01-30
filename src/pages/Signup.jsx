import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, loginWithGoogle, loginWithGitHub } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create account: ' + error.message);
    }

    setLoading(false);
  }

  async function handleGoogleSignup() {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to sign up with Google: ' + error.message);
    }

    setLoading(false);
  }

  async function handleGitHubSignup() {
    try {
      setError('');
      setLoading(true);
      await loginWithGitHub();
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to sign up with GitHub: ' + error.message);
    }

    setLoading(false);
  }

  return (
    <div className="signup-page" style={{
      background: '#000000',
      fontFamily: "'Poppins', sans-serif",
      minHeight: '100vh'
    }}>
      <Container fluid className="d-flex align-items-center" style={{ minHeight: '100vh', padding: '1rem 1rem' }}>
        <Row className="w-100">
          <Col xs={12}>
            <div className="d-flex flex-column flex-lg-row" style={{ gap: '2rem' }}>
              {/* Right Column - Background Image/Illustration */}
              <Col xs={12} lg={6} className="d-none d-lg-block p-0">
                <div
                  className="rounded-4 h-100 position-relative overflow-hidden shadow-lg"
                  style={{
                    background: 'linear-gradient(45deg, #2c3e50 0%, #000000 100%)',
                    minHeight: '500px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                  }}
                >
                  <div className="text-center" style={{ zIndex: 2, maxWidth: '400px' }}>
                    <div className="mb-4">
                      <div className="auth-icon-container mx-auto mb-4" style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        <i className="bi bi-person-plus text-white" style={{ fontSize: '3rem' }}></i>
                      </div>
                    </div>
                    <h2 className="text-white fw-bold mb-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Create Account</h2>
                    <p className="text-white opacity-85 mb-0" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                      Join our platform with secure authentication. Create your account and unlock premium features.
                    </p>
                    <div className="mt-5">
                      <div className="d-flex justify-content-center gap-4">
                        <div className="auth-method-card" style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                          <i className="bi bi-shield-lock text-white fs-4 d-block mb-1"></i>
                          <small className="text-white opacity-75">Secure</small>
                        </div>
                        <div className="auth-method-card" style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                          <i className="bi bi-person-plus text-white fs-4 d-block mb-1"></i>
                          <small className="text-white opacity-75">Easy</small>
                        </div>
                        <div className="auth-method-card" style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: '12px',
                          padding: '1rem',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}>
                          <i className="bi bi-stars text-white fs-4 d-block mb-1"></i>
                          <small className="text-white opacity-75">Premium</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Animated background elements */}
                  <div className="floating-element" style={{
                    position: 'absolute',
                    top: '25%',
                    right: '15%',
                    width: '50px',
                    height: '50px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    animation: 'float 7s ease-in-out infinite'
                  }}></div>
                  <div className="floating-element" style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '20%',
                    width: '70px',
                    height: '70px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    animation: 'float 9s ease-in-out infinite 1s'
                  }}></div>
                </div>
              </Col>

              {/* Left Column - Form */}
              <Col xs={12} lg={6} className="p-0">
                <Card className="border-0 rounded-4 shadow-xl h-100" style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  maxWidth: '450px',
                  minWidth: '350px',
                  minHeight: '550px'
                }}>
                  <Card.Body className="p-3 d-flex flex-column">
                    <div className="text-center mb-2">
                      <div className="logo-placeholder mb-2" style={{
                        width: '50px',
                        height: '50px',
                        margin: '0 auto 0.25rem',
                        background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)'
                      }}>
                        <i className="bi bi-person-plus text-white" style={{ fontSize: '1.25rem' }}></i>
                      </div>
                      <h2 className="fw-bold text-gray-800 mb-1" style={{ fontSize: '1.35rem' }}>Create Account</h2>
                      <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>Sign up for a new account</p>
                    </div>

                    {error && (
                      <Alert variant="danger" className="rounded-3 py-2" style={{ backdropFilter: 'blur(5px)', fontSize: '0.85rem' }}>
                        {error}
                      </Alert>
                    )}

                    <Form onSubmit={handleSubmit} className="mb-2">
                      <Form.Group className="mb-2" controlId="email">
                        <Form.Label className="fw-semibold text-gray-700 mb-1" style={{ fontSize: '0.85rem' }}>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="rounded-3 py-2 px-3 border-0 shadow-sm"
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            fontSize: '0.95rem'
                          }}
                        />
                      </Form.Group>

                      <Form.Group className="mb-2" controlId="password">
                        <Form.Label className="fw-semibold text-gray-700 mb-1" style={{ fontSize: '0.85rem' }}>Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="rounded-3 py-2 px-3 border-0 shadow-sm"
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            fontSize: '0.95rem'
                          }}
                        />
                      </Form.Group>

                      <Form.Group className="mb-2" controlId="confirmPassword">
                        <Form.Label className="fw-semibold text-gray-700 mb-1" style={{ fontSize: '0.85rem' }}>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="rounded-3 py-2 px-3 border-0 shadow-sm"
                          style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            fontSize: '0.95rem'
                          }}
                        />
                      </Form.Group>

                      <div className="mb-2">
                        <Form.Check
                          type="checkbox"
                          id="terms"
                          label={
                            <span className="text-gray-600" style={{ fontSize: '0.85rem' }}>
                              I agree to the <Link to="/terms" className="text-decoration-none text-primary fw-semibold">Terms of Service</Link> and <Link to="/privacy" className="text-decoration-none text-primary fw-semibold">Privacy Policy</Link>
                            </span>
                          }
                          required
                        />
                      </div>

                      <Button
                        disabled={loading}
                        type="submit"
                        className="w-100 py-2 fw-semibold rounded-3 shadow-sm"
                        style={{
                          background: 'linear-gradient(45deg, #f093fb, #f5576c)',
                          border: 'none',
                          fontSize: '1rem',
                          fontWeight: '600',
                          transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 8px 25px rgba(240, 147, 251, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 4px 15px rgba(240, 147, 251, 0.3)';
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Creating account...
                          </>
                        ) : (
                          'Sign Up'
                        )}
                      </Button>
                    </Form>

                    <div className="divider-or mb-2" style={{
                      textAlign: 'center',
                      position: 'relative',
                      margin: '0.75rem 0'
                    }}>
                      <span className="bg-white px-3 text-gray-500" style={{
                        position: 'relative',
                        zIndex: 1,
                        fontSize: '0.8rem'
                      }}>
                        Or sign up with
                      </span>
                      <hr style={{
                        position: 'absolute',
                        top: '50%',
                        left: '0',
                        right: '0',
                        height: '1px',
                        backgroundColor: '#e9ecef',
                        margin: 0
                      }} />
                    </div>

                    <div className="d-grid gap-2 mb-2">
                      <Button
                        onClick={handleGoogleSignup}
                        disabled={loading}
                        variant="light"
                        className="py-2 rounded-3 shadow-sm fw-semibold d-flex align-items-center justify-content-center"
                        style={{
                          border: '1px solid #e9ecef',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          fontSize: '0.95rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                        }}
                      >
                        <i className="bi bi-google text-danger me-2" style={{ fontSize: '1.1rem' }}></i>
                        Sign up with Google
                      </Button>

                      <Button
                        onClick={handleGitHubSignup}
                        disabled={loading}
                        variant="dark"
                        className="py-2 rounded-3 shadow-sm fw-semibold d-flex align-items-center justify-content-center"
                        style={{
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          fontSize: '0.95rem'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                        }}
                      >
                        <i className="bi bi-github me-2" style={{ fontSize: '1.1rem' }}></i>
                        Sign up with GitHub
                      </Button>
                    </div>

                    <div className="text-center mt-1">
                      <p className="mb-0 text-gray-600" style={{ fontSize: '0.85rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: '#f093fb' }}>
                          Sign In
                        </Link>
                      </p>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </div>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .signup-page {
          position: relative;
          overflow: hidden;
        }

        .floating-element {
          pointer-events: none;
        }

        .text-gray-800 {
          color: #374151 !important;
        }

        .text-gray-700 {
          color: #4b5563 !important;
        }

        .text-gray-600 {
          color: #6b7280 !important;
        }

        .text-gray-500 {
          color: #9ca3af !important;
        }

        .text-lg {
          font-size: 1.125rem;
        }

        /* Mobile Responsiveness */
        @media (max-width: 992px) {
          .d-flex.flex-column.flex-lg-row {
            flex-direction: column !important;
          }

          .col-12.col-lg-6.p-0 {
            width: 100% !important;
          }

          .d-none.d-lg-block.p-0 {
            display: none !important;
          }

          .card.h-100 {
            min-height: auto !important;
            margin-bottom: 2rem;
          }

          .p-3 {
            padding: 1.5rem !important;
          }

          .logo-placeholder {
            width: 45px !important;
            height: 45px !important;
          }

          .logo-placeholder i {
            font-size: 1.1rem !important;
          }
        }

        @media (max-width: 768px) {
          .container-fluid {
            padding: 1rem !important;
          }

          h2.fw-bold.text-gray-800 {
            font-size: 1.35rem !important;
          }

          .btn.py-2 {
            padding: 0.6rem 1rem !important;
          }

          .form-control.py-2.px-3 {
            padding: 0.6rem 0.85rem !important;
          }

          .auth-icon-container {
            width: 80px !important;
            height: 80px !important;
          }

          .auth-icon-container i {
            font-size: 2rem !important;
          }
        }

        @media (max-width: 576px) {
          .row {
            margin: 0 !important;
          }

          .col-12 {
            padding: 0.5rem !important;
          }

          .card-body {
            padding: 1rem !important;
          }

          .btn.w-100.py-2 {
            padding: 0.5rem 1rem !important;
          }

          .d-flex.justify-content-between.align-items-center {
            flex-direction: column !important;
            gap: 0.5rem !important;
            align-items: flex-start !important;
          }

          .d-grid.gap-2.mb-3 {
            gap: 0.6rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Signup;
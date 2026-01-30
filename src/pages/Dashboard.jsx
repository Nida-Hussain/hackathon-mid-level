import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { currentUser, logout, getUserProvider } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  const provider = getUserProvider(currentUser);

  return (
    <Container fluid className="py-4 px-3 min-vh-100">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8} xl={6}>
          <Card className="border-0 shadow-lg rounded-4">
            <Card.Header className="bg-primary text-white rounded-top-4 py-4">
              <h2 className="mb-0 fw-bold text-center">Dashboard</h2>
            </Card.Header>
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                <div className="avatar mx-auto mb-4" style={{ width: '100px', height: '100px' }}>
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center w-100 h-100">
                    <span className="display-4 text-muted">
                      {currentUser?.displayName?.charAt(0)?.toUpperCase() ||
                       currentUser?.email?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                </div>

                <h3 className="fw-bold mb-2">
                  Welcome, {currentUser?.displayName || currentUser?.email?.split('@')[0]}!
                </h3>
                <p className="text-muted mb-0">
                  You are signed in with <Badge bg="secondary">{provider}</Badge>
                </p>
              </div>

              <div className="info-section mb-4">
                <h5 className="fw-semibold mb-3">Account Information</h5>

                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <div className="icon-container bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="bi bi-person text-primary"></i>
                      </div>
                      <div>
                        <p className="mb-0 text-muted small">Display Name</p>
                        <p className="mb-0 fw-medium">
                          {currentUser?.displayName || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <div className="icon-container bg-info bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="bi bi-envelope text-info"></i>
                      </div>
                      <div>
                        <p className="mb-0 text-muted small">Email Address</p>
                        <p className="mb-0 fw-medium">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <div className="icon-container bg-success bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="bi bi-key text-success"></i>
                      </div>
                      <div>
                        <p className="mb-0 text-muted small">Authentication Method</p>
                        <p className="mb-0 fw-medium">{provider}</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <div className="icon-container bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                        <i className="bi bi-calendar-check text-warning"></i>
                      </div>
                      <div>
                        <p className="mb-0 text-muted small">Account Created</p>
                        <p className="mb-0 fw-medium">
                          {currentUser?.metadata?.creationTime
                            ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                            : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="action-section text-center">
                <Button
                  onClick={handleLogout}
                  variant="outline-danger"
                  className="px-4 py-2 fw-medium rounded-3"
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Log Out
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
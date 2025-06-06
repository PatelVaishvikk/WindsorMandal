// components/Navbar.js
import { Navbar, Nav, Container } from 'react-bootstrap';
import Link from 'next/link';
import { useRouter } from 'next/router';

import DarkModeToggle from './DarkModeToggle';

const Navigation = () => {
  const router = useRouter();

  return (
    <Navbar expand="lg" className="shadow-sm">
      <Container>
        <Link href="/" legacyBehavior>
          <Navbar.Brand as="a" className="fw-bold">
            <img
              src="/windsor.jpg"
              alt="HSAPSS Windsor Logo"
              className="me-2"
              style={{ height: '30px' }}
            />
            HSAPSS Windsor
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Link href="/" legacyBehavior>
              <Nav.Link as="a" active={router.pathname === '/'}>
                <i className="fas fa-home me-2"></i> Dashboard
              </Nav.Link>
            </Link>
            <Link href="/students-table" legacyBehavior>
              <Nav.Link as="a" active={router.pathname === '/students-table'}>
                <i className="fas fa-users me-2"></i> Yuvaks
              </Nav.Link>
            </Link>
            <Link href="/moved-out-students" legacyBehavior>
              <Nav.Link as="a" active={router.pathname === '/moved-out-students'}>
                <i className="fas fa-users me-2"></i> Moved Out Students
              </Nav.Link>
            </Link>
            <Link href="/grocery" legacyBehavior>
              <Nav.Link as="a" active={router.pathname === '/grocery'}>
                <i className="fas fa-shopping-cart me-2"></i> Grocery
              </Nav.Link>
            </Link>
            <Link href="/attendance" legacyBehavior>
              <Nav.Link as="a" active={router.pathname === '/attendance'}>
                <i className="fas fa-calendar-alt me-2"></i> Attendance
              </Nav.Link>
            </Link>
            <Link href="/call-logs" legacyBehavior>
              <Nav.Link as="a" active={router.pathname === '/call-logs'}>
                <i className="fas fa-phone-alt me-2"></i> Call Logs
              </Nav.Link>
            </Link>
            <Link href="/add-yuvak" legacyBehavior>
              <Nav.Link as="a" active={router.pathname === '/add-yuvak'}>
                <i className="fas fa-user-plus me-2"></i> Add Yuvak
              </Nav.Link>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
      <style jsx global>{`
        .navbar {
          padding: 1rem 0;
        }
        .navbar-brand {
          color: var(--primary-color);
          font-size: 1.5rem;
          cursor: pointer;
        }
        .nav-link {
          color: var(--gray-900);
          font-weight: 500;
          padding: 0.5rem 1rem !important;
          border-radius: 0.375rem;
          transition: all 0.2s;
          cursor: pointer;
        }
        .nav-link:hover {
          color: var(--primary-color);
          background-color: var(--gray-100);
        }
        .nav-link.active {
          color: var(--primary-color);
          background-color: var(--gray-100);
        }
      `}</style>

      <DarkModeToggle />

    </Navbar>
  );
};

export default Navigation;

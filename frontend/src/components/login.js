import React, { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { API_BASE_URL } from '../config';
import logo from '../assets/logo.png'; 
import backgroundImage from '../assets/bg.jpg'; 
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        const response = await fetch(`${API_BASE_URL}/ldap-login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('username', data.username); 
            localStorage.setItem('userid', data.userid); 
            localStorage.setItem('userGroup', data.userGroup);
            onLogin(); 
            navigate('/');
        } else {
            setError('Invalid credentials');
        }
    } catch (error) {
        console.error('Error:', error);
        setError('Something went wrong!');
    }
};

  return (
    <div style={{ ...styles.container, backgroundImage: `url(${backgroundImage})` }}>
      {/* Inject placeholder styles */}
      <style>
        {`
          input::placeholder {
            color: #fff; /* Make placeholder text white */
            opacity: 1; /* Ensure full visibility of placeholder */
          }
        `}
      </style>
      <div style={styles.formContainer}>
        <div style={styles.logoContainer}>
          <img src={logo} alt="Logo" style={styles.logo} />
        </div>

        <h2 style={styles.header}>Login</h2>
        {error && <p style={styles.errorMessage}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <input 
                autoComplete="off"
                type="text" 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                placeholder="Username"
                style={styles.input}
              />
              <PersonIcon style={{ ...styles.icon, color: '#fff' }} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputWrapper}>
              <input 
                autoComplete="off"
                type="password" 
                id="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Password"
                style={styles.input}
              />
              <LockIcon style={{ ...styles.icon, color: '#fff' }} />
            </div>
          </div>

          <button type="submit" style={styles.button}>Login</button>
        </form>

        <footer style={styles.footer}>
          <p>© 2024 Innovation @ LULU. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f9',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  },
  formContainer: {
    backgroundColor: 'rgba(34, 113, 167, 0.68)',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '450px',
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '0px',
  },
  logo: {
    width: '160px',
    height: 'auto',
  },
  header: {
    textAlign: 'center',
    margin: '20px 0',
    fontSize: '32px',
    color: '#fff',
  },
  errorMessage: {
    color: 'red',
    textAlign: 'center',
    marginBottom: '20px',
    marginTop : '10px,'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '16px',
    border: '1px solid #ccc',
    padding: '5px 10px',
    justifyContent: 'space-between',
    transition: 'border-color 0.3s', 
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    border: 'none', 
    outline: 'none', 
    backgroundColor: 'transparent', 
    color: '#fff', 
    boxSizing: 'border-box',
  },
  icon: {
    color: '#fff',
    fontSize: '18px',
  },
  button: {
    padding: '12px',
    backgroundColor: 'rgba(22 47 75)',
    color: '#fff',
    border: 'none',
    borderRadius: '16px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  footer: {
    marginTop: '70px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#fff',
  },
};

export default Login;

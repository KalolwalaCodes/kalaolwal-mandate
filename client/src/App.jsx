import { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './Components/Forms/Loginform';
import Landingpage from './pages/Landingpage';
import { Button } from "./Components/ui/button"
function App() {
  // Track whether the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login state on component mount
  useEffect(() => {
    const storedLoginStatus = localStorage.getItem('isLoggedIn');
    if (storedLoginStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Handle login
  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true'); // Persist login state
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn'); // Clear login state
  };

  return (
    <div>
      {isLoggedIn ? (
        <>
          {/* Show the form page if the user is logged in */}
          <Landingpage />
          <Button 
              type="button" 
              onClick={handleLogout}
              className="w-[100px] absolute right-[10px] top-[10px] bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              logout 
            </Button>
         
        </>
      ) : (
        // Show the login form if the user is not logged in
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;

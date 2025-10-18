
import { GoogleLogin } from '@react-oauth/google'
import axios from "axios";

export default function SignIn() {
  const handleAuthorize = async () => {
  
    const res = await axios.get(
      `http://127.0.0.1:8000/auth/google/start`
    );
  
    // Redirect user to Google authorization URL
    window.location.href = res.data.authorization_url;
  };
  const handleError = () => {
    setError('Login failed. Please try again.')
    console.error('Google Login Failed')
  }
  return (
    
      <>
      <div className="flex justify-center w-lg">
      <GoogleLogin
        onSuccess={handleAuthorize}
        onError={handleError}
        size="large"
        theme="outline"
        text="signin_with"
        shape="circle"
        logo_alignment="right" />
      
      </div>
      </>
  )
}
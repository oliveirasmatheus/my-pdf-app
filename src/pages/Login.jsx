import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import "./Login.css";
import GoogleLogo from "../assets/google-logo.svg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const allowedEmails = ["matheus.oliveeira@gmail.com", "contato@arqwillianoliveira.com.br"];

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/app", { replace: true });
    } catch (error) {
      console.error(error);
      alert("Usuário ou senha incorretos!");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!allowedEmails.includes(user.email)) {
        alert("Você não tem permissão para acessar!");
        await auth.signOut(); // desloga imediatamente
        return;
      }

      navigate("/app", { replace: true });
    } catch (error) {
      console.error(error);
      alert("Erro ao logar com Google");
    }
  };


  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleEmailLogin}>
        <h2>Login</h2>
        <img
          src={GoogleLogo}
          alt="Entrar com Google"
          className="google-login-svg"
          onClick={handleGoogleLogin}
        />

      </form>
    </div>
  );
}

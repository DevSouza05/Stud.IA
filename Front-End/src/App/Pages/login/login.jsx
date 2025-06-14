import "../styles/global.css";
import arrow from "../../assets/arrow.svg";
import { Navbar } from "../../components/Navbar/index.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export function App() {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); 
  const [messageType, setMessageType] = useState("error");
  const navigate = useNavigate();

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage(""); 
    setMessageType("error"); 

    if (!formData.email) {
      setMessage("O email é obrigatório!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage("Por favor, insira um e-mail válido.");
      return;
    }

    if (!formData.senha || formData.senha.length < 6) {
      setMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();

      console.log("🟢 Resposta da API:", responseData);

      if (response.status === 200) {
        setMessage("Usuário autenticado com sucesso!");
        setMessageType("success"); 

        
        setTimeout(() => {
          localStorage.setItem("userId", responseData.userID);

          const hasSelecoes = responseData.selecoes?.length > 0;
          const destino = hasSelecoes ? "/home" : "/SwiperPage";
          const mensagem = hasSelecoes
            ? "Usuário já criou seleções."
            : "Usuário ainda não criou seleções.";

          setMessage(mensagem); 
          setMessageType("success"); 
          navigate(destino, { state: { userId: responseData.userID } });
        }, 3000); 
      } else {
        setMessage(responseData?.message || "Erro desconhecido. Tente novamente.");
        setMessageType("error"); 
      }
    } catch (error) {
      console.error("🔴 Erro ao autenticar usuário:", error);
      setMessage("Erro ao autenticar usuário. Tente novamente.");
      setMessageType("error"); 
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <Navbar />
      <header>
        <img src={"./logoStudIA.png"} alt="Logo Stud.Ia" />
        <span>Realize seu login</span>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="inputContainer">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="studia@gmail.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="inputContainer">
          <label htmlFor="senha">Senha</label>
          <input
            type="password"
            name="senha"
            id="senha"
            placeholder="********"
            value={formData.senha}
            onChange={handleChange}
            required
          />
        </div>

        <a href="#">Esqueceu sua senha?</a>

        <button className="button" disabled={loading}>
          {loading ? "Carregando..." : "Entrar"}
          {!loading && <img src={arrow} alt="Seta" />}
        </button>

       
        {message && (
          <div className={messageType === "error" ? "error-message" : "success-message"}>
            {message}
          </div>
        )}

        <div className="footer">
          <p>Ainda não tem uma conta?</p>
          <Link to="/cadastro">Criar uma conta</Link>
        </div>
      </form>
    </div>
  );
}

import "../styles/global.css";
import arrow from "../../assets/arrow.svg";
import { Navbar } from "../../components/Navbar/index.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

export function App() {
  const { t } = useTranslation();
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
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
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
        <span>{t('realize_seu_login')}</span>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="inputContainer">
          <label htmlFor="email">{t('email')}</label>
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
          <label htmlFor="senha">{t('senha')}</label>
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

        <a href="#">{t('esqueceu_sua_senha')}</a>

        <button className="button" disabled={loading}>
          {loading ? "Carregando..." : t('entrar')}
          {!loading && <img src={arrow} alt="Seta" />}
        </button>

       
        {message && (
          <div className={messageType === "error" ? "error-message" : "success-message"}>
            {message}
          </div>
        )}

        <div className="footer">
          <p>{t('ainda_nao_tem_uma_conta')}</p>
          <Link to="/cadastro">{t('criar_uma_conta')}</Link>
        </div>
      </form>
    </div>
  );
}

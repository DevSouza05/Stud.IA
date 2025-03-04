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

    if (!formData.email) {
      alert("O email é obrigatório!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Por favor, insira um e-mail válido.");
      return;
    }

    if (!formData.senha || formData.senha.length < 6) {
      alert("A senha deve ter no mínimo 6 caracteres.");
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
        alert("Usuário autenticado com sucesso!");
        localStorage.setItem("userId", responseData.userID);

        const hasSelecoes = responseData.selecoes?.length > 0;
        const destino = hasSelecoes ? "/home" : "/SwiperPage";
        const mensagem = hasSelecoes
          ? "Usuário já criou seleções."
          : "Usuário ainda não criou seleções.";

        alert(mensagem);
        navigate(destino, { state: { userId: responseData.userID } });
      } else {
        alert(responseData?.message || "Erro desconhecido. Tente novamente.");
      }
    } catch (error) {
      console.error("🔴 Erro ao autenticar usuário:", error);
      alert("Erro ao autenticar usuário. Tente novamente.");
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
          {loading ? "Entrando..." : "Entrar"}
          {!loading && <img src={arrow} alt="Seta" />}
        </button>

        <div className="footer">
          <p>Ainda não tem uma conta?</p>
          <Link to="/cadastro">Criar uma conta</Link>
        </div>
      </form>
    </div>
  );
}

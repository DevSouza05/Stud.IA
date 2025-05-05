import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/global.css";
import arrow from "../../assets/arrow.svg";
import { Navbar } from "../../components/Navbar/index.tsx";
import { useTranslation } from 'react-i18next';

export function Cadastro() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    senha: "",
  });

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

    if (!formData.name) {
      setMessage("O nome é obrigatório!");
      setMessageType("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      setMessage("Por favor, insira um e-mail válido.");
      setMessageType("error");
      return;
    }

    if (!formData.senha || formData.senha.length < 6) {
      setMessage("A senha deve ter no mínimo 6 caracteres.");
      setMessageType("error");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/cadastrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.name,
          email: formData.email,
          senha: formData.senha,
        }),
      });

      if (response.status === 201) {
        setMessage("Usuário cadastrado com sucesso!");
        setMessageType("success");
        setTimeout(() => {
          navigate("/login");
        }, 2000); 
      } else {
        setMessage("Erro ao cadastrar usuário.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      setMessage("Erro ao cadastrar usuário. Tente novamente.");
      setMessageType("error");
    }
  }

  return (
    <div className="container">
      <Navbar />
      <header>
        <img src={"./logoStudIA.png"} alt="Logo Stud.Ia" />
        <span>{t('createAccount')}</span>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="inputContainer">
          <label htmlFor="name">{t('name')}</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder={t('placeholderName')}
            onChange={handleChange}
            value={formData.name}
          />
        </div>

        <div className="inputContainer">
          <label htmlFor="email">{t('email')}</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder={t('placeholderEmail')}
            onChange={handleChange}
            value={formData.email}
          />
        </div>

        <div className="inputContainer">
          <label htmlFor="senha">{t('password')}</label>
          <input
            type="password"
            name="senha"
            id="senha"
            placeholder={t('placeholderPassword')}
            onChange={handleChange}
            value={formData.senha}
          />
        </div>

        <button className="button" type="submit">
          {t('register')} <img src={arrow} alt="Seta" />
        </button>

       
        {message && (
          <div className={messageType === "error" ? "error-message" : "success-message"}>
            {message}
          </div>
        )}

        <div className="footer">
          <p>{t('alreadyHaveAccount')}</p>
          <Link to="/login">{t('login')}</Link>
        </div>
      </form>
    </div>
  );
}

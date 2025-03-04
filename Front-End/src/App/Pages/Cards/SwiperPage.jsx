import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../styles/cards.css";
import "../styles/swiper.css";
import { Navigation, Pagination, Mousewheel, Keyboard } from "swiper/modules";
import { useNavigate } from "react-router-dom";

export function SwiperPage() {
  const [trilhaEscolhida, setTrilhaEscolhida] = useState(null);
  const [senioridadeEscolhida, setSenioridadeEscolhida] = useState(null);
  const [dificuldadeEscolhida, setDificuldadeEscolhida] = useState(null);
  const [diasEscolhidos, setDiasEscolhidos] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dificuldades, setDificuldades] = useState([]); 
  const navigate = useNavigate();

  const trilhas = [
    "Frontend",
    "Backend",
    "DevOps",
    "Infraestrutura",
    "Redes",
    "Data Science",
    "Inteligencia Artificial",
    "Cybersecurity",
    "Blockchain"
  ];
  
  const senioridade = ["estudante", "junior", "sênior", "pleno"];

 
  const dificuldadesMap = {
    Frontend: [
      "Compreensão de HTML/CSS",
      "Manipulação de DOM com JavaScript",
      "Desenvolvimento com Frameworks (React, Vue, etc.)",
      "Responsividade e Design Adaptativo",
      "Integração com APIs REST",
      "Controle de Estado (Redux, Context API)",
      "Testes de Componentes e Funcionalidades",
      "Performance e Otimização Frontend",
      "Acessibilidade e Usabilidade",
      "Web Performance e SEO",
    ],
    Backend: [
      "Desenvolvimento de APIs RESTful",
      "Gerenciamento de Banco de Dados (SQL/NoSQL)",
      "Autenticação e Autorização",
      "Microserviços e Arquitetura",
      "Desempenho e Escalabilidade de Servidores",
      "Testes de Backend (unitários, integração)",
      "Segurança em Backend (CORS, JWT, etc.)",
      "Gerenciamento de Logs e Monitoramento",
      "Integração com Frontend e APIs de terceiros",
      "Desenvolvimento de APIs GraphQL",
    ],
    DevOps: [
      "Automação de Deploy com CI/CD",
      "Gerenciamento de Containers (Docker, Kubernetes)",
      "Infraestrutura como Código (Terraform, Ansible)",
      "Monitoramento e Logs de Infraestrutura",
      "Gerenciamento de Redes e Firewalls",
      "Automação de Provisionamento de Servidores",
      "Escalabilidade de Infraestrutura",
      "Gerenciamento de Ambientes (Desenvolvimento, Produção)",
      "Segurança e Gestão de Vulnerabilidades",
      "Provisionamento e Gerenciamento de Cloud Providers",
    ],
    Infraestrutura: [
      "Redes e Protocolos de Comunicação",
      "Gerenciamento de Servidores e Datacenters",
      "Arquitetura de Rede e Segurança",
      "Backup e Recuperação de Dados",
      "Gerenciamento de Firewalls e VPNs",
      "Gerenciamento de Tráfego e Load Balancers",
      "Configuração de Servidores Web (Apache, Nginx)",
      "Infraestrutura em Nuvem (AWS, Azure, Google Cloud)",
      "Segurança em Infraestrutura",
      "Gerenciamento de Infraestrutura Híbrida (On-premise e Cloud)",
    ],
    Redes: [
      "Fundamentos de Redes de Computadores",
      "Protocolos de Rede (TCP/IP, HTTP, DNS)",
      "Configuração de Roteadores e Switches",
      "Segurança de Redes (Firewall, VPN)",
      "Gerenciamento de Redes Locais (LAN, WLAN)",
      "Redes Definidas por Software (SDN)",
      "Configuração de Servidores de Rede",
      "Gerenciamento de Endereçamento IP",
      "Troubleshooting e Diagnóstico de Redes",
      "Implementação de Redes de Alta Performance",
    ],
    "Data Science": [
      "Análise Exploratória de Dados (EDA)",
      "Estatísticas para Ciência de Dados",
      "Pré-processamento e Limpeza de Dados",
      "Modelos de Machine Learning Supervisionados",
      "Redes Neurais e Deep Learning",
      "Análise de Séries Temporais",
      "Algoritmos de Recomendação",
      "Avaliação e Validação de Modelos",
      "Deploy de Modelos de Machine Learning",
      "Data Engineering e Pipelines de Dados",
    ],
    "Inteligencia Artificial": [
      "Fundamentos de Inteligência Artificial",
      "Algoritmos de Aprendizado Supervisionado",
      "Redes Neurais e Deep Learning",
      "Visão Computacional",
      "Processamento de Linguagem Natural (NLP)",
      "Sistemas de Recomendação",
      "Robótica e Automação",
      "Planejamento e Busca em IA",
      "Ética e Impacto da IA na Sociedade",
      "Inteligência Artificial Explicável (XAI)",
    ],
    "Blockchain": [
      "Fundamentos de Blockchain e Descentralização",
      "Criação e Deploy de Smart Contracts (Solidity, Rust)",
      "Segurança em Smart Contracts e Auditoria de Código",
      "Interação com Blockchain (Web3.js, ethers.js)",
      "Criptografia e Assinaturas Digitais",
      "Escalabilidade e Soluções Layer 2",
      "Tokens e DeFi (ERC-20, NFTs, Liquidity Pools)",
      "Interoperabilidade entre Blockchains",
      "Governança em Blockchain e DAOs",
      "Regulamentação e Conformidade em Blockchain",
    ],
    "Cybersecurity": [
      "Fundamentos de Segurança da Informação",
      "Criptografia e Protocolos de Segurança",
      "Testes de Penetração e Ethical Hacking",
      "Gerenciamento de Identidade e Acesso (IAM)",
      "Segurança em Redes e Proteção contra Ataques",
      "Forense Digital e Resposta a Incidentes",
      "Segurança em Aplicações Web (OWASP Top 10)",
      "Hardening de Sistemas e Servidores",
      "Monitoramento e Análise de Logs de Segurança",
      "Compliance e Normas de Segurança (ISO 27001, GDPR)",
    ],
  };
  
  
  

  
  const handleTrilhaClick = (trilha) => {
    setTrilhaEscolhida(trilha);
    setDificuldades(dificuldadesMap[trilha] || []);  
    setDificuldadeEscolhida(null); 
    console.log("Trilha escolhida:", trilha);
  };

  const handleSenioridadeClick = (senioridade) => {
    setSenioridadeEscolhida(senioridade);
    console.log("Senioridade escolhida:", senioridade);
  };

  const handleDificuldadeClick = (dificuldade) => {
    setDificuldadeEscolhida(dificuldade);
    console.log("Dificuldade escolhida:", dificuldade);
  };

  const handleDiaClick = (dia) => {
    if (diasEscolhidos.includes(dia)) {
      setDiasEscolhidos(diasEscolhidos.filter((d) => d !== dia));
    } else {
      setDiasEscolhidos([...diasEscolhidos, dia]);
    }
  };

  const handleConfirmar = async () => {
    if (isSubmitted) return;

    const dadosResumo = {
      userID: localStorage.getItem("userId"),
      selecoes: [
        trilhaEscolhida,
        senioridadeEscolhida,
        dificuldadeEscolhida,
        ...diasEscolhidos,
      ].filter(Boolean),
    };

    console.log("Dados confirmados:", JSON.stringify(dadosResumo, null, 2));

    try {
      const response = await fetch("http://localhost:8080/api/v1/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosResumo),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Resposta da API:", data);
        alert("Seleções salvas com sucesso!");
        navigate("/home");
        setIsSubmitted(true);
      } else {
        console.error("Erro na requisição:", response.statusText);
        alert("Erro ao salvar seleções.");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
      alert("Erro ao salvar seleções.");
    }
  };

  const todosCamposSelecionados =
    trilhaEscolhida &&
    dificuldadeEscolhida &&
    diasEscolhidos.length > 0;

  return (
    <div className="container">
      <header>
        <span></span>
      </header>

      <Swiper
        cssMode={true}
        navigation={true}
        pagination={true}
        mousewheel={true}
        keyboard={true}
        modules={[Navigation, Pagination, Mousewheel, Keyboard]}
        className="mySwiper"
      >
        {/* Slide 1 - Começar */}
        <SwiperSlide>
          <div className="inicio-container">
            <header className="inicio-header">
              <h1>Bem-vindo ao Seu Guia de Aprendizado 💻</h1>
              <p>Descubra sua trilha ideal e comece sua jornada agora!</p>
              <p>Clique na seta ao lado para continuar!</p>
            </header>
            <div className="inicio-content"></div>
          </div>
        </SwiperSlide>

        {/* Slide 2 - Escolha de trilha */}
        <SwiperSlide>
          <div className="slide-content">
            <h2>Qual trilha de conhecimento você quer seguir? 🚀</h2>
            <p>Escolha uma das opções abaixo:</p>
            <div className="trilhas-container">
              {trilhas.map((trilha) => (
                <button
                  key={trilha}
                  className={`trilha-card ${
                    trilhaEscolhida === trilha ? "selected" : ""
                  }`}
                  onClick={() => handleTrilhaClick(trilha)}
                >
                  {trilha}
                </button>
              ))}
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 3 - Dias de estudo */}
        <SwiperSlide>
          <div className="slide-content">
            <h2>Quais dias da semana você está no modo "bora estudar"? 📅</h2>
            <p>Escolha os dias em que você está disponível para estudar:</p>
            <div className="dias-container">
              {[
                "Segunda-feira",
                "Terça-feira",
                "Quarta-feira",
                "Quinta-feira",
                "Sexta-feira",
                "Sábado",
                "Domingo",
              ].map((dia) => (
                <button
                  key={dia}
                  className={`trilha-card ${
                    diasEscolhidos.includes(dia) ? "selected" : ""
                  }`}
                  onClick={() => handleDiaClick(dia)}
                >
                  {dia}
                </button>
              ))}
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 4 - Dificuldades no código */}
        <SwiperSlide>
          <div className="slide-content">
            <h2>
              Quais são os chefões que você ainda precisa derrotar no código? 🎮
            </h2>
            <p>Escolha uma das opções abaixo:</p>
            <div className="trilhas-container">
              {dificuldades.map((dificuldade) => (
                <button
                  key={dificuldade}
                  className={`trilha-card ${
                    dificuldadeEscolhida === dificuldade ? "selected" : ""
                  }`}
                  onClick={() => handleDificuldadeClick(dificuldade)}
                >
                  {dificuldade}
                </button>
              ))}
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 5 - Nível de experiência */}
        <SwiperSlide>
          <div className="slide-content">
            <h2>Qual seu nível de senioridade? 🚀</h2>
            <p>Escolha uma das opções abaixo:</p>
            <div className="trilhas-container">
              {senioridade.map((nivel) => (
                <button
                  key={nivel}
                  className={`trilha-card ${
                    senioridadeEscolhida === nivel ? "selected" : ""
                  }`}
                  onClick={() => handleSenioridadeClick(nivel)}
                >
                  {nivel}
                </button>
              ))}
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 6 - Resumo */}
        <SwiperSlide>
          <div className="slide-content resumo-container">
            <h2>Resumo</h2>
            <div className="resumo-box color-box">
              <div className="resumo-item">
                <i className="icon-trilha" /> <strong>Trilha escolhida:</strong>{" "}
                {trilhaEscolhida}
              </div>
              <div className="resumo-item">
                <i className="icon-senioridade" />{" "}
                <strong>Senioridade escolhida:</strong> {senioridadeEscolhida}
              </div>
              <div className="resumo-item">
                <i className="icon-dificuldade" />{" "}
                <strong>Dificuldade escolhida:</strong> {dificuldadeEscolhida}
              </div>
              <div className="resumo-item">
                <i className="icon-dias" />{" "}
                <strong>Dias escolhidos para estudo:</strong>{" "}
                {diasEscolhidos.join(", ")}
              </div>
            </div>

            {todosCamposSelecionados && (
              <div className="botao-container">
                <button className="botao-confirmar" onClick={handleConfirmar}>
                  {isSubmitted ? "Enviado!" : "Confirmar!"}
                </button>
              </div>
            )}
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}

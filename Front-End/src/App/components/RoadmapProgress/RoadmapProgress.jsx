import React from "react";

const RoadmapProgress = () => {
  const progress = 70;

  return (
    <>
      <div className="roadmap-progress">
        <h2>Seu Roadmap de Estudos</h2>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <p>{progress}% completo</p>
      </div>
    </>
  );
};

export default RoadmapProgress;

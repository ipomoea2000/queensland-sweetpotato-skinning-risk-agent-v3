"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type RiskLevel = "Low" | "Moderate" | "High" | "Very high";
type Moisture = "Wet" | "Adequate" | "Slightly dry" | "Dry";
type Handling = "Gentle" | "Moderate" | "Aggressive";

const locations = {
  "Bundaberg": { gdd: 1650, rain: 18, note: "Warm coastal production environment" },
  "Rockhampton": { gdd: 1740, rain: 12, note: "Warm subtropical environment" },
  "Lockyer Valley": { gdd: 1510, rain: 10, note: "Inland production environment" },
  "Atherton Tablelands": { gdd: 1390, rain: 22, note: "Elevated tropical environment" },
  "Mareeba": { gdd: 1810, rain: 8, note: "Dry tropical environment" }
} as const;

type LocationName = keyof typeof locations;

const clamp = (value:number,min:number,max:number) => Math.min(max, Math.max(min,value));
const riskLabel = (score:number):RiskLevel =>
  score < 30 ? "Low" : score < 55 ? "Moderate" : score < 75 ? "High" : "Very high";

export default function Page() {
  const [location, setLocation] = useState<LocationName>("Bundaberg");
  const [cultivar, setCultivar] = useState("Beauregard");
 const [gdd, setGdd] = useState<number>(locations.Bundaberg.gdd);
  const [daysSinceCutoff, setDaysSinceCutoff] = useState(7);
  const [forecastRain, setForecastRain] = useState<number>(locations.Bundaberg.rain);
  const [vineRemovalDays, setVineRemovalDays] = useState(0);
  const [soilMoisture, setSoilMoisture] = useState<Moisture>("Adequate");
  const [handling, setHandling] = useState<Handling>("Moderate");
  const [plannedDelay, setPlannedDelay] = useState(0);

  const selectLocation = (value: LocationName) => {
    setLocation(value);
    setGdd(locations[value].gdd);
    setForecastRain(locations[value].rain);
  };

  const result = useMemo(() => {
    let score = 48;
    const drivers:string[] = [];
    const actions:string[] = [];

    const maturity = clamp(gdd / 2000, 0, 1.15);
    if (maturity < 0.75) {
      score += 18;
      drivers.push("Accumulated thermal time is below the provisional maturity target.");
    } else if (maturity < 0.9) {
      score += 8;
      drivers.push("Periderm development is still approaching the provisional maturity target.");
    } else {
      score -= 8;
      drivers.push("Accumulated thermal time is consistent with more advanced periderm maturation.");
    }

    if (daysSinceCutoff < 4) {
      score += 15;
      drivers.push("The irrigation cutoff interval is short.");
    } else if (daysSinceCutoff < 7) {
      score += 7;
      drivers.push("The preharvest dry-down period may be insufficient.");
    } else if (daysSinceCutoff >= 10) {
      score -= 12;
      drivers.push("A 10-day or longer irrigation cutoff favours a more continuous protective barrier.");
    } else {
      score -= 5;
      drivers.push("A moderate preharvest dry-down period is present.");
    }

    if (forecastRain >= 25) {
      score += 14;
      drivers.push("Forecast rainfall before harvest is high.");
    } else if (forecastRain >= 10) {
      score += 7;
      drivers.push("Moderate rainfall is forecast before harvest.");
    } else {
      score -= 3;
      drivers.push("Limited rainfall is forecast before harvest.");
    }

    if (soilMoisture === "Wet") {
      score += 12;
      drivers.push("Wet soil may maintain root hydration and active radial expansion.");
    } else if (soilMoisture === "Adequate") {
      score += 3;
    } else if (soilMoisture === "Slightly dry") {
      score -= 4;
      drivers.push("Slight drying may support periderm maturation.");
    } else {
      score -= 8;
      drivers.push("Dry soil conditions favour barrier maturation, but excessive drying may affect harvestability.");
    }

    if (vineRemovalDays >= 5) {
      score -= 10;
      drivers.push("Five or more days since vine removal may improve skin set.");
    } else if (vineRemovalDays > 0) {
      score -= 4;
      drivers.push("A short vine-removal interval is present.");
    }

    if (handling === "Aggressive") {
      score += 14;
      drivers.push("Aggressive handling increases mechanical injury risk.");
    } else if (handling === "Gentle") {
      score -= 8;
      drivers.push("Gentle handling reduces mechanical injury risk.");
    }

    if (cultivar === "Beauregard") {
      score += 3;
      drivers.push("The current cultivar setting applies a small provisional susceptibility adjustment.");
    }

    score -= Math.min(plannedDelay * 3, 18);
    score = Math.round(clamp(score, 5, 95));
    const level = riskLabel(score);

    if (plannedDelay === 0 && score >= 55) actions.push("Consider delaying harvest 5–7 days where practical.");
    if (forecastRain >= 25) actions.push("Consider harvesting before forecast rain or waiting until the field dries.");
    if (daysSinceCutoff < 7) actions.push("Where practical, extend the irrigation cutoff toward 7–10 days.");
    if (handling !== "Gentle") actions.push("Reduce drop heights, chain speed, and abrasion during harvest and handling.");
    actions.push("Complete a small test harvest 3–5 days before full harvest.");
    if (actions.length === 1) actions.unshift("Current conditions are comparatively favourable; maintain careful handling.");

    return {
      score,
      level,
      maturity,
      drivers,
      actions,
      projectedDelayedScore: Math.round(clamp(score - Math.min((7 - plannedDelay) * 3, 18), 5, 95))
    };
  }, [cultivar, gdd, daysSinceCutoff, forecastRain, vineRemovalDays, soilMoisture, handling, plannedDelay]);

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Queensland, Australia</p>
          <h1>Sweetpotato Skinning Risk Agent</h1>
          <p className="subtitle">Demonstration Prototype – Proof of Concept</p>
        </div>
        <span className="badge">DEMONSTRATION PROTOTYPE</span>
      </header>

      <section className="logos" aria-label="Project partners">
        <Image src="/logos/australian-sweetpotato.png" alt="Australian Sweetpotato Growers Inc." width={320} height={100} />
        <Image src="/logos/hort-innovation.png" alt="Hort Innovation Sweetpotato Fund" width={280} height={95} />
        <Image src="/logos/lsu-agcenter.png" alt="LSU AgCenter" width={180} height={90} />
        <Image src="/logos/queensland-government.png" alt="Queensland Government" width={410} height={120} />
      </section>

      <section className="location-row">
        <div>
          <label>Queensland production region</label>
          <select value={location} onChange={e => selectLocation(e.target.value as LocationName)}>
            {Object.keys(locations).map(name => <option key={name}>{name}</option>)}
          </select>
          <small>{locations[location].note}</small>
        </div>
        <div className="weather-note">
          <strong>Weather data:</strong> SILO-ready prototype<br />
          <span>Current build uses editable location-specific demonstration values.</span>
        </div>
      </section>

      <section className="layout">
        <div className="panel controls">
          <h2>Crop & management inputs</h2>

          <div className="control-grid">
            <label>Cultivar / variety
              <select value={cultivar} onChange={e => setCultivar(e.target.value)}>
                <option>Beauregard</option>
                <option>Orleans</option>
                <option>Other / local cultivar</option>
              </select>
            </label>

            <label>Accumulated GDD: <strong>{gdd} °C-days</strong>
              <input type="range" min="800" max="2300" step="25" value={gdd} onChange={e => setGdd(Number(e.target.value))} />
            </label>

            <label>Days since irrigation cutoff: <strong>{daysSinceCutoff}</strong>
              <input type="range" min="0" max="21" step="1" value={daysSinceCutoff} onChange={e => setDaysSinceCutoff(Number(e.target.value))} />
            </label>

            <label>Expected rainfall before harvest: <strong>{forecastRain} mm</strong>
              <input type="range" min="0" max="80" step="1" value={forecastRain} onChange={e => setForecastRain(Number(e.target.value))} />
            </label>

            <label>Days since vine removal: <strong>{vineRemovalDays}</strong>
              <input type="range" min="0" max="14" step="1" value={vineRemovalDays} onChange={e => setVineRemovalDays(Number(e.target.value))} />
            </label>

            <label>Current soil moisture
              <select value={soilMoisture} onChange={e => setSoilMoisture(e.target.value as Moisture)}>
                <option>Wet</option>
                <option>Adequate</option>
                <option>Slightly dry</option>
                <option>Dry</option>
              </select>
            </label>

            <label>Expected harvest handling
              <select value={handling} onChange={e => setHandling(e.target.value as Handling)}>
                <option>Gentle</option>
                <option>Moderate</option>
                <option>Aggressive</option>
              </select>
            </label>

            <label>Explore harvest delay: <strong>{plannedDelay} days</strong>
              <input type="range" min="0" max="10" step="1" value={plannedDelay} onChange={e => setPlannedDelay(Number(e.target.value))} />
            </label>
          </div>
        </div>

        <div className="results">
          <section className={`risk-card ${result.level.toLowerCase().replace(" ", "-")}`}>
            <div className="score-ring">
              <div><strong>{result.score}</strong><span>/100</span></div>
            </div>
            <div>
              <p className="risk-label">Predicted skinning risk</p>
              <h2>{result.level.toUpperCase()} RISK</h2>
              <p>Conditions indicate a {result.level.toLowerCase()} modeled risk of skinning if harvesting proceeds under the selected conditions.</p>
              <div className="progress"><span style={{ width: `${result.score}%` }} /></div>
            </div>
          </section>

          <section className="result-grid">
            <div className="panel">
              <h2>Key risk drivers</h2>
              <ul>{result.drivers.map((d,i)=><li key={i}>{d}</li>)}</ul>
            </div>
            <div className="panel recommendation">
              <h2>Management recommendations</h2>
              <ol>{result.actions.map((a,i)=><li key={i}>{a}</li>)}</ol>
            </div>
          </section>

          <section className="panel scenario">
            <h2>Scenario explorer</h2>
            <p>If harvest is delayed by <strong>{plannedDelay} days</strong>, the current modeled score is <strong>{result.score}</strong>.</p>
            <p className="scenario-score">Projected score after an additional 7-day maturation window: <strong>{result.projectedDelayedScore}</strong></p>
          </section>
        </div>
      </section>

      <footer className="disclaimer">
        <h2>Demonstration Prototype – Proof of Concept</h2>
        <div className="disclaimer-grid">
          <p>This tool is a demonstration prototype developed as part of collaborative research to explore the use of weather and crop-management information in predicting sweetpotato skinning risk.</p>
          <p>It is <strong>not a commercial product</strong> and should not be used as the sole basis for harvest, irrigation, or crop-management decisions. Always use local knowledge, field observations, and a test harvest.</p>
          <p>The model, algorithms, coefficients, and risk scores are provisional and require refinement with Queensland field data across cultivars, regions, soils, seasons, and harvest systems.</p>
        </div>
      </footer>
    </main>
  );
}

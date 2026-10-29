"use client";
import { useState } from "react";
import {
  UserRoundSearch,
  ExternalLink,
  Copy,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  cleanPassengerName,
  identityNumberForCopy,
  validIdentityNumber,
  comparePassengerNames,
} from "@/lib/auxiliary-operational/domain/passenger-name-check";
import { passengerEmailLine } from "@/lib/auxiliary-operational/domain/auxiliary-text";
const procuraduria =
  "https://www.procuraduria.gov.co/Pages/consulta-de-antecedentes.aspx";
const registraduria = "https://certvigenciacedula.registraduria.gov.co/";
export default function PassengerNameCheck({
  canEdit,
  disabled,
  onAppend,
}: {
  canEdit: boolean;
  disabled: boolean;
  onAppend: (line: string) => void;
}) {
  const [number, setNumber] = useState(""),
    [reservation, setReservation] = useState(""),
    [names, setNames] = useState(""),
    [surnames, setSurnames] = useState(""),
    [reviewed, setReviewed] = useState(false),
    [message, setMessage] = useState("");
  const comparison = comparePassengerNames(reservation, names, surnames),
    numberValid = validIdentityNumber(number),
    ready =
      numberValid &&
      !!cleanPassengerName(names) &&
      !!cleanPassengerName(surnames),
    blocked = !canEdit || disabled;
  const line = passengerEmailLine({
    names: cleanPassengerName(names),
    surnames: cleanPassengerName(surnames),
    documentNumber: identityNumberForCopy(number),
    birthDate: "",
  });
  function change(set: (s: string) => void, value: string) {
    set(value);
    setReviewed(false);
    setMessage("");
  }
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(label + " copiado.");
    } catch {
      setMessage(
        "No se pudo copiar. Selecciona el texto y cópialo manualmente.",
      );
    }
  }
  function clear() {
    setNumber("");
    setReservation("");
    setNames("");
    setSurnames("");
    setReviewed(false);
    setMessage("");
  }
  return (
    <section
      className="aux-card aux-name-check"
      aria-labelledby="name-check-title"
    >
      <div className="aux-section-head">
        <h2 id="name-check-title">
          <UserRoundSearch size={21} /> Contrastar nombres sin foto
        </h2>
        <span className="aux-badge">Consulta manual · fuentes oficiales</span>
      </div>
      <p>
        Si solo tienes el número de cédula, abre la consulta oficial y contrasta
        el nombre que aparece con el de la reserva.
      </p>
      <details>
        <summary>Abrir consulta de nombres</summary>
        <ol className="aux-name-steps">
          <li>
            <strong>1. Copia la cédula</strong>
            <span>Ten listo el número para la consulta.</span>
          </li>
          <li>
            <strong>2. Consulta en Procuraduría</strong>
            <span>
              Selecciona el tipo de documento, pega el número y responde la
              pregunta de seguridad.
            </span>
          </li>
          <li>
            <strong>3. Contrasta y revisa</strong>
            <span>
              Trae los nombres y apellidos al portal y compáralos con la
              reserva.
            </span>
          </li>
        </ol>
        <fieldset className="aux-form" disabled={blocked}>
          <label>
            Cédula de ciudadanía
            <input
              value={number}
              maxLength={30}
              inputMode="numeric"
              autoComplete="off"
              placeholder="Número de cédula"
              onChange={(e) => change(setNumber, e.target.value)}
            />
            {number && !numberValid && (
              <small>
                Usa solo números; se permiten espacios y puntos de separación.
              </small>
            )}
          </label>
          <div className="aux-name-source aux-actions">
            <button
              type="button"
              disabled={blocked || !numberValid}
              onClick={() =>
                void copy(identityNumberForCopy(number), "Número de cédula")
              }
            >
              <Copy size={16} /> Copiar cédula
            </button>
            <a
              href={procuraduria}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="aux-name-link"
            >
              Abrir Procuraduría <ExternalLink size={16} />
              <span className="aux-name-sr"> (nueva pestaña)</span>
            </a>
          </div>
          <label className="aux-wide">
            Nombre completo en la reserva · opcional
            <input
              value={reservation}
              maxLength={400}
              autoComplete="off"
              placeholder="Nombres y apellidos, en ese orden"
              onChange={(e) => change(setReservation, e.target.value)}
            />
          </label>
          <label>
            Nombres según la consulta
            <input
              value={names}
              maxLength={200}
              autoComplete="off"
              placeholder="Incluye todos los nombres"
              onChange={(e) => change(setNames, e.target.value)}
            />
          </label>
          <label>
            Apellidos según la consulta
            <input
              value={surnames}
              maxLength={200}
              autoComplete="off"
              placeholder="Incluye todos los apellidos"
              onChange={(e) => change(setSurnames, e.target.value)}
            />
          </label>
          {comparison !== "empty" && (
            <p
              role="status"
              className={
                "aux-wide " +
                (comparison === "match" ? "aux-notice" : "aux-review-note")
              }
            >
              {comparison === "match"
                ? "El nombre de la reserva coincide con los nombres y apellidos que digitaste."
                : "La escritura difiere. Revisa nombres, apellidos, orden y tildes antes de emitir."}{" "}
              La comparación ignora mayúsculas y espacios repetidos; conserva
              tildes y la ñ.
            </p>
          )}
          <label className="aux-check aux-wide">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => {
                setReviewed(e.target.checked);
                setMessage("");
              }}
            />{" "}
            Consulté la fuente oficial, comprobé que corresponde a esta cédula y
            revisé los nombres y apellidos digitados.
          </label>
          {ready && (
            <div className="aux-wide aux-name-result">
              <small>Texto preparado · revisión manual</small>
              <p>{line}</p>
            </div>
          )}
          <div className="aux-actions aux-wide">
            <button
              type="button"
              className="aux-primary"
              disabled={blocked || !ready || !reviewed}
              onClick={() => {
                onAppend(line);
                setMessage("Nombre añadido al texto de pasajeros.");
              }}
            >
              <Plus size={16} /> Añadir a datos de pasajeros
            </button>
            <button
              type="button"
              disabled={blocked || !ready || !reviewed}
              onClick={() => void copy(line, "Texto del pasajero")}
            >
              <Copy size={16} /> Copiar pasajero
            </button>
            <button type="button" onClick={clear}>
              <RotateCcw size={16} /> Limpiar consulta
            </button>
          </div>
        </fieldset>
        {message && (
          <p role="status" className="aux-notice">
            {message}
          </p>
        )}
        <p className="aux-muted">
          La consulta se completa en la página oficial. El portal compara lo que
          tú digitas y no recibe automáticamente el resultado. Confirma los
          nombres con el pasajero o su documento antes de emitir; para vuelos
          internacionales contrasta con el pasaporte.
        </p>
        <details className="aux-name-alternative">
          <summary>Otra fuente oficial: Registraduría</summary>
          <p>
            El certificado de estado de la cédula requiere el número y la fecha
            de expedición. Úsalo como consulta complementaria cuando tengas esos
            datos.
          </p>
          <a
            href={registraduria}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
          >
            Consultar estado de cédula <ExternalLink size={14} />
          </a>
        </details>
      </details>
    </section>
  );
}

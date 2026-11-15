import "./author-foundations.css";

/** The same reading framework accompanies the project and each final reflection. */
export function AuthorFoundations({
  variant,
}: {
  variant: "project" | "reflection";
}) {
  const reflection = variant === "reflection";
  return (
    <div className={`author-foundations authors-${variant}`}>
      <div
        className={reflection ? "reflection-foundation-grid" : "theory-grid"}
      >
        <article>
          <span className="small-caps">01 / PERSPECTIVA Y FOCALIZACIÓN</span>
          <h3>Luz Aurora Pimentel</h3>
          <cite className="author-work">
            El relato en perspectiva. Estudio de teoría narrativa
          </cite>
          <h4>Quién habla, quién percibe y qué podemos conocer</h4>
          <p>
            En esta obra, Pimentel estudia cómo se construye un relato: el
            tiempo, el espacio, los personajes y las formas de presentar la
            información. La perspectiva organiza nuestra entrada a ese mundo. Un
            relato selecciona qué muestra, desde dónde lo muestra y a qué
            conciencia permite acercarnos; esa selección orienta lo que podemos
            comprender de los acontecimientos.
          </p>
          <p>
            Distinguir la voz narrativa de la focalización ayuda a hacer
            preguntas diferentes: ¿quién cuenta? y ¿desde qué percepción o
            conocimiento se presenta lo contado? La focalización regula el
            acceso a la información. Conocer los pensamientos de una persona no
            equivale a conocer los de todas; tampoco lo que alguien percibe
            permite agotar la experiencia de quienes la rodean.
          </p>
          <h4>La misma consulta, tres centros de atención</h4>
          <p>
            En nuestros poemas, Elena atiende a la memoria, el reconocimiento y
            su libertad; su hija, al miedo y al esfuerzo de acompañarla; el
            médico, a los límites de su saber y a la responsabilidad de
            orientar. Cada voz en primera persona abre una experiencia interior.
            Sus diferencias no son un error que debamos corregir para obtener
            una versión única: muestran lo que permanece fuera de cada mirada.
          </p>
          <p>
            Por eso la experiencia propone leer las tres voces antes de elegir.
            Al compararlas podemos preguntar qué sabe cada persona, qué supone
            sobre las otras y qué aún no ha podido escuchar. La elección revela
            nuestro primer foco de atención; volver a las demás voces permite
            ampliar esa lectura.
          </p>
        </article>
        <article>
          <span className="small-caps">02 / DISCURSO E INTERPRETACIÓN</span>
          <h3>Paul Ricoeur</h3>
          <cite className="author-work">
            Teoría de la interpretación. Discurso y excedente de sentido
          </cite>
          <h4>De lo que alguien dice a lo que un texto permite comprender</h4>
          <p>
            Ricoeur piensa el discurso como un acontecimiento en el que alguien
            dice algo a alguien, acerca de un mundo. El acto de decir ocurre en
            una situación concreta, pero su sentido puede ser comprendido de
            nuevo. La escritura hace posible esa continuidad: el texto permanece
            y puede encontrar lectores que no estuvieron en la situación en que
            fue producido.
          </p>
          <p>
            Esa distancia abre una autonomía del texto respecto de la intención
            de su autor y de sus primeros destinatarios. Comprenderlo exige
            atender a sus palabras, a sus relaciones y al mundo que propone. El
            lector participa en esa comprensión desde sus propias preguntas,
            pero necesita sostener su interpretación con lo que el texto
            efectivamente permite leer.
          </p>
          <h4>
            Un sentido que se amplía sin perder el vínculo con las palabras
          </h4>
          <p>
            En su reflexión sobre la metáfora y el símbolo, Ricoeur muestra cómo
            el lenguaje puede abrir significados que una paráfrasis literal no
            agota. El excedente de sentido nombra esa riqueza interpretativa. No
            convierte todas las lecturas en equivalentes: explicar cómo está
            construido un texto y comprender lo que nos invita a pensar son
            tareas que se necesitan mutuamente.
          </p>
          <p>
            Aquí, una primera lectura puede reconocer miedo; otra puede
            encontrar también un deseo de autonomía, una petición de apoyo o una
            forma de responsabilidad. Releer puede cambiar nuestra elección. La
            pregunta final invita a hacer explícito ese recorrido: ¿qué palabras
            del poema sostienen mi lectura y qué cambia cuando las pongo en
            diálogo con las otras dos voces?
          </p>
        </article>
      </div>
      <p className="author-connection">
        Pimentel ayuda a reconocer cómo se organiza lo que cada voz deja ver;
        Ricoeur, a pensar cómo ese texto sigue produciendo comprensión al ser
        leído. Desde ambas obras, el proyecto propone una escucha que reconoce
        sus límites, vuelve a las palabras y permanece abierta a lo que otra
        persona puede aportar al encuentro.
      </p>
      <details
        className={
          reflection
            ? "author-references reflection-references"
            : "author-references"
        }
      >
        <summary>Obras citadas y claves de lectura</summary>
        <ul>
          <li>
            Luz Aurora Pimentel.{" "}
            <cite>El relato en perspectiva. Estudio de teoría narrativa.</cite>{" "}
            Para profundizar en la organización del relato, la voz narrativa, la
            perspectiva y la focalización.
          </li>
          <li>
            Paul Ricoeur.{" "}
            <cite>
              Teoría de la interpretación. Discurso y excedente de sentido.
            </cite>{" "}
            Para profundizar en el discurso, la escritura, la metáfora y la
            relación entre explicación y comprensión.
          </li>
        </ul>
        <p>
          Las relaciones con Elena, su hija y el médico son una lectura del
          proyecto a partir de estas obras. Puedes contrastarla con los poemas y
          proponer otros sentidos apoyándote en sus palabras.
        </p>
      </details>
    </div>
  );
}

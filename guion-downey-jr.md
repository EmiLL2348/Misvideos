# Guion: Recluso P50522. De la cárcel a la armadura (y a la máscara)

## Especificaciones técnicas
- **Formato:** horizontal 16:9, 1920×1080, 30 fps
- **Duración objetivo:** 2:50–3:00 (narración de unas 440 palabras a ~155 palabras por minuto)
- **Voz:** español de España (castellano), masculina y grave, con tono de documental: contenida en la caída y más cálida y épica en la remontada
  - Opciones de TTS: ElevenLabs con una voz castellana masculina, Azure `es-ES-AlvaroNeural` o Google `es-ES` Neural2 masculina
  - Pausas de 0.4 s en cada "…" y de 0.8 s entre escenas

---

## ⚠️ REGLAS DE CALIDAD (obligatorias, revisar escena por escena)

### 1. Nada flota
- Todo objeto o personaje apoyado tiene **contacto real con su superficie**: los pies sobre la línea del suelo, los objetos sobre la mesa y el coche sobre el asfalto.
- Cada escena define una **línea de suelo** (`floorY`). Los personajes y objetos se colocan con su base exactamente en ella (tolerancia 0 px).
- Hay que añadir **sombra de contacto** (elipse difuminada, 20–35% de opacidad) bajo personajes, muebles, coches y objetos apoyados.
- Solo flotan las cosas que flotan de verdad: humo, polvo, partículas de luz y papeles que caen *con gravedad* (aceleración y luego reposo).

### 2. Nada traspasa nada
- **Orden de capas (z-index) fijo** por escena: fondo → edificios → suelo → objetos traseros → personaje → objetos delanteros → partículas → texto.
- Un personaje que se sienta queda **delante** del respaldo y **detrás** de la mesa. Las manos que cogen algo quedan **delante** del objeto.
- Antes de animar, comprobar que los recuadros de los personajes y de los objetos sólidos **no se solapan** salvo en contactos intencionados (mano–objeto, pies–suelo).
- Las puertas, barrotes y rejas van en una capa delantera cuando el personaje está detrás.

### 3. Movimiento creíble
- Siempre con *easing* (`ease-in-out`), nunca lineal salvo en las partículas.
- Al caminar, el cuerpo sube y baja ligeramente y los pies **no resbalan** (velocidad del fondo = velocidad del paso).
- Los objetos que caen aceleran, rebotan una vez como mucho y quedan en reposo.
- Cámara: paneos y *zooms* lentos (máximo 8% de *zoom* por escena) y parallax de 3 a 5 capas.

### 4. Música coordinada y limpia
- **Solo música libre de derechos:** la Biblioteca de audio de YouTube (licencia sin atribución) o música generada por el propio proyecto. **Nada de bandas sonoras de películas ni canciones comerciales.**
- Un **tema por bloque emocional**, con transiciones exactamente en los cortes de escena (fundido cruzado de 1 s):
  - Escenas 1–3: piano y cuerdas suaves, de misterio
  - Escenas 4–6: pulso grave y tenso, con percusión mínima
  - Escena 7: un silencio de 1 s y después piano esperanzador
  - Escenas 8–9: crecimiento orquestal épico
  - Escena 10: tono oscuro y elegante para el giro del villano
- **Mezcla sin saturar:** la voz a −16 LUFS y la música a −28 LUFS bajo la voz (bajada automática de −12 dB cuando hay narración). Pico máximo de −1 dBTP. Sin distorsión ni graves que retumben.
- Los efectos de sonido (portazo de celda, olas, flash de cámara) van sincronizados al fotograma de la acción y a un volumen discreto.

### 5. Imagen brillante y nítida (nada borroso ni de baja calidad)
- **Resolución real:** se renderiza a 1920×1080 nativo (mejor aún a 3840×2160 y luego se reduce). **Nunca se escala hacia arriba una imagen pequeña.** Las ilustraciones y fondos se generan al menos al tamaño final.
- **Gráficos vectoriales** (SVG o formas) para personajes, iconos y textos siempre que se pueda, porque no pierden nitidez. Las imágenes rasterizadas tienen que ser de alta resolución.
- **Nada de desenfoque general:** sin *blur* de fondo exagerado ni filtros "soñadores". La profundidad de campo es suave y **solo en la capa más lejana**: el personaje y el primer plano, siempre enfocados.
- **Brillo y contraste:** exposición generosa. Hasta las escenas de noche o de cárcel tienen que leerse bien, con luces de relleno y bordes iluminados en los personajes. Los negros no se aplastan y no hay zonas quemadas. Los colores van saturados pero naturales.
- **Sin grano ni viñeteado fuerte:** grano al 0–3% como mucho (o nada) y viñeteado mínimo.
- **Texto nítido:** tipografía con contorno o sombra suave y tamaño mínimo de 48 px.
- **Exportación de alta calidad:** H.264, perfil High, CRF 16–18 o un bitrate de 12–16 Mbps a 1080p (35–45 Mbps si es 4K), *preset* `slow` y `yuv420p`. Sin doble compresión: se exporta una sola vez desde el original.
- **Movimiento sin borrones:** desenfoque de movimiento leve solo en movimientos rápidos, nunca en planos quietos.

### 6. Derechos y nombres (para evitar reclamos)
- Las **marcas de personajes no aparecen en pantalla:** nada de logotipos de estudios, títulos de películas en su tipografía oficial, ni el nombre del héroe de la armadura en textos de pantalla.
- **La armadura:** se muestra una **armadura genérica de acero gris**, sin la combinación de rojo y dorado y sin círculo luminoso en el pecho.
- **La máscara del villano:** se muestra una **máscara metálica lisa y genérica sobre una mesa**, sin capucha verde ni el diseño del cómic.
- **Personas reales:** son **ilustraciones originales**, sin imitar el parecido real. Se reconocen por la narración y el contexto. Los secundarios reales (el director, otro actor, su mujer) se muestran **en silueta**.
- **Marcas:** el restaurante de comida rápida es genérico, sin logotipo ni colores de una cadena real.
- La palabra "Doom" solo se dice en la narración, nunca como logotipo ni en la tipografía del cómic.

---

## Estilo de animación (elige uno en la pantalla de tu herramienta)

| Opción | Estilo | Por qué elegirla | Prompt corto |
|---|---|---|---|
| **A (recomendada)** | **2.5D cinematográfico semi-realista** | Fondos pintados con luz real, sombras, profundidad y personajes con proporciones humanas. Es la más "de documental" y la más espectacular. | "Animación 2.5D semi-realista, fondos pintados digitalmente, iluminación cinematográfica, sombras de contacto, parallax de 5 capas, imagen nítida y luminosa en alta resolución" |
| **B** | **Novela gráfica noir** | Blanco y negro con un único color de acento (ámbar). Encaja perfecto con la historia de cárcel y redención. | "Novela gráfica noir, tinta y sombras duras, acento ámbar, viñetas animadas con transiciones entre paneles" |
| **C** | **3D estilizado** | Personajes 3D simples con iluminación volumétrica. Muy llamativo, pero más difícil de hacer bien. | "3D estilizado tipo cortometraje, materiales mate, luz volumétrica, cámara cinematográfica" |
| **D** | **Collage de archivo** | Recortes de periódico, fichas policiales ilustradas y sellos. Original y barato de producir. | "Collage animado, recortes de periódico ilustrados, textura de papel, movimiento stop-motion" |

## Paleta y look (Opción A)
- **Caída (escenas 2–6):** azules fríos `#1E2A3A`, grises `#4A5361`, luces de sodio naranjas `#E08A3C` y rojo de sirena `#D33A3A`
- **Remontada (escenas 7–9):** amanecer dorado `#F2B45A`, cielo `#7FB6E0` y blanco cálido `#FFF4E2`
- **Giro final (escena 10):** verde muy oscuro `#0F1F17`, acero `#9AA4AD` y negro
- **Tipografía:** sans-serif condensada y gruesa para cifras y fechas (Oswald o Bebas Neue) y serif elegante para las citas
- Imagen limpia y luminosa: sin grano o con grano casi imperceptible, y viñeteado mínimo (ver la regla 5)

## Personajes (ilustraciones originales)
- **Robert:** hombre de pelo oscuro, perilla y mirada intensa. Tres edades: niño (8 años), joven estrella (27 años, traje de época) y adulto (40–60 años). **No es una réplica del parecido del actor real.**
- **El padre:** silueta de cineasta con cámara de 16 mm al hombro.
- **Susan:** silueta femenina con carpeta de producción, iluminada a contraluz.
- **El director:** silueta corpulenta con gorra, junto a un monitor de rodaje.
- **El actor que le ayudó:** silueta de espaldas, con la mano en el hombro de Robert.

---

## ESCENA 1 · Gancho (0:00–0:13)
**Narración:**
> 1999. Un actor nominado al Óscar entra en una prisión de California como el recluso P50522. Nueve años después, protagoniza la película que levantó la mayor saga de superhéroes del cine.

**Visuales:**
- Plano cerrado de una placa de recluso: los números **P50522** se graban uno a uno con un sonido metálico.
- *Zoom out*: Robert adulto con uniforme de preso, de pie **sobre el suelo de un pasillo** con sombra bajo los pies. Una reja se cierra **delante** de él (capa delantera).
- *Match cut*: la reja se transforma en las líneas de una pantalla de cine que se ilumina. Destello blanco.
- Título: **"RECLUSO P50522"**.

---

## ESCENA 2 · Una infancia rota (0:13–0:30)
**Narración:**
> Nació en Nueva York en 1965, hijo de un director de cine independiente. Creció entre rodajes… y entre drogas. Según él mismo contó, a los ocho años ya era adicto.

**Visuales:**
- Nueva York en los años 70 con parallax: edificios de ladrillo, taxis amarillos genéricos y vapor saliendo de las alcantarillas.
- Interior de un piso bohemio: el padre (silueta) filma con su cámara al hombro. Robert niño está **sentado en el suelo**, con la sombra bajo él, rodeado de latas de película.
- La luz cálida se enfría poco a poco hacia el azul. Sobre la mesa (apoyada, no flotando) hay una copa y humo que sube despacio.
- Texto discreto: **"NUEVA YORK · 1965"**.

---

## ESCENA 3 · La promesa de Hollywood (0:30–0:42)
**Narración:**
> Su talento era enorme. Antes de cumplir los treinta, interpretó a Charlie Chaplin y logró su primera nominación al Óscar.

**Visuales:**
- Plató de cine en blanco y negro: Robert joven con bombín y bastón **apoyado en el suelo**, bajo un foco.
- La imagen pasa de blanco y negro a color. Flashes de cámaras.
- Alfombra roja: Robert camina y sus pies se sincronizan con el suelo, sin resbalar. Rótulo: **"1993 · NOMINADO AL ÓSCAR"**.

---

## ESCENA 4 · La caída (0:42–1:05)
**Narración:**
> Pero en junio de 1996, la policía le paró por exceso de velocidad y encontró en su coche cocaína, heroína y una pistola. Empezó una espiral: controles antidroga que no pasaba, meses en la cárcel del condado… Y en 1999, tras saltarse otro control, un juez le condenó a tres años de prisión.

**Visuales:**
- Noche en una carretera de costa. Un coche deportivo genérico **con las ruedas sobre el asfalto** y luces rojas y azules reflejadas en la carrocería.
- Un agente (silueta) junto a la ventanilla. Sobre el asiento hay tres iconos sobrios (polvo, jeringa estilizada y pistola) dentro de una bolsa de pruebas **que reposa sobre el asiento**.
- Montaje rápido de titulares de periódico ilustrados y genéricos que caen **y se apilan** sobre una mesa: "DETENIDO", "VIOLA LA CONDICIONAL", "OTRA VEZ".
- Un mazo de juez golpea la mesa (contacto real y vibración). Texto: **"3 AÑOS DE PRISIÓN"**.

---

## ESCENA 5 · La prisión (1:05–1:18)
**Narración:**
> Pasó casi un año en la prisión estatal de Corcoran, una de las más duras de California. Él mismo lo recordaría como lo peor que le había pasado.

**Visuales:**
- Vista aérea de una prisión en el desierto al atardecer, con alambradas y torres.
- Interior de la celda: Robert **sentado en el borde de la litera**, con los pies en el suelo, y los barrotes en la capa delantera.
- Un rayo de luz entra por una ventana alta y las partículas de polvo flotan en el haz (aquí sí flotan, y lentamente).
- Un calendario en la pared tacha los días.

---

## ESCENA 6 · La recaída (1:18–1:33)
**Narración:**
> Salió en 2000 y tuvo otra oportunidad: un papel en una serie de éxito que le dio un Globo de Oro. Pero en abril de 2001 volvieron a detenerle y le despidieron. Ninguna productora se atrevía a contratarle.

**Visuales:**
- Plató de televisión iluminado. Robert sostiene un **trofeo dorado genérico** (no el oficial) con las dos manos, con las manos delante del trofeo.
- Corte brusco: las luces del plató se apagan una a una con un "clac".
- Un despacho donde varias puertas se cierran. Un sello rojo **"NO ASEGURABLE"** cae sobre una carpeta **apoyada en la mesa**.

---

## ESCENA 7 · El océano (1:33–2:00)
**Narración:**
> Entonces, alguien dio la cara por él: el actor Mel Gibson, que según se ha contado avaló personalmente su seguro para que pudiera volver a rodar. En 2003, en otro rodaje, conoció a la productora Susan Levin. Ella fue clara: o las drogas, o ella. Ese julio, Robert condujo hasta la playa… y tiró todas sus drogas al océano.

**Visuales:**
- Un plató vacío de noche. Una silueta de espaldas apoya la mano en el hombro de Robert (la mano **sobre** el hombro, sin atravesarlo).
- Transición con el foco del plató hacia el contraluz de Susan (silueta) con la carpeta. Primer plano de Robert decidiendo.
- **Silencio musical de 1 s.**
- Un amanecer en la costa del Pacífico. El coche **aparcado sobre la arena compacta**, con sombra. Robert camina hasta la orilla con huellas que quedan marcadas en la arena.
- Lanza una bolsa: sigue una parábola con gravedad, entra en el agua con salpicadura y ondas, y desaparece. Sonido de olas.
- Empieza el piano esperanzador. Rótulo: **"JULIO · 2003"**.

---

## ESCENA 8 · El héroe que nadie quería (2:00–2:17)
**Narración:**
> Pero seguía siendo "el actor problemático". Cuando el director Jon Favreau le propuso para una película de un héroe con armadura, el estudio se negó. Favreau insistió, consiguió una prueba… y Robert la bordó. Años después, el jefe del estudio admitiría que contratarle fue el mayor riesgo que habían corrido.

**Visuales:**
- Una sala de juntas con ejecutivos en silueta tras una mesa larga. Uno de ellos niega con la cabeza.
- El director (silueta con gorra) golpea suavemente la mesa con la palma (contacto real).
- Un plató de prueba: Robert frente a una cámara con un monitor que muestra su cara. Los ejecutivos se inclinan hacia delante.
- **Revelación:** en un taller, una **armadura genérica de acero gris** sobre un soporte con la base apoyada en el suelo. Robert pone la mano sobre el pecho de la armadura. Chispas de soldadura que caen al suelo y se apagan.

---

## ESCENA 9 · La cima (2:17–2:42)
**Narración:**
> La película se estrenó en mayo de 2008 y recaudó unos 585 millones de dólares. El hombre al que nadie quería asegurar llegó a cobrar unos 50 millones por una sola película. En 2015, el gobernador de California le indultó. Y en 2024 ganó, por fin, el Óscar. A su mujer le dijo: "Me devolviste a la vida".

**Visuales:**
- Una marquesina de cine con bombillas que se encienden, sin título de la película: solo **"ESTRENO · MAYO 2008"**.
- Un contador dorado sube hasta **$585.000.000**.
- Una carpeta oficial con un sello **"INDULTO · 2015"** que se estampa sobre ella, apoyada en la mesa.
- Un escenario de gala: Robert con un **trofeo dorado genérico**, Susan (silueta) aplaudiendo en primera fila. Confeti que cae con gravedad y se posa en el suelo.

---

## ESCENA 10 · Nueva máscara (2:42–3:00)
**Narración:**
> Y ahora, otro giro: el 18 de diciembre vuelve a esa misma saga… pero como el gran villano, Doom. Al anunciarlo lo resumió así: "Nueva máscara, misma misión". ¿Creéis en las segundas oportunidades? Contádnoslo en los comentarios.

**Visuales:**
- Una sala oscura con luz verde muy tenue. Sobre una mesa de piedra, **una máscara metálica lisa y genérica** que descansa sobre la mesa con su sombra.
- Robert (de espaldas) la coge con las dos manos (manos delante de la máscara) y la cámara rodea lentamente la escena.
- Corte a negro con el texto **"18 · 12 · 2026"**.
- Pantalla final de 5 s con el botón **SUSCRÍBETE** y espacio para las tarjetas de YouTube.

---

## Prompt sugerido para Claude Code
> Lee `guion-downey-jr.md` y genera el video completo en la Opción A (2.5D cinematográfico semi-realista), con 1920×1080 a 30 fps. **Cumple todas las REGLAS DE CALIDAD antes de renderizar:** define `floorY` por escena, añade sombras de contacto, fija el orden de capas y comprueba que no haya solapamientos que no se deban, y nada flotando salvo las partículas. Personajes ilustrados originales, sin imitar el parecido de personas reales. Sin logotipos, sin la armadura roja y dorada y sin el diseño de la máscara del cómic. Narración TTS masculina en español de España a ~155 palabras por minuto. Música solo libre de derechos, un tema por bloque emocional, con fundidos cruzados en los cortes, voz a −16 LUFS, música bajada −12 dB bajo la voz y pico máximo de −1 dBTP. La imagen tiene que ser brillante y nítida: render nativo a 1080p o superior, sin escalar imágenes pequeñas, sin desenfoque general ni grano fuerte, buena exposición incluso en las escenas de noche y exportación H.264 con CRF 16–18 o 12–16 Mbps. Exporta la voz, la música y los efectos en pistas separadas. Antes del render final, genera un fotograma de control por escena para revisar suelos, capas y sombras.

## Fuentes (verificadas)
- Detención de 1996 (velocidad, cocaína, heroína y pistola) e indulto de 2015: Associated Press y Washington Times
- Condena de 3 años en 1999 y estancia en Corcoran: CNN y New York Post
- Globo de Oro y despido en abril de 2001: Associated Press
- Adicción a los 8 años (documental *Sr.*) y discurso del Óscar 2024: Associated Press y The Hollywood Reporter
- Episodio del océano en 2003 y Susan Levin: entrevista de *Empire* y *Harper's Bazaar* (recogidas por Snopes y /Film)
- Ayuda de Mel Gibson con el seguro: *The Guardian* (recogido por otros medios; es "según se ha contado")
- Rechazo inicial del estudio y "el mayor riesgo": Kevin Feige a CinemaBlend (GamesRadar)
- Taquilla de 585 millones: Box Office Mojo
- Unos 50 millones por *Los Vengadores* (2012): The Hollywood Reporter (vía Grantland)
- Anuncio como villano en la Comic-Con 2024 ("New mask, same task") y estreno el 18/12/2026: Marvel.com, Variety y AP

// ============================================================
// CARBON COUNTER - CUESTIONARIO DE HUELLA ECOLÓGICA
// ============================================================
// Proyecto: Calculadora de Huella de Carbono
// Autor: Ricardo
// Descripción: Sistema interactivo de cuestionario que evalúa 
// el impacto ambiental del usuario mediante preguntas sobre 
// transporte, consumo, alimentación, energía y residuos.
// ============================================================

// ============================================================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ============================================================


let preguntas = [];
let indiceActual = 0;
let puntuacionTotal = 0;
let puntuacionPorCategoria = {};

const categoriasConfig = {
    'Transporte': { icono: '🚗', clase: 'transporte' },
    'Consumo': { icono: '🛍️', clase: 'consumo' },
    'Alimentación': { icono: '🥘', clase: 'alimentacion' },
    'Energía': { icono: '💡', clase: 'energia' },
    'Residuos': { icono: '♻️', clase: 'residuos' }
};

/*
 * Configuración de los diferentes niveles de resultados finales
 * Define el mensaje, icono y color según la puntuación obtenida
 * - ECO_HERO: 80% o más (muy ecológico)
 * - MEDIO: 50-79% (bueno pero mejorable)
 * - CONTAMINANTE: Menos de 50% (necesita mejorar)
 */
const resultadosConfig = {
    'ECO_HERO': {
        icono: '🌿',
        titulo: 'Eres un Eco-Héroe',
        mensaje: '¡Increíble! Tu estilo de vida es ejemplar. El planeta está en buenas manos contigo. Sigue así y sé un modelo para otros.',
        color: '#10b981'
    },
    'MEDIO': {
        icono: '🌱',
        titulo: 'Tienes Potencial Ecológico',
        mensaje: 'Vas en la dirección correcta, pero hay espacio para mejorar. Pequeños cambios pueden hacer una gran diferencia.',
        color: '#f59e0b'
    },
    'CONTAMINANTE': {
        icono: '⚠️',
        titulo: 'Necesitas Cambiar de Hábitos',
        mensaje: 'Tu huella de carbono es significativa. Es hora de tomar acciones concretas para proteger el planeta. ¡Tú puedes lograrlo!',
        color: '#ef4444'
    }
};

// ============================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================================

/*
 * Evento para iniciar el cuestionario cuando termine de cargar la pagina.
 */
document.addEventListener('DOMContentLoaded', function () {
    inicializarCuestionario();
});

// ============================================================
// FUNCIONES DE CARGA DE DATOS (AJAX)
// ============================================================

/*
 * Función principal de inicialización del cuestionario
 * - Realiza la petición AJAX al archivo data.json
 * - Carga las preguntas en memoria
 * - Inicializa el sistema de puntuación por categorías
 * - Muestra la primera pregunta tras un delay
 */
function inicializarCuestionario() {
    // Fetch API para cargar el JSON (AJAX sin jQuery)
    fetch('data.json')
        .then(response => {
            // Verificar que la respuesta sea exitosa
            if (!response.ok) throw new Error('Error al cargar data.json');
            return response.json();
        })
        .then(data => {
            // Guardar las preguntas del JSON en la variable global
            preguntas = data.items;
            console.log("✓ Datos cargados correctamente:", data.metadata.lastUpdated);

            // Inicializar puntuación por categoría
            // Para cada pregunta, crear una entrada en el objeto con puntos = 0
            preguntas.forEach(pregunta => {
                puntuacionPorCategoria[pregunta.categoria] = 0;
            });

            // Mostrar primera pregunta después de 800ms (efecto de transición)
            setTimeout(mostrarPregunta, 800);
        })
        .catch(err => {
            // Si hay error en la carga, mostrar pantalla de error
            console.error("✗ Error al obtener datos:", err);
            mostrarErrorCarga();
        });
}

/*
 * Muestra una pantalla de error si falla la carga del JSON
 * Ofrece al usuario la opción de reintentar
 */
function mostrarErrorCarga() {
    const loadingScreen = document.getElementById('loading-screen');
    // Reemplazar el contenido del loading screen con mensaje de error
    loadingScreen.innerHTML = `
        <div style="text-align: center; color: #ef4444;">
            <p style="font-size: 1.2rem; font-weight: 600;">⚠️ Error al cargar el cuestionario</p>
            <p style="margin-top: 0.5rem; color: #64748b;">Verifica que el archivo "data.json" esté en la carpeta correcta.</p>
            <button onclick="location.reload()" style="
                margin-top: 1rem;
                padding: 0.75rem 1.5rem;
                background: #10b981;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            ">Reintentar</button>
        </div>
    `;
}

// ============================================================
// FUNCIONES DE NAVEGACIÓN Y VISUALIZACIÓN
// ============================================================

/*
 * Muestra la pregunta actual o el resultado final si ya no hay más preguntas
 * Controla la lógica principal del flujo del cuestionario
 * 
 * Flujo:
 * 1. Verifica si quedan preguntas
 * 2. Oculta pantallas innecesarias (loading, resultado)
 * 3. Muestra la pregunta actual
 * 4. Actualiza el badge de categoría
 * 5. Actualiza la barra de progreso
 * 6. Renderiza las opciones de respuesta
 */
function mostrarPregunta() {
    // Obtener referencias a los contenedores principales
    const loadingScreen = document.getElementById('loading-screen');
    const quizContainer = document.getElementById('quiz-container');
    const resultadoFinal = document.getElementById('resultado-final');

    // Verificar si aún hay preguntas por mostrar
    if (indiceActual < preguntas.length) {
        // Ocultar pantalla de carga y resultado, mostrar cuestionario
        loadingScreen.classList.add('hidden');
        resultadoFinal.classList.add('hidden');
        quizContainer.classList.remove('hidden');

        // Obtener la pregunta actual del array
        const pregunta = preguntas[indiceActual];

        // Actualizar categoría badge con icono y texto
        const categoryBadge = document.getElementById('category-badge');
        const config = categoriasConfig[pregunta.categoria];
        categoryBadge.textContent = `${config.icono} ${pregunta.categoria}`;
        categoryBadge.className = `category-badge ${config.clase}`;

        // Actualizar título y descripción de la pregunta
        const preguntaTexto = document.getElementById('pregunta-texto');
        const preguntaDescripcion = document.getElementById('pregunta-descripcion');

        preguntaTexto.textContent = pregunta.nombre;
        preguntaDescripcion.textContent = pregunta.descripcion;

        // Actualizar barra de progreso (visual feedback del avance)
        actualizarProgreso();

        // Renderizar los botones de opciones
        renderizarOpciones(pregunta);

    } else {
        // No quedan más preguntas: mostrar pantalla de resultado
        mostrarResultado();
    }
}

/**
 * Actualiza visualmente la barra de progreso del cuestionario
 * Calcula el porcentaje completado y lo refleja en la UI
 */
function actualizarProgreso() {
    const progressBarContainer = document.querySelector('.progress-bar');
    const progressText = document.getElementById('progress-text');

    // Calcular porcentaje: (pregunta actual + 1) / total de preguntas * 100
    const porcentajeProgreso = ((indiceActual + 1) / preguntas.length) * 100;

    // Crear o actualizar la barra de progreso interna
    // (Se crea dinámicamente porque CSS ::after no es manipulable con JS)
    let progressBarFill = document.getElementById('progress-bar-fill');
    if (!progressBarFill) {
        progressBarFill = document.createElement('div');
        progressBarFill.id = 'progress-bar-fill';
        progressBarFill.className = 'progress-bar-fill';
        progressBarContainer.appendChild(progressBarFill);
    }

    // Actualizar el ancho de la barra (transición CSS aplicará animación)
    progressBarFill.style.width = porcentajeProgreso + '%';
    progressText.textContent = Math.round(porcentajeProgreso) + '%';

    // Actualizar atributos ARIA para accesibilidad
    document.querySelector('[role="progressbar"]').setAttribute('aria-valuenow', Math.round(porcentajeProgreso));
}

/**
 * Renderiza los botones de opciones para la pregunta actual
 * Crea dinámicamente un botón por cada opción disponible
 */
function renderizarOpciones(pregunta) {
    const contenedorOpciones = document.getElementById('opciones-container');
    contenedorOpciones.innerHTML = ''; // Limpiar opciones anteriores

    // Crear un botón por cada opción de la pregunta
    pregunta.opciones.forEach((opcion, index) => {
        const btn = document.createElement('button');
        btn.className = 'opcion-btn';
        btn.textContent = opcion.texto;
        btn.setAttribute('type', 'button');
        btn.setAttribute('tabindex', '0'); // Accesibilidad: navegación por teclado

        // Asignar evento click que registra la selección
        btn.onclick = () => seleccionarOpcion(opcion, pregunta);

        // Agregar animación escalonada (cada botón aparece con delay)
        btn.style.animationDelay = `${index * 0.1}s`;

        contenedorOpciones.appendChild(btn);
    });
}

// ============================================================
// FUNCIONES DE LÓGICA DE NEGOCIO
// ============================================================

/*
 * Procesa la selección de una opción por parte del usuario
 * - Registra la puntuación obtenida
 * - Avanza al siguiente paso del cuestionario
 * - Aplica transición visual suave 
 */
function seleccionarOpcion(opcion, pregunta) {
    // Sumar puntos a la puntuación total
    puntuacionTotal += opcion.puntos;

    // Sumar puntos a la categoría específica
    puntuacionPorCategoria[pregunta.categoria] += opcion.puntos;

    // Incrementar índice para pasar a la siguiente pregunta
    indiceActual++;

    // Aplicar animación de salida a la tarjeta de pregunta
    const questionCard = document.querySelector('.question-card');
    questionCard.style.animation = 'slideOut 0.3s ease-out forwards';

    // Después de la animación, resetear y mostrar siguiente pregunta
    setTimeout(() => {
        questionCard.style.animation = ''; // Limpiar animación
        mostrarPregunta();
    }, 300);
}

// ============================================================
// FUNCIONES DE RESULTADO FINAL
// ============================================================

/*
 * Muestra la pantalla de resultado final del cuestionario
 * - Calcula el porcentaje de puntuación obtenido
 * - Determina la categoría del usuario (Eco-Héroe, Medio, Contaminante)
 * - Muestra el mensaje personalizado y el desglose por categorías
 */
function mostrarResultado() {
    const quizContainer = document.getElementById('quiz-container');
    const resultadoFinal = document.getElementById('resultado-final');

    // Ocultar cuestionario y mostrar pantalla de resultado
    quizContainer.classList.add('hidden');
    resultadoFinal.classList.remove('hidden');

    // Calcular puntuación final como porcentaje
    // Máximo posible: número de preguntas × 20 puntos
    const puntosMaximos = preguntas.length * 20;
    const porcentaje = Math.round((puntuacionTotal / puntosMaximos) * 100);

    // Determinar categoría de resultado según el porcentaje
    let categoriaScore;
    switch (true) {
        case (porcentaje >= 80):
            categoriaScore = 'ECO_HERO';
            break;
        case (porcentaje >= 50):
            categoriaScore = 'MEDIO';
            break;
        default:
            categoriaScore = 'CONTAMINANTE';
    }

    // Obtener configuración del resultado y actualizar elementos de la UI con los datos del resultado
    const config = resultadosConfig[categoriaScore];

    document.getElementById('resultado-icono').textContent = config.icono;
    document.getElementById('porcentaje-texto').textContent = porcentaje + '%';
    document.getElementById('mensaje-categoria').textContent = config.titulo;
    document.getElementById('mensaje-categoria').style.color = config.color;
    document.getElementById('mensaje-final').textContent = config.mensaje;

    // Animar el círculo de progreso circular
    animarCircularProgress(porcentaje, puntosMaximos);

    // Renderizar el desglose detallado por categoría
    renderizarDesglose();

    // Scroll suave hacia el resultado (mejor UX)
    setTimeout(() => {
        resultadoFinal.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

/*
 * Anima el círculo de progreso SVG del resultado final
 * Usa stroke-dasharray y stroke-dashoffset para crear efecto de carga
 * 
 * Técnica: El círculo SVG se dibuja progresivamente mediante la manipulación
 * de las propiedades de trazo (dash). El porcentaje determina cuánto se dibuja.
 */
function animarCircularProgress(porcentaje, puntosMaximos) {
    const circle = document.getElementById('progress-ring');
    const radius = circle.r.baseVal.value; // Radio del círculo
    const circumference = radius * 2 * Math.PI; // Circunferencia total

    // Crear gradiente SVG dinámico si no existe
    if (!document.getElementById('progressGradient')) {
        const svg = circle.closest('svg');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.id = 'progressGradient';
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');

        // Dos colores para el gradiente (verde claro a verde oscuro)
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#10b981');

        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#059669');

        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);
    }

    // Configurar el círculo para la animación
    circle.style.strokeDasharray = circumference; // Longitud total del trazo
    circle.style.strokeDashoffset = circumference; // Iniciar completamente oculto

    // Forzar reflow del navegador (necesario para que la transición funcione)
    circle.offsetHeight;

    // Calcular el offset final basado en el porcentaje
    // A mayor porcentaje, menor offset (más círculo visible)
    const offset = circumference - (porcentaje / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

/*
 * Renderiza el desglose de puntuación por cada categoría
 * Muestra visualmente cuántos puntos obtuvo el usuario en cada área
*/
function renderizarDesglose() {
    const contenedor = document.getElementById('desglose-container');
    contenedor.innerHTML = ''; // Limpiar contenido previo

    // Crear un elemento de desglose por cada pregunta/categoría
    preguntas.forEach((pregunta, index) => {
        // Obtener puntos de esta categoría
        const puntos = puntuacionPorCategoria[pregunta.categoria];
        // Obtener puntos máximos (última opción tiene siempre el máximo)
        const puntosPregunta = pregunta.opciones[pregunta.opciones.length - 1].puntos;

        // Crear elemento visual del desglose
        const item = document.createElement('div');
        item.className = `desglose-item ${categoriasConfig[pregunta.categoria].clase}`;
        item.style.animationDelay = `${index * 0.1}s`; // Animación escalonada

        // Nombre de la categoría con icono
        const nombre = document.createElement('span');
        nombre.className = 'desglose-nombre';
        nombre.textContent = `${categoriasConfig[pregunta.categoria].icono} ${pregunta.categoria}`;

        // Puntuación obtenida / puntuación máxima
        const puntosSpan = document.createElement('span');
        puntosSpan.className = 'desglose-puntos-valor';
        puntosSpan.textContent = `${puntos}/${puntosPregunta}`;

        // Ensamblar y añadir al contenedor
        item.appendChild(nombre);
        item.appendChild(puntosSpan);
        contenedor.appendChild(item);
    });
}

// ============================================================
// ESTILOS CSS DINÁMICOS
// ============================================================

/**
 * Inyecta estilos CSS adicionales necesarios para las animaciones
 * Se hace dinámicamente porque algunos efectos no están en el CSS principal
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
        }
    }
`;
document.head.appendChild(style);

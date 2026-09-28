const units = [
  { title: 'Introducción al Control de la Gestión Pública', file: '01-introduccion-control-gestion-publica.md' },
  { title: 'Generalidades del SCI', file: '02-generalidades-sci.md' },
  { title: 'Enfoque Basado en Procesos', file: '03-enfoque-basado-procesos.md' },
  { title: 'Caracterización de Procesos', file: '04-caracterizacion-procesos.md' },
  { title: 'Enfoque Basado en Riesgos', file: '05-enfoque-basado-riesgos.md' },
  { title: 'Glosario de Términos', file: '06-glosario.md' },
  { title: 'Preguntas de Repaso', file: '07-preguntas-repaso.md' },
  { title: 'Recursos Adicionales', file: '08-recursos-adicionales.md' },
];

const questions = [
  {
    prompt: '¿Qué significa la sigla SCI en esta guía?',
    options: ['Sistema de Control Interno', 'Servicio de Calidad Institucional', 'Sistema de Compras Integradas'],
    answer: 0,
  },
  {
    prompt: '¿Qué enfoques propone aplicar la guía?',
    options: ['Enfoque financiero y contable', 'Enfoque basado en procesos y en riesgos', 'Enfoque jurídico y presupuestario'],
    answer: 1,
  },
  {
    prompt: '¿Qué aspectos del MECIP 2015 busca identificar el estudiante?',
    options: ['Componentes, principios y elementos', 'Únicamente formularios administrativos', 'Solo indicadores presupuestarios'],
    answer: 0,
  },
  {
    prompt: '¿Para qué evaluaciones prepara esta guía?',
    options: ['Evaluaciones de desempeño individual', 'Evaluaciones y auditorías de control interno', 'Exámenes de contratación pública'],
    answer: 1,
  },
  {
    prompt: '¿Qué norma de requisitos mínimos sirve de base para la guía?',
    options: ['MECIP 2015', 'ISO 9001:2015', 'Un reglamento municipal'],
    answer: 0,
  },
];

const storageKey = 'mecip-study-state-v1';
const initialState = { completed: [], notes: {} };
let state = readState();
let selectedUnit = 0;
let questionIndex = 0;
let score = 0;
let answerLocked = false;

const unitList = document.querySelector('#unit-list');
const lessonTitle = document.querySelector('#lesson-title');
const lessonLead = document.querySelector('#lesson-lead');
const materialMessage = document.querySelector('#material-message');
const unitFile = document.querySelector('#unit-file');
const unitNumber = document.querySelector('#unit-number');
const lessonStatus = document.querySelector('#lesson-status');
const completeButton = document.querySelector('#complete-button');
const unitNotes = document.querySelector('#unit-notes');
const notesHint = document.querySelector('#notes-hint');
const progressCount = document.querySelector('#progress-count');
const progressFill = document.querySelector('#progress-fill');
const progressTrack = document.querySelector('#progress-track');

function readState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (!stored || typeof stored !== 'object') return { ...initialState };
    return {
      completed: Array.isArray(stored.completed) ? stored.completed.filter((item) => Number.isInteger(item) && item >= 0 && item < units.length) : [],
      notes: stored.notes && typeof stored.notes === 'object' ? stored.notes : {},
    };
  } catch {
    return { ...initialState };
  }
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

function renderUnitList() {
  unitList.replaceChildren();
  units.forEach((unit, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'unit-link';
    button.classList.toggle('is-active', index === selectedUnit);
    button.classList.toggle('is-complete', state.completed.includes(index));
    button.setAttribute('aria-current', index === selectedUnit ? 'true' : 'false');
    button.innerHTML = `<span class="unit-link-number">${String(index + 1).padStart(2, '0')}</span><span class="unit-link-title"></span><span class="unit-link-check" aria-hidden="true">${state.completed.includes(index) ? '✓' : ''}</span>`;
    button.querySelector('.unit-link-title').textContent = unit.title;
    button.addEventListener('click', () => selectUnit(index));
    unitList.append(button);
  });
}

function renderProgress() {
  const completedCount = state.completed.length;
  const percentage = Math.round((completedCount / units.length) * 100);
  progressCount.textContent = `${completedCount} / ${units.length}`;
  progressFill.style.width = `${percentage}%`;
  progressTrack.setAttribute('aria-valuenow', String(completedCount));
}

function renderUnit() {
  const unit = units[selectedUnit];
  const isComplete = state.completed.includes(selectedUnit);
  unitNumber.textContent = `UNIDAD ${String(selectedUnit + 1).padStart(2, '0')}`;
  lessonTitle.textContent = unit.title;
  lessonLead.textContent = 'Estudia esta unidad y registra aquí tus ideas principales.';
  materialMessage.textContent = 'El archivo de estudio detallado aún no se ha agregado al repositorio. Puedes guardar tus apuntes y marcar tu avance mientras se completa el material.';
  unitFile.textContent = unit.file;
  lessonStatus.textContent = isComplete ? 'ESTUDIADA' : 'PENDIENTE';
  lessonStatus.classList.toggle('is-complete', isComplete);
  completeButton.innerHTML = isComplete ? 'Marcar como pendiente <span aria-hidden="true">↶</span>' : 'Marcar como estudiada <span aria-hidden="true">→</span>';
  unitNotes.value = typeof state.notes[selectedUnit] === 'string' ? state.notes[selectedUnit] : '';
  renderUnitList();
  renderProgress();
}

function selectUnit(index) {
  selectedUnit = index;
  renderUnit();
  document.querySelector('#saved-hint').textContent = '';
  notesHint.textContent = 'Se guardan automáticamente en este navegador.';
}

completeButton.addEventListener('click', () => {
  const isComplete = state.completed.includes(selectedUnit);
  state.completed = isComplete
    ? state.completed.filter((index) => index !== selectedUnit)
    : [...state.completed, selectedUnit].sort((left, right) => left - right);
  const saved = saveState();
  renderUnit();
  document.querySelector('#saved-hint').textContent = saved ? 'Avance guardado' : 'No se pudo guardar el avance';
});

unitNotes.addEventListener('input', () => {
  state.notes[selectedUnit] = unitNotes.value;
  const saved = saveState();
  notesHint.textContent = saved ? 'Apunte guardado' : 'No se pudo guardar. Revisa la configuración del navegador.';
});

document.querySelector('#clear-note').addEventListener('click', () => {
  unitNotes.value = '';
  delete state.notes[selectedUnit];
  const saved = saveState();
  notesHint.textContent = saved ? 'Apunte borrado' : 'No se pudo actualizar el almacenamiento.';
  unitNotes.focus();
});

document.querySelectorAll('.view-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const isStudyView = tab.dataset.view === 'study';
    document.querySelector('#study-view').hidden = !isStudyView;
    document.querySelector('#review-view').hidden = isStudyView;
    document.querySelectorAll('.view-tab').forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
  });
});

function renderQuestion() {
  const question = questions[questionIndex];
  const answerList = document.querySelector('#answer-list');
  const feedback = document.querySelector('#quiz-feedback');
  const nextButton = document.querySelector('#quiz-next');
  answerLocked = false;
  document.querySelector('#quiz-count').textContent = `PREGUNTA ${questionIndex + 1} DE ${questions.length}`;
  document.querySelector('#quiz-score').textContent = `${score} ${score === 1 ? 'correcta' : 'correctas'}`;
  document.querySelector('#quiz-progress-fill').style.width = `${(questionIndex / questions.length) * 100}%`;
  document.querySelector('#quiz-question').textContent = question.prompt;
  feedback.hidden = true;
  feedback.textContent = '';
  nextButton.hidden = true;
  nextButton.textContent = questionIndex === questions.length - 1 ? 'Ver resultado' : 'Siguiente pregunta →';
  answerList.replaceChildren();

  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'answer-option';
    button.textContent = option;
    button.addEventListener('click', () => chooseAnswer(index));
    answerList.append(button);
  });
}

function chooseAnswer(selectedAnswer) {
  if (answerLocked) return;
  answerLocked = true;
  const question = questions[questionIndex];
  const options = [...document.querySelectorAll('.answer-option')];
  const isCorrect = selectedAnswer === question.answer;
  if (isCorrect) score += 1;
  options.forEach((option, index) => {
    option.disabled = true;
    if (index === question.answer) option.classList.add('is-correct');
    else if (index === selectedAnswer) option.classList.add('is-wrong');
  });
  const feedback = document.querySelector('#quiz-feedback');
  feedback.textContent = isCorrect ? 'Correcto. Esa idea forma parte de los objetivos de la guía.' : 'No es esa. La opción correcta aparece resaltada.';
  feedback.hidden = false;
  document.querySelector('#quiz-score').textContent = `${score} ${score === 1 ? 'correcta' : 'correctas'}`;
  document.querySelector('#quiz-next').hidden = false;
}

document.querySelector('#quiz-next').addEventListener('click', () => {
  if (questionIndex < questions.length - 1) {
    questionIndex += 1;
    renderQuestion();
    return;
  }
  renderResult();
});

function renderResult() {
  const panel = document.querySelector('#quiz-panel');
  panel.innerHTML = `<div class="quiz-result"><p class="eyebrow">REPASO COMPLETADO</p><strong>${score}/${questions.length}</strong><p>Respuestas correctas</p><button class="primary-button" id="restart-quiz" type="button">Intentar de nuevo <span aria-hidden="true">↻</span></button></div>`;
  document.querySelector('#restart-quiz').addEventListener('click', () => {
    questionIndex = 0;
    score = 0;
    const newPanel = document.createElement('div');
    newPanel.className = 'quiz-panel';
    newPanel.id = 'quiz-panel';
    panel.replaceWith(newPanel);
    newPanel.innerHTML = '<div class="quiz-meta"><span id="quiz-count"></span><span id="quiz-score"></span></div><div class="quiz-progress"><span id="quiz-progress-fill"></span></div><h3 id="quiz-question"></h3><div class="answer-list" id="answer-list"></div><div class="quiz-feedback" id="quiz-feedback" role="status" aria-live="polite" hidden></div><button class="primary-button quiz-next" id="quiz-next" type="button" hidden></button>';
    newPanel.querySelector('#quiz-next').addEventListener('click', () => {
      if (questionIndex < questions.length - 1) {
        questionIndex += 1;
        renderQuestion();
      } else {
        renderResult();
      }
    });
    renderQuestion();
  });
}

renderUnit();
renderQuestion();
// Data structures to hold loaded JSON data
let phasesData = {};
let aptData = {}; // A PAT.json for activities
let problematicsData = {};
let resultsData = {};
let competencesData = {};
let onDonneData = [];

// DOM Elements
const sequenceNameInput = document.getElementById('sequenceName');
const sessionNameInput = document.getElementById('sessionName');
const sessionTypeCheckboxes = document.querySelectorAll('input[name="sessionType"]');

const phaseSelect = document.getElementById('phaseSelect');
const activitySelect = document.getElementById('activitySelect');
const taskSelect = document.getElementById('taskSelect');
const problematicSelect = document.getElementById('problematicSelect');
const expectedResultTextarea = document.getElementById('expectedResult');

const competenceSelect = document.getElementById('competenceSelect');
const etreCapableList = document.getElementById('etreCapableList');
const conditionsRessourcesList = document.getElementById('conditionsRessourcesList');
const criteresEvaluationList = document.getElementById('criteresEvaluationList');
const onDonneList = document.getElementById('onDonneList');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pdfProfBtn = document.getElementById('pdfProfBtn');
const pdfEleveBtn = document.getElementById('pdfEleveBtn');
const newSessionBtn = document.getElementById('newSessionBtn');
const sessionPreview = document.getElementById('sessionPreview');

let currentPage = 1;
const totalPages = 4;

// --- Data Loading Functions ---
async function loadJSON(filename) {
    try {
        const response = await fetch(`./data/${filename}`); // Assuming a 'data' folder
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Could not load ${filename}:`, error);
        return null;
    }
}

async function loadAllData() {
    // Load A Phases.json for detailed phase/activity/task structure
    phasesData = await loadJSON('A Phases.json');

    // Load A PAT.json for phase-activity direct mapping
    aptData = await loadJSON('A PAT.json');

    // Load A2 PBTIQ.json for problematics by activity
    problematicsData = await loadJSON('A2 PBTIQ.json');

    // Load A1 RA.json for expected results by task
    resultsData = await loadJSON('A1 RA.json');

    // Load B TP.json for competences by task
    competencesData.competencesParTache = (await loadJSON('B TP.json')).competencesParTache;

    // Load D Comp_etrCap_Ress_Eval.json for detailed competence info
    competencesData.competenceDetails = (await loadJSON('D Comp_etrCap_Ress_Eval.json')).competenceDetails;

    // Load C On_donne.json for "on donne" resources
    onDonneData = (await loadJSON('C On_donne.json')).ressourcesOnDonne;

    populatePhases();
    populateOnDonne();
    updateNavigationButtons();
}

// --- Population Functions ---
function populatePhases() {
    phaseSelect.innerHTML = '<option value="">-- Sélectionner une Phase --</option>';
    if (phasesData && phasesData.phases) {
        phasesData.phases.forEach(phase => {
            const option = document.createElement('option');
            option.value = phase.nom;
            option.textContent = phase.nom;
            phaseSelect.appendChild(option);
        });
    }
}

function populateActivities(selectedPhase) {
    activitySelect.innerHTML = '<option value="">-- Sélectionner une Activité --</option>';
    activitySelect.disabled = true;
    taskSelect.innerHTML = '<option value="">-- Sélectionner une Tâche --</option>';
    taskSelect.disabled = true;
    problematicsData.innerHTML = '<option value="">-- Sélectionner une Problématique --</option>';
    problematicsData.disabled = true;
    expectedResultTextarea.value = '';

    const selectedPhaseObject = phasesData.phases.find(p => p.nom === selectedPhase);
    if (selectedPhaseObject && selectedPhaseObject.activites) {
        selectedPhaseObject.activites.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.nom;
            option.textContent = activity.nom;
            activitySelect.appendChild(option);
        });
        activitySelect.disabled = false;
    }
}

function populateTasks(selectedActivity) {
    taskSelect.innerHTML = '<option value="">-- Sélectionner une Tâche --</option>';
    taskSelect.disabled = true;
    problematicsData.innerHTML = '<option value="">-- Sélectionner une Problématique --</option>';
    problematicsData.disabled = true;
    expectedResultTextarea.value = '';

    // Find the tasks related to the selected activity across all phases
    let tasks = [];
    phasesData.phases.forEach(phase => {
        const activityInPhase = phase.activites.find(act => act.nom === selectedActivity);
        if (activityInPhase && activityInPhase.taches) {
            tasks = activityInPhase.taches;
        }
    });

    if (tasks.length > 0) {
        tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task;
            option.textContent = task;
            taskSelect.appendChild(option);
        });
        taskSelect.disabled = false;
    }
    populateProblematic(selectedActivity);
}

function populateProblematic(selectedActivity) {
    problematicsData.innerHTML = '<option value="">-- Sélectionner une Problématique --</option>';
    problematicsData.disabled = true;

    const problematics = problematicsData.problematiquesParActivite[selectedActivity];
    if (problematics) {
        problematics.forEach(pb => {
            const option = document.createElement('option');
            option.value = pb;
            option.textContent = pb;
            problematicsData.appendChild(option);
        });
        problematicsData.disabled = false;
    }
}

function displayExpectedResult(selectedTask) {
    expectedResultTextarea.value = resultsData.resultatsAttendusParTache[selectedTask] || "Aucun résultat attendu pour cette tâche.";
}

function populateCompetences(selectedTask) {
    competenceSelect.innerHTML = '<option value="">-- Sélectionner une Compétence --</option>';
    competenceSelect.disabled = true;
    clearCompetenceDetails();

    const competencesForTask = competencesData.competencesParTache[selectedTask];
    if (competencesForTask) {
        competencesForTask.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp;
            option.textContent = comp;
            competenceSelect.appendChild(option);
        });
        competenceSelect.disabled = false;
    }
}

function populateCompetenceDetails(selectedCompetence) {
    clearCompetenceDetails();
    const details = competencesData.competenceDetails[selectedCompetence];

    if (details) {
        // Être capable de
        if (details.etreCapable) {
            details.etreCapable.split('. ').filter(s => s.trim() !== '').forEach((item, index) => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${item.trim()}">${item.trim()}${index < details.etreCapable.split('. ').filter(s => s.trim() !== '').length - 1 ? '.' : ''}`;
                etreCapableList.appendChild(label);
            });
        }
        // Conditions/Ressources
        if (details.conditionsRessources) {
            details.conditionsRessources.split('. ').filter(s => s.trim() !== '').forEach((item, index) => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${item.trim()}">${item.trim()}${index < details.conditionsRessources.split('. ').filter(s => s.trim() !== '').length - 1 ? '.' : ''}`;
                conditionsRessourcesList.appendChild(label);
            });
        }
        // Critères d'Évaluation
        if (details.criteresEvaluation) {
            details.criteresEvaluation.split('. ').filter(s => s.trim() !== '').forEach((item, index) => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${item.trim()}">${item.trim()}${index < details.criteresEvaluation.split('. ').filter(s => s.trim() !== '').length - 1 ? '.' : ''}`;
                criteresEvaluationList.appendChild(label);
            });
        }
    }
}

function clearCompetenceDetails() {
    etreCapableList.innerHTML = '';
    conditionsRessourcesList.innerHTML = '';
    criteresEvaluationList.innerHTML = '';
}

function populateOnDonne() {
    onDonneList.innerHTML = '';
    if (onDonneData) {
        onDonneData.forEach(resource => {
            const label = document.createElement('label');
            label.innerHTML = `<input type="checkbox" value="${resource}">${resource}`;
            onDonneList.appendChild(label);
        });
    }
}

// --- Navigation Logic ---
function showPage(pageNumber) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active-page');
    });
    document.getElementById(`page${pageNumber}`).classList.add('active-page');
    currentPage = pageNumber;
    updateNavigationButtons();
    updatePreview(); // Update preview on each page change
}

function updateNavigationButtons() {
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    // Enable/disable PDF buttons only on the last page
    const enablePdfButtons = currentPage === totalPages && problematicSelect.value !== '';
    pdfProfBtn.disabled = !enablePdfButtons;
    pdfEleveBtn.disabled = !enablePdfButtons;
}

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        showPage(currentPage - 1);
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        showPage(currentPage + 1);
    }
});

// --- Event Listeners for Dynamic Content ---
phaseSelect.addEventListener('change', (event) => {
    populateActivities(event.target.value);
});

activitySelect.addEventListener('change', (event) => {
    populateTasks(event.target.value);
});

taskSelect.addEventListener('change', (event) => {
    displayExpectedResult(event.target.value);
    populateCompetences(event.target.value);
});

problematicsData.addEventListener('change', () => {
    updatePdfButtonStates(); // Enable PDF buttons if problematic is selected
});

competenceSelect.addEventListener('change', (event) => {
    populateCompetenceDetails(event.target.value);
});

sessionTypeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
        // Ensure only one checkbox can be selected for session type
        if (event.target.checked) {
            sessionTypeCheckboxes.forEach(cb => {
                if (cb !== event.target) {
                    cb.checked = false;
                }
            });
        }
        updatePreview();
    });
});

// Update preview whenever an input changes
document.querySelectorAll('input[type="text"], select, textarea, input[type="checkbox"]').forEach(element => {
    element.addEventListener('change', updatePreview);
    element.addEventListener('input', updatePreview); // For text inputs
});


// --- PDF Generation (using jsPDF) ---
function generatePdf(forProfessor) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const sequenceName = sequenceNameInput.value || 'Non spécifié';
    const sessionName = sessionNameInput.value || 'Non spécifié';
    const sessionType = Array.from(sessionTypeCheckboxes).find(cb => cb.checked)?.value || 'Non spécifié';
    const phase = phaseSelect.value || 'Non spécifié';
    const activity = activitySelect.value || 'Non spécifié';
    const task = taskSelect.value || 'Non spécifié';
    const problematic = problematicSelect.value || 'Non spécifié';
    const expectedResult = expectedResultTextarea.value || 'Non spécifié';

    // Collect selected "On donne"
    const selectedOnDonne = Array.from(onDonneList.querySelectorAll('input[type="checkbox"]:checked'))
                                .map(cb => cb.value);

    // Collect selected "Être capable de"
    const selectedEtreCapable = Array.from(etreCapableList.querySelectorAll('input[type="checkbox"]:checked'))
                                    .map(cb => cb.value);

    // Collect selected "Conditions/Ressources"
    const selectedConditionsRessources = Array.from(conditionsRessourcesList.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(cb => cb.value);

    // Collect selected "Critères d'Évaluation"
    const selectedCriteresEvaluation = Array.from(criteresEvaluationList.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(cb => cb.value);

    let yPos = 20;
    const margin = 15;
    const lineHeight = 7;

    // Title of the PDF (Problématique)
    doc.setFontSize(16);
    doc.text(`Fiche de Séance: ${problematic}`, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    yPos += 15;

    doc.setFontSize(12);
    doc.text(`Nom de la Séquence: ${sequenceName}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Nom de la Séance: ${sessionName}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Type de Séance: ${sessionType}`, margin, yPos);
    yPos += lineHeight * 2;

    doc.setFontSize(14);
    doc.text('Détails de la Séance:', margin, yPos);
    yPos += lineHeight;

    doc.setFontSize(12);
    doc.text(`Phase: ${phase}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Activité: ${activity}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Tâche Professionnelle: ${task}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Problématique: ${problematic}`, margin, yPos);
    yPos += lineHeight;

    // Section "On donne" for both versions
    doc.setFontSize(12);
    doc.text('Ressources ("On donne"):', margin, yPos);
    yPos += lineHeight;
    if (selectedOnDonne.length > 0) {
        selectedOnDonne.forEach(resource => {
            if (yPos + lineHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(`  • ${resource}`, margin + 5, yPos);
            yPos += lineHeight;
        });
    } else {
        doc.text(`  • Aucune ressource sélectionnée.`, margin + 5, yPos);
        yPos += lineHeight;
    }
    yPos += lineHeight; // Add some space

    // Expected Result (after "On donne" for student version)
    doc.setFontSize(12);
    doc.text('Résultat Attendu:', margin, yPos);
    yPos += lineHeight;
    doc.text(expectedResult, margin, yPos, { maxWidth: doc.internal.pageSize.getWidth() - 2 * margin });
    yPos += doc.getTextDimensions(expectedResult, { maxWidth: doc.internal.pageSize.getWidth() - 2 * margin }).h + lineHeight;

    if (forProfessor) {
        doc.setFontSize(14);
        doc.text('Compétences Visées:', margin, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        doc.text(competenceSelect.value || 'Non spécifié', margin, yPos);
        yPos += lineHeight * 2;

        doc.setFontSize(12);
        doc.text('Être capable de:', margin, yPos);
        yPos += lineHeight;
        if (selectedEtreCapable.length > 0) {
            selectedEtreCapable.forEach(item => {
                if (yPos + lineHeight > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(`  • ${item}`, margin + 5, yPos);
                yPos += lineHeight;
            });
        } else {
            doc.text(`  • Non spécifié`, margin + 5, yPos);
            yPos += lineHeight;
        }
        yPos += lineHeight;

        doc.setFontSize(12);
        doc.text('Conditions/Ressources (Prof):', margin, yPos);
        yPos += lineHeight;
        if (selectedConditionsRessources.length > 0) {
            selectedConditionsRessources.forEach(item => {
                if (yPos + lineHeight > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(`  • ${item}`, margin + 5, yPos);
                yPos += lineHeight;
            });
        } else {
            doc.text(`  • Non spécifié`, margin + 5, yPos);
            yPos += lineHeight;
        }
        yPos += lineHeight;

        doc.setFontSize(12);
        doc.text('Critères d\'Évaluation (Prof):', margin, yPos);
        yPos += lineHeight;
        if (selectedCriteresEvaluation.length > 0) {
            selectedCriteresEvaluation.forEach(item => {
                if (yPos + lineHeight > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(`  • ${item}`, margin + 5, yPos);
                yPos += lineHeight;
            });
        } else {
            doc.text(`  • Non spécifié`, margin + 5, yPos);
            yPos += lineHeight;
        }
    }

    doc.save(`${problematic}_${forProfessor ? 'Prof' : 'Eleve'}.pdf`);
}

pdfProfBtn.addEventListener('click', () => generatePdf(true));
pdfEleveBtn.addEventListener('click', () => generatePdf(false));

// --- New Session / Reset Functionality ---
newSessionBtn.addEventListener('click', () => {
    if (confirm("Voulez-vous créer une nouvelle fiche de séance et réinitialiser tous les champs ?")) {
        // Reset header inputs
        sequenceNameInput.value = '';
        sessionNameInput.value = '';
        sessionTypeCheckboxes.forEach(cb => cb.checked = false);

        // Reset all selects to default and disable them
        phaseSelect.value = '';
        populateActivities(''); // Clears and disables activity/task/problematic selects
        activitySelect.disabled = true;
        taskSelect.disabled = true;
        problematicsData.disabled = true;
        expectedResultTextarea.value = '';

        competenceSelect.value = '';
        competenceSelect.disabled = true;
        clearCompetenceDetails(); // Clear "Être capable de", Conditions/Ressources, Critères d'Évaluation
        
        // Uncheck all "On donne" checkboxes
        onDonneList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        // Go back to the first page
        showPage(1);
    }
});

// --- Live Preview Functionality ---
function updatePreview() {
    const sequenceName = sequenceNameInput.value || 'Non spécifié';
    const sessionName = sessionNameInput.value || 'Non spécifié';
    const sessionType = Array.from(sessionTypeCheckboxes).find(cb => cb.checked)?.value || 'Non spécifié';
    const phase = phaseSelect.value || 'Non spécifié';
    const activity = activitySelect.value || 'Non spécifié';
    const task = taskSelect.value || 'Non spécifié';
    const problematic = problematicSelect.value || 'Non spécifié';
    const expectedResult = expectedResultTextarea.value || 'Non spécifié';

    const selectedOnDonne = Array.from(onDonneList.querySelectorAll('input[type="checkbox"]:checked'))
                                .map(cb => cb.value);

    const selectedEtreCapable = Array.from(etreCapableList.querySelectorAll('input[type="checkbox"]:checked'))
                                    .map(cb => cb.value);
    const selectedConditionsRessources = Array.from(conditionsRessourcesList.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(cb => cb.value);
    const selectedCriteresEvaluation = Array.from(criteresEvaluationList.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(cb => cb.value);

    let previewHtml = `
        <p><strong>Nom de la Séquence:</strong> ${sequenceName}</p>
        <p><strong>Nom de la Séance:</strong> ${sessionName}</p>
        <p><strong>Type de Séance:</strong> ${sessionType}</p>
        <hr>
        <p><strong>Phase:</strong> ${phase}</p>
        <p><strong>Activité:</strong> ${activity}</p>
        <p><strong>Tâche Professionnelle:</strong> ${task}</p>
        <p><strong>Problématique:</strong> ${problematic}</p>
        <p><strong>Résultat Attendu:</strong> ${expectedResult}</p>
        <hr>
        <p><strong>Ressources ("On donne"):</strong></p>
        <ul>
            ${selectedOnDonne.length > 0 ? selectedOnDonne.map(item => `<li>${item}</li>`).join('') : '<li>Aucune ressource sélectionnée.</li>'}
        </ul>
        <hr>
        <p><strong>Compétence Visée:</strong> ${competenceSelect.value || 'Non spécifié'}</p>
        <p><strong>Être capable de:</strong></p>
        <ul>
            ${selectedEtreCapable.length > 0 ? selectedEtreCapable.map(item => `<li>${item}</li>`).join('') : '<li>Non spécifié</li>'}
        </ul>
        <p><strong>Conditions/Ressources (Prof):</strong></p>
        <ul>
            ${selectedConditionsRessources.length > 0 ? selectedConditionsRessources.map(item => `<li>${item}</li>`).join('') : '<li>Non spécifié</li>'}
        </ul>
        <p><strong>Critères d'Évaluation (Prof):</strong></p>
        <ul>
            ${selectedCriteresEvaluation.length > 0 ? selectedCriteresEvaluation.map(item => `<li>${item}</li>`).join('') : '<li>Non spécifié</li>'}
        </ul>
    `;
    sessionPreview.innerHTML = previewHtml;
}

function updatePdfButtonStates() {
    const isProblematicSelected = problematicSelect.value !== '';
    if (currentPage === totalPages) {
        pdfProfBtn.disabled = !isProblematicSelected;
        pdfEleveBtn.disabled = !isProblematicSelected;
    } else {
        pdfProfBtn.disabled = true;
        pdfEleveBtn.disabled = true;
    }
}


// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    showPage(1); // Start on the first page
});
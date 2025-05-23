// Data structures to hold loaded JSON data
let phasesData = {}; // From A Phases.json
let aptData = {};    // From A PAT.json (not directly used for cascading, but good to have)
let problematicsData = {}; // From A2 PBTIQ.json
let resultsData = {};      // From A1 RA.json
let competencesData = {
    competencesParTache: {}, // From B TP.json
    competenceDetails: {}    // From D Comp_etrCap_Ress_Eval.json
};
let onDonneData = [];       // From C On_donne.json

// DOM Elements - Using const for elements that won't change
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
const totalPages = 4; // Total number of pages

// --- Data Loading Functions ---
async function loadJSON(filename) {
    try {
        const response = await fetch(`./data/${filename}`);
        if (!response.ok) {
            console.error(`Erreur HTTP: ${response.status} pour le fichier ${filename}`);
            throw new Error(`Erreur de chargement du fichier: ${filename}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Impossible de charger ${filename}:`, error);
        // Optionally display an error message to the user
        alert(`Erreur: Impossible de charger les données pour ${filename}. Veuillez vérifier la console pour plus de détails.`);
        return null;
    }
}

async function loadAllData() {
    // Load all JSON files concurrently
    const [
        loadedPhasesData,
        loadedAptData,
        loadedProblematicsData,
        loadedResultsData,
        loadedBtpData,
        loadedOnDonneData,
        loadedCompDetailsData
    ] = await Promise.all([
        loadJSON('A Phases.json'),
        loadJSON('A PAT.json'),
        loadJSON('A2 PBTIQ.json'),
        loadJSON('A1 RA.json'),
        loadJSON('B TP.json'),
        loadJSON('C On_donne.json'),
        loadJSON('D Comp_etrCap_Ress_Eval.json')
    ]);

    phasesData = loadedPhasesData || {};
    aptData = loadedAptData || {};
    problematicsData = loadedProblematicsData || {};
    resultsData = loadedResultsData || {};
    competencesData.competencesParTache = (loadedBtpData && loadedBtpData.competencesParTache) || {};
    onDonneData = (loadedOnDonneData && loadedOnDonneData.ressourcesOnDonne) || [];
    competencesData.competenceDetails = (loadedCompDetailsData && loadedCompDetailsData.competenceDetails) || {};

    // Initial population of the first dropdown and "on donne"
    populatePhases();
    populateOnDonne();
    updateNavigationButtons(); // Ensure button states are correct on load
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
    // No need to call populateActivities here, it's triggered by phaseSelect change event
}

function populateActivities(selectedPhase) {
    activitySelect.innerHTML = '<option value="">-- Sélectionner une Activité --</option>';
    activitySelect.disabled = true;
    taskSelect.innerHTML = '<option value="">-- Sélectionner une Tâche --</option>';
    taskSelect.disabled = true;
    problematicSelect.innerHTML = '<option value="">-- Sélectionner une Problématique --</option>';
    problematicSelect.disabled = true;
    expectedResultTextarea.value = '';

    const selectedPhaseObject = phasesData.phases.find(p => p.nom === selectedPhase);
    if (selectedPhaseObject && selectedPhaseObject.activites && selectedPhaseObject.activites.length > 0) {
        selectedPhaseObject.activites.forEach(activity => {
            const option = document.createElement('option');
            option.value = activity.nom;
            option.textContent = activity.nom;
            activitySelect.appendChild(option);
        });
        activitySelect.disabled = false;
    }
    // No need to call populateTasks here, it's triggered by activitySelect change event
}

function populateTasks(selectedActivity) {
    taskSelect.innerHTML = '<option value="">-- Sélectionner une Tâche --</option>';
    taskSelect.disabled = true;
    problematicSelect.innerHTML = '<option value="">-- Sélectionner une Problématique --</option>';
    problematicSelect.disabled = true; // Ensure problematic is reset and disabled
    expectedResultTextarea.value = ''; // Ensure expected result is reset

    let tasks = [];
    // Find the tasks related to the selected activity across all phases
    if (phasesData && phasesData.phases) {
        for (const phase of phasesData.phases) {
            const activityInPhase = phase.activites.find(act => act.nom === selectedActivity);
            if (activityInPhase && activityInPhase.taches) {
                tasks = activityInPhase.taches;
                break; // Found tasks for this activity, no need to continue searching
            }
        }
    }

    if (tasks.length > 0) {
        tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task;
            option.textContent = task;
            taskSelect.appendChild(option);
        });
        taskSelect.disabled = false;
    }
    // Populate problematics directly from the selected activity, as per A2 PBTIQ.json
    populateProblematic(selectedActivity);
    // No need to call populateCompetences here, it's triggered by taskSelect change event
}

function populateProblematic(selectedActivity) {
    problematicSelect.innerHTML = '<option value="">-- Sélectionner une Problématique --</option>';
    problematicSelect.disabled = true;

    const problematics = problematicsData.problematiquesParActivite && problematicsData.problematiquesParActivite[selectedActivity];
    if (problematics && problematics.length > 0) {
        problematics.forEach(pb => {
            const option = document.createElement('option');
            option.value = pb;
            option.textContent = pb;
            problematicSelect.appendChild(option);
        });
        problematicSelect.disabled = false;
    }
}

function displayExpectedResult(selectedTask) {
    expectedResultTextarea.value = resultsData.resultatsAttendusParTache && resultsData.resultatsAttendusParTache[selectedTask] || "Aucun résultat attendu pour cette tâche.";
}

function populateCompetences(selectedTask) {
    competenceSelect.innerHTML = '<option value="">-- Sélectionner une Compétence --</option>';
    competenceSelect.disabled = true;
    clearCompetenceDetails(); // Clear previous details

    const competencesForTask = competencesData.competencesParTache && competencesData.competencesParTache[selectedTask];
    if (competencesForTask && competencesForTask.length > 0) {
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
    const details = competencesData.competenceDetails && competencesData.competenceDetails[selectedCompetence];

    if (details) {
        // Être capable de
        if (details.etreCapable) {
            // Split by ". " but also ensure each item is a complete sentence/phrase
            details.etreCapable.split(/(?<=\.)\s*/).filter(s => s.trim() !== '').forEach(item => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${item.trim()}">${item.trim()}`;
                etreCapableList.appendChild(label);
            });
        }
        // Conditions/Ressources
        if (details.conditionsRessources) {
            details.conditionsRessources.split(/(?<=\.)\s*/).filter(s => s.trim() !== '').forEach(item => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${item.trim()}">${item.trim()}`;
                conditionsRessourcesList.appendChild(label);
            });
        }
        // Critères d'Évaluation
        if (details.criteresEvaluation) {
            details.criteresEvaluation.split(/(?<=\.)\s*/).filter(s => s.trim() !== '').forEach(item => {
                const label = document.createElement('label');
                label.innerHTML = `<input type="checkbox" value="${item.trim()}">${item.trim()}`;
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
    if (onDonneData && onDonneData.length > 0) {
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

    // PDF buttons are only enabled on the last page AND if a problematic is selected
    updatePdfButtonStates();
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
    updatePreview();
});

activitySelect.addEventListener('change', (event) => {
    populateTasks(event.target.value);
    updatePreview();
});

taskSelect.addEventListener('change', (event) => {
    displayExpectedResult(event.target.value);
    populateCompetences(event.target.value);
    updatePreview();
});

problematicSelect.addEventListener('change', () => {
    updatePdfButtonStates(); // Re-evaluate PDF button state
    updatePreview();
});

competenceSelect.addEventListener('change', (event) => {
    populateCompetenceDetails(event.target.value);
    updatePreview();
});

// Ensure only one session type checkbox is selected
sessionTypeCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (event) => {
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

// Update preview whenever main input fields change
sequenceNameInput.addEventListener('input', updatePreview);
sessionNameInput.addEventListener('input', updatePreview);
// Add listeners for dynamic checkbox lists after they are populated
// (Event delegation is generally better for dynamic content, but for simplicity here,
// we'll rely on updatePreview being called after changes to these lists)
etreCapableList.addEventListener('change', updatePreview);
conditionsRessourcesList.addEventListener('change', updatePreview);
criteresEvaluationList.addEventListener('change', updatePreview);
onDonneList.addEventListener('change', updatePreview);


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
    const pageWidth = doc.internal.pageSize.getWidth();

    // Set font for Unicode characters (important for accents) - optional, but improves compatibility
    // doc.addFont("helvetica", "normal", "windows-1250"); // Example, may need a font file for full support
    // doc.setFont("helvetica", "normal");


    // Title of the PDF (Problématique)
    doc.setFontSize(16);
    doc.text(`Fiche de Séance: ${problematic}`, pageWidth / 2, yPos, { align: 'center' });
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

    // Expected Result (after "On donne" for student version, and just after Problematic for prof)
    doc.setFontSize(12);
    doc.text('Résultat Attendu:', margin, yPos);
    yPos += lineHeight;
    // Use text with auto-split for long texts
    const splitExpectedResult = doc.splitTextToSize(expectedResult, pageWidth - 2 * margin);
    doc.text(splitExpectedResult, margin, yPos);
    yPos += (splitExpectedResult.length * lineHeight) + lineHeight;


    // Section "On donne" for both versions
    doc.setFontSize(12);
    doc.text('Ressources ("On donne"):', margin, yPos);
    yPos += lineHeight;
    if (selectedOnDonne.length > 0) {
        selectedOnDonne.forEach(resource => {
            const splitResource = doc.splitTextToSize(`  • ${resource}`, pageWidth - 2 * margin - 5); // Indent for bullet
            if (yPos + (splitResource.length * lineHeight) > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(splitResource, margin + 5, yPos);
            yPos += (splitResource.length * lineHeight);
        });
    } else {
        if (yPos + lineHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPos = margin;
        }
        doc.text(`  • Aucune ressource sélectionnée.`, margin + 5, yPos);
        yPos += lineHeight;
    }
    yPos += lineHeight; // Add some space

    if (forProfessor) {
        if (yPos + lineHeight * 3 > doc.internal.pageSize.getHeight() - margin) { // Check space for next section header
            doc.addPage();
            yPos = margin;
        }
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
                const splitItem = doc.splitTextToSize(`  • ${item}`, pageWidth - 2 * margin - 5);
                if (yPos + (splitItem.length * lineHeight) > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(splitItem, margin + 5, yPos);
                yPos += (splitItem.length * lineHeight);
            });
        } else {
            if (yPos + lineHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(`  • Non spécifié`, margin + 5, yPos);
            yPos += lineHeight;
        }
        yPos += lineHeight;

        doc.setFontSize(12);
        doc.text('Conditions/Ressources (Prof):', margin, yPos);
        yPos += lineHeight;
        if (selectedConditionsRessources.length > 0) {
            selectedConditionsRessources.forEach(item => {
                const splitItem = doc.splitTextToSize(`  • ${item}`, pageWidth - 2 * margin - 5);
                if (yPos + (splitItem.length * lineHeight) > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(splitItem, margin + 5, yPos);
                yPos += (splitItem.length * lineHeight);
            });
        } else {
            if (yPos + lineHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(`  • Non spécifié`, margin + 5, yPos);
            yPos += lineHeight;
        }
        yPos += lineHeight;

        doc.setFontSize(12);
        doc.text('Critères d\'Évaluation (Prof):', margin, yPos);
        yPos += lineHeight;
        if (selectedCriteresEvaluation.length > 0) {
            selectedCriteresEvaluation.forEach(item => {
                const splitItem = doc.splitTextToSize(`  • ${item}`, pageWidth - 2 * margin - 5);
                if (yPos + (splitItem.length * lineHeight) > doc.internal.pageSize.getHeight() - margin) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(splitItem, margin + 5, yPos);
                yPos += (splitItem.length * lineHeight);
            });
        } else {
            if (yPos + lineHeight > doc.internal.pageSize.getHeight() - margin) {
                doc.addPage();
                yPos = margin;
            }
            doc.text(`  • Non spécifié`, margin + 5, yPos);
            yPos += lineHeight;
        }
    }

    doc.save(`${problematic.replace(/[^a-zA-Z0-9_-]/g, '')}_${forProfessor ? 'Prof' : 'Eleve'}.pdf`);
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

        // Reset and disable all main selects
        phaseSelect.value = '';
        populateActivities(''); // This will reset activity, task, problematic selects as well
        activitySelect.disabled = true;
        taskSelect.disabled = true;
        problematicSelect.disabled = true;
        expectedResultTextarea.value = '';

        competenceSelect.value = '';
        competenceSelect.disabled = true;
        clearCompetenceDetails(); // Clear "Être capable de", Conditions/Ressources, Critères d'Évaluation
        
        // Uncheck all "On donne" checkboxes
        onDonneList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

        // Go back to the first page and update preview
        showPage(1);
        updatePreview();
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
        <h3>Informations Générales</h3>
        <p><strong>Nom de la Séquence:</strong> ${escapeHtml(sequenceName)}</p>
        <p><strong>Nom de la Séance:</strong> ${escapeHtml(sessionName)}</p>
        <p><strong>Type de Séance:</strong> ${escapeHtml(sessionType)}</p>
        <hr>
        <h3>Détails de la Séance</h3>
        <p><strong>Phase:</strong> ${escapeHtml(phase)}</p>
        <p><strong>Activité:</strong> ${escapeHtml(activity)}</p>
        <p><strong>Tâche Professionnelle:</strong> ${escapeHtml(task)}</p>
        <p><strong>Problématique:</strong> ${escapeHtml(problematic)}</p>
        <p><strong>Résultat Attendu:</strong> ${escapeHtml(expectedResult)}</p>
        <hr>
        <h3>Ressources et Compétences</h3>
        <p><strong>Ressources ("On donne"):</strong></p>
        <ul>
            ${selectedOnDonne.length > 0 ? selectedOnDonne.map(item => `<li>${escapeHtml(item)}</li>`).join('') : '<li>Aucune ressource sélectionnée.</li>'}
        </ul>
        <p><strong>Compétence Visée:</strong> ${escapeHtml(competenceSelect.value || 'Non spécifié')}</p>
        <p><strong>Être capable de:</strong></p>
        <ul>
            ${selectedEtreCapable.length > 0 ? selectedEtreCapable.map(item => `<li>${escapeHtml(item)}</li>`).join('') : '<li>Non spécifié</li>'}
        </ul>
        <p><strong>Conditions/Ressources (Prof):</strong></p>
        <ul>
            ${selectedConditionsRessources.length > 0 ? selectedConditionsRessources.map(item => `<li>${escapeHtml(item)}</li>`).join('') : '<li>Non spécifié</li>'}
        </ul>
        <p><strong>Critères d'Évaluation (Prof):</strong></p>
        <ul>
            ${selectedCriteresEvaluation.length > 0 ? selectedCriteresEvaluation.map(item => `<li>${escapeHtml(item)}</li>`).join('') : '<li>Non spécifié</li>'}
        </ul>
    `;
    sessionPreview.innerHTML = previewHtml;
}

// Helper to prevent XSS in preview
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
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
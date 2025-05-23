// script.js

// Déclarer les variables globales pour stocker toutes les données chargées
let allData = {
    phasesData: {}, // Pour A Phases.json
    patData: {},    // Pour A PAT.json (si besoin spécifique, sinon A Phases suffira)
    raData: {},     // Pour A1 RA.json
    pbtiqData: {},  // Pour A2 PBTIQ.json
    tpData: {},     // Pour B TP.json
    compDetailsData: {}, // Pour D Comp_etrCap_Ress_Eval.json
    onDonneData: {} // Pour C On_donne.json
};

// Références aux éléments du DOM pour une meilleure performance
const phaseSeanceSelect = document.getElementById('phase-seance');
const activiteProSelect = document.getElementById('activite-professionnelle');
const tacheSelect = document.getElementById('tache');
const resultatAttenduSelect = document.getElementById('resultat-attendu');
const problematiqueSelect = document.getElementById('problematique');
const competenceSelect = document.getElementById('competence');
const etreCapableDiv = document.getElementById('etre-capable-de-faire');
const conditionsRessourcesDiv = document.getElementById('conditions-ressources');
const criteresEvaluationDiv = document.getElementById('criteres-evaluation');
const ressourcesOnDonneSelect = document.getElementById('ressources-on-donne');
const intituleActiviteInput = document.getElementById('intitule-activite');
const contexteSituationTextarea = document.getElementById('contexte-situation');
const consigneTravailTextarea = document.getElementById('consigne-travail');
const modalitesEvaluationTextarea = document.getElementById('modalites-evaluation');
const ressourcesAjouteesTextarea = document.getElementById('ressources-ajoutees');
const criteresSpecifiquesTextarea = document.getElementById('criteres-specifiques');
const baremeNotationTextarea = document.getElementById('bareme-notation');
const enseignantOutputDiv = document.getElementById('enseignant-output');
const eleveOutputDiv = document.getElementById('eleve-output');
const exportOutputSection = document.getElementById('export-output');

let currentPage = 0; // Index de la page actuelle

/**
 * Fonction asynchrone pour charger les données depuis les fichiers JSON.
 * Gère les erreurs de chargement pour chaque fichier.
 */
async function loadData() {
    const files = [
        { name: 'A Phases.json', key: 'phasesData' },
        { name: 'A PAT.json', key: 'patData' }, // Pas strictement nécessaire si A Phases est suffisant, mais gardé pour l'instant
        { name: 'A1 RA.json', key: 'raData' },
        { name: 'A2 PBTIQ.json', key: 'pbtiqData' },
        { name: 'B TP.json', key: 'tpData' },
        { name: 'D Comp_etrCap_Ress_Eval.json', key: 'compDetailsData' },
        { name: 'C On_donne.json', key: 'onDonneData' }
    ];

    const promises = files.map(file =>
        fetch(file.name)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${file.name}`);
                }
                return response.json();
            })
            .then(data => {
                allData[file.key] = data;
                console.log(`Données chargées depuis ${file.name}`);
            })
            .catch(error => {
                console.error(`Erreur lors du chargement de ${file.name}:`, error);
                // Si un fichier est essentiel et échoue, on pourrait arrêter le processus
            })
    );

    await Promise.allSettled(promises);
    console.log('Toutes les données JSON ont été traitées.', allData);

    // Une fois toutes les données chargées, initialiser le formulaire
    initializeForm();
}

/**
 * Initialise le formulaire après le chargement des données.
 * Remplit la première liste déroulante et configure les écouteurs d'événements.
 */
function initializeForm() {
    // Remplir la sélection de la phase de la séance
    if (allData.phasesData && allData.phasesData.phases) {
        populateSelect(phaseSeanceSelect, allData.phasesData.phases, 'nom', 'Sélectionner une phase');
    } else {
        console.warn("Les données de phases (A Phases.json) ne sont pas disponibles ou mal structurées.");
    }

    // Remplir les ressources "On donne"
    if (allData.onDonneData && allData.onDonneData.ressourcesOnDonne) {
        populateSelect(ressourcesOnDonneSelect, allData.onDonneData.ressourcesOnDonne, null, 'Sélectionner une ressource (optionnel)');
    } else {
        console.warn("Les données de ressources (C On_donne.json) ne sont pas disponibles ou mal structurées.");
    }

    // Ajouter les écouteurs d'événements
    addEventListeners();

    // Afficher la première page au chargement
    afficherPage(0);
}

/**
 * Remplit un élément <select> avec des options.
 * @param {HTMLSelectElement} selectElement L'élément select à remplir.
 * @param {Array} data Tableau d'objets ou de chaînes de caractères.
 * @param {string|null} valueKey La clé de l'objet à utiliser comme valeur et texte de l'option, ou null si data est un tableau de chaînes.
 * @param {string} defaultOptionText Texte de l'option par défaut.
 */
function populateSelect(selectElement, data, valueKey, defaultOptionText) {
    selectElement.innerHTML = `<option value="">${defaultOptionText}</option>`;
    if (data && data.length > 0) {
        data.forEach(item => {
            const option = document.createElement('option');
            if (valueKey) {
                option.value = item[valueKey];
                option.textContent = item[valueKey];
            } else { // Si data est un tableau de chaînes
                option.value = item;
                option.textContent = item;
            }
            selectElement.appendChild(option);
        });
    }
}

/**
 * Ajoute tous les écouteurs d'événements nécessaires aux éléments du formulaire.
 */
function addEventListeners() {
    // Écouteurs pour les changements de sélection en cascade
    phaseSeanceSelect.addEventListener('change', handlePhaseChange);
    activiteProSelect.addEventListener('change', handleActiviteProChange);
    tacheSelect.addEventListener('change', handleTacheChange);
    competenceSelect.addEventListener('change', handleCompetenceChange);

    // Écouteurs pour les boutons de navigation
    document.querySelectorAll('.navigation-buttons button').forEach(button => {
        button.addEventListener('click', (event) => {
            const buttonId = event.target.id;
            if (buttonId.startsWith('next-')) {
                const pageIndex = parseInt(buttonId.split('-')[1]);
                afficherPage(pageIndex);
            } else if (buttonId.startsWith('prev-')) {
                const pageIndex = parseInt(buttonId.split('-')[1]) - 2; // -2 car 'prev-N' va à la page N-1
                afficherPage(pageIndex);
            } else if (buttonId === 'export-enseignant') {
                exporterDonnees('enseignant');
            } else if (buttonId === 'export-eleve') {
                exporterDonnees('eleve');
            } else if (buttonId === 'effacer') {
                effacerFormulaire();
            }
        });
    });
}

/**
 * Gère le changement de sélection de la phase de la séance.
 * Met à jour les activités professionnelles.
 */
function handlePhaseChange() {
    const selectedPhaseName = phaseSeanceSelect.value;
    resetDependentFields('phase'); // Réinitialise les champs dépendants de la phase

    const selectedPhase = allData.phasesData.phases.find(p => p.nom === selectedPhaseName);

    if (selectedPhase) {
        populateSelect(activiteProSelect, selectedPhase.activites, 'nom', 'Sélectionner une activité professionnelle');
    }
}

/**
 * Gère le changement de sélection de l'activité professionnelle.
 * Met à jour les tâches et les problématiques.
 */
function handleActiviteProChange() {
    const selectedActiviteName = activiteProSelect.value;
    resetDependentFields('activitePro'); // Réinitialise les champs dépendants de l'activité

    // Mettre à jour les tâches
    const currentPhase = phaseSeanceSelect.value;
    const selectedPhase = allData.phasesData.phases.find(p => p.nom === currentPhase);

    if (selectedPhase) {
        const selectedActivite = selectedPhase.activites.find(a => a.nom === selectedActiviteName);
        if (selectedActivite && selectedActivite.taches) {
            populateSelect(tacheSelect, selectedActivite.taches, null, 'Sélectionner une tâche'); // Les tâches sont des chaînes
        }
    }

    // Mettre à jour les problématiques
    if (allData.pbtiqData && allData.pbtiqData.problematiquesParActivite) {
        const problematiques = allData.pbtiqData.problematiquesParActivite[selectedActiviteName];
        if (problematiques) {
            populateSelect(problematiqueSelect, problematiques, null, 'Sélectionner une problématique');
        }
    }
}

/**
 * Gère le changement de sélection de la tâche.
 * Met à jour les résultats attendus et les compétences.
 */
function handleTacheChange() {
    const selectedTache = tacheSelect.value;
    resetDependentFields('tache'); // Réinitialise les champs dépendants de la tâche

    // Mettre à jour les résultats attendus
    if (allData.raData && allData.raData.resultatsAttendusParTache) {
        const resultat = allData.raData.resultatsAttendusParTache[selectedTache];
        if (resultat) {
            resultatAttenduSelect.innerHTML = `<option value="">${resultat}</option>`; // Un seul résultat possible
        } else {
            resultatAttenduSelect.innerHTML = '<option value="">Aucun résultat attendu pour cette tâche</option>';
        }
    }

    // Mettre à jour les compétences
    if (allData.tpData && allData.tpData.competencesParTache) {
        const competences = allData.tpData.competencesParTache[selectedTache];
        if (competences) {
            populateSelect(competenceSelect, competences, null, 'Sélectionner une compétence');
        }
    }
}

/**
 * Gère le changement de sélection de la compétence.
 * Affiche les détails "Être capable de faire", "Conditions et ressources", et "Critères d'évaluation".
 */
function handleCompetenceChange() {
    const selectedCompetence = competenceSelect.value;
    // Nettoyer les divs de détails avant d'afficher les nouveaux
    etreCapableDiv.innerHTML = '<h3>Être capable de faire :</h3><p>Sélectionnez une compétence pour voir les détails.</p>';
    conditionsRessourcesDiv.innerHTML = '<h3>Conditions et ressources :</h3><p>Sélectionnez une compétence pour voir les détails.</p>';
    criteresEvaluationDiv.innerHTML = '<h3>Critères d\'évaluation :</h3><p>Sélectionnez une compétence pour voir les détails.</p>';

    if (selectedCompetence && allData.compDetailsData && allData.compDetailsData.competenceDetails) {
        const details = allData.compDetailsData.competenceDetails[selectedCompetence];
        if (details) {
            etreCapableDiv.innerHTML = `<h3>Être capable de faire :</h3><p>${details.etreCapable}</p>`;
            conditionsRessourcesDiv.innerHTML = `<h3>Conditions et ressources :</h3><p>${details.conditionsRessources}</p>`;
            criteresEvaluationDiv.innerHTML = `<h3>Critères d'évaluation :</h3><p>${details.criteresEvaluation}</p>`;
        }
    }
}


/**
 * Affiche la page spécifiée et masque les autres.
 * @param {number} pageIndex L'index de la page à afficher (0-indexed).
 */
function afficherPage(pageIndex) {
    const pages = document.querySelectorAll('.page');
    pages.forEach((page, index) => {
        if (index === pageIndex) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
    currentPage = pageIndex;

    // Masquer la section d'exportation lors du changement de page
    exportOutputSection.classList.remove('active');
    enseignantOutputDiv.textContent = '';
    eleveOutputDiv.textContent = '';
}

/**
 * Collecte toutes les données du formulaire et les formate pour l'exportation.
 * @returns {object} Un objet contenant les données du formulaire.
 */
function collectFormData() {
    const selectedPhase = phaseSeanceSelect.value;
    const selectedActivite = activiteProSelect.value;
    const selectedTache = tacheSelect.value;
    const selectedProblematique = problematiqueSelect.value;
    const selectedResultatAttendu = resultatAttenduSelect.value;
    const selectedCompetence = competenceSelect.value;
    const selectedRessourceOnDonne = ressourcesOnDonneSelect.value;

    let competenceDetails = {
        etreCapable: 'Non sélectionné',
        conditionsRessources: 'Non sélectionné',
        criteresEvaluation: 'Non sélectionné'
    };

    if (selectedCompetence && allData.compDetailsData && allData.compDetailsData.competenceDetails[selectedCompetence]) {
        const details = allData.compDetailsData.competenceDetails[selectedCompetence];
        competenceDetails.etreCapable = details.etreCapable || 'Non spécifié';
        competenceDetails.conditionsRessources = details.conditionsRessources || 'Non spécifié';
        competenceDetails.criteresEvaluation = details.criteresEvaluation || 'Non spécifié';
    }


    return {
        informationsGenerales: {
            phaseSeance: selectedPhase,
            intituleActivite: intituleActiviteInput.value.trim(),
            contexteSituation: contexteSituationTextarea.value.trim(),
            consigneTravail: consigneTravailTextarea.value.trim(),
            modalitesEvaluation: modalitesEvaluationTextarea.value.trim(),
        },
        detailSituation: {
            activiteProfessionnelle: selectedActivite,
            tache: selectedTache,
            problematique: selectedProblematique,
            resultatAttendu: selectedResultatAttendu,
            ressourcesOnDonne: selectedRessourceOnDonne,
        },
        competenceEval: {
            competencePrincipale: selectedCompetence,
            etreCapableDeFaire: competenceDetails.etreCapable,
            conditionsRessources: competenceDetails.conditionsRessources,
            criteresEvaluation: competenceDetails.criteresEvaluation,
        },
        evaluationSupplementaire: {
            ressourcesAjoutees: ressourcesAjouteesTextarea.value.trim(),
            criteresSpecifiques: criteresSpecifiquesTextarea.value.trim(),
            baremeNotation: baremeNotationTextarea.value.trim(),
        }
    };
}

/**
 * Exporte les données du formulaire dans un format lisible.
 * @param {string} type 'enseignant' ou 'eleve'.
 */
function exporterDonnees(type) {
    const formData = collectFormData();
    let outputText = '';

    if (type === 'enseignant') {
        outputText = `
### Fiche Situation d'Évaluation - Pour l'Enseignant

#### 1. Informations Générales de la Situation
* **Phase de la séance :** ${formData.informationsGenerales.phaseSeance || 'Non renseigné'}
* **Intitulé de l'Activité / Situation :** ${formData.informationsGenerales.intituleActivite || 'Non renseigné'}
* **Contexte de la situation d'évaluation :**
    ${formData.informationsGenerales.contexteSituation || 'Non renseigné'}
* **Consigne de travail :**
    ${formData.informationsGenerales.consigneTravail || 'Non renseigné'}
* **Modalités d'évaluation (durée, outils, cadre...) :**
    ${formData.informationsGenerales.modalitesEvaluation || 'Non renseigné'}

#### 2. Détail de la Situation
* **Activité professionnelle :** ${formData.detailSituation.activiteProfessionnelle || 'Non renseigné'}
* **Tâche :** ${formData.detailSituation.tache || 'Non renseigné'}
* **Problématique :** ${formData.detailSituation.problematique || 'Non renseigné'}
* **Résultat attendu :** ${formData.detailSituation.resultatAttendu || 'Non renseigné'}
* **Ressources (fournies) :** ${formData.detailSituation.ressourcesOnDonne || 'Non renseigné'}

#### 3. Compétence Évaluée
* **Compétence principale :** ${formData.competenceEval.competencePrincipale || 'Non renseigné'}
* **Être capable de faire :**
    ${formData.competenceEval.etreCapableDeFaire || 'Non renseigné'}
* **Conditions et ressources :**
    ${formData.competenceEval.conditionsRessources || 'Non renseigné'}
* **Critères d'évaluation :**
    ${formData.competenceEval.criteresEvaluation || 'Non renseigné'}

#### 4. Éléments d'Évaluation Supplémentaires
* **Ressources ajoutées (spécifiques à cette évaluation) :**
    ${formData.evaluationSupplementaire.ressourcesAjoutees || 'Non renseigné'}
* **Critères spécifiques (optionnel) :**
    ${formData.evaluationSupplementaire.criteresSpecifiques || 'Non renseigné'}
* **Barème de notation (optionnel) :**
    ${formData.evaluationSupplementaire.baremeNotation || 'Non renseigné'}
        `.trim();
        enseignantOutputDiv.textContent = outputText;
        eleveOutputDiv.textContent = ''; // S'assurer que l'autre est vide
        enseignantOutputDiv.style.display = 'block';
        eleveOutputDiv.style.display = 'none';

    } else if (type === 'eleve') {
        outputText = `
### Fiche Situation d'Évaluation - Pour l'Élève

#### Intitulé de l'Activité / Situation
* **Intitulé :** ${formData.informationsGenerales.intituleActivite || 'Non renseigné'}

#### Contexte de la situation d'évaluation
* ${formData.informationsGenerales.contexteSituation || 'Non renseigné'}

#### Consigne de travail
* ${formData.informationsGenerales.consigneTravail || 'Non renseigné'}

#### Modalités d'évaluation
* **Durée, outils, cadre... :** ${formData.informationsGenerales.modalitesEvaluation || 'Non renseigné'}

#### Résultats attendus
* ${formData.detailSituation.resultatAttendu || 'Non renseigné'}

#### Ressources à disposition
* **Ressource fournie :** ${formData.detailSituation.ressourcesOnDonne || 'Non renseigné'}
* **Ressources supplémentaires (si applicable) :**
    ${formData.evaluationSupplementaire.ressourcesAjoutees || 'Non renseigné'}

#### Critères d'évaluation
* **Critères généraux de la compétence :**
    ${formData.competenceEval.criteresEvaluation || 'Non renseigné'}
* **Critères spécifiques à cette situation (si applicable) :**
    ${formData.evaluationSupplementaire.criteresSpecifiques || 'Non renseigné'}

#### Barème de notation (si applicable)
* ${formData.evaluationSupplementaire.baremeNotation || 'Non renseigné'}
        `.trim();
        eleveOutputDiv.textContent = outputText;
        enseignantOutputDiv.textContent = ''; // S'assurer que l'autre est vide
        eleveOutputDiv.style.display = 'block';
        enseignantOutputDiv.style.display = 'none';
    }

    exportOutputSection.classList.add('active'); // Afficher la section d'exportation
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // Faire défiler vers le bas
}

/**
 * Efface tous les champs du formulaire et réinitialise les sélections.
 */
function effacerFormulaire() {
    // Réinitialiser les champs de texte
    intituleActiviteInput.value = '';
    contexteSituationTextarea.value = '';
    consigneTravailTextarea.value = '';
    modalitesEvaluationTextarea.value = '';
    ressourcesAjouteesTextarea.value = '';
    criteresSpecifiquesTextarea.value = '';
    baremeNotationTextarea.value = '';

    // Réinitialiser toutes les listes déroulantes
    phaseSeanceSelect.value = '';
    ressourcesOnDonneSelect.value = ''; // Laisser la ressource "On donne" en premier
    resetDependentFields('all'); // Réinitialise tous les champs dépendants

    // Masquer et effacer les sorties d'exportation
    enseignantOutputDiv.textContent = '';
    eleveOutputDiv.textContent = '';
    exportOutputSection.classList.remove('active');

    afficherPage(0); // Revenir à la première page
    alert('Formulaire effacé !');
}

/**
 * Réinitialise les champs de formulaire qui dépendent d'un choix précédent.
 * @param {string} level Le niveau à partir duquel réinitialiser ('phase', 'activitePro', 'tache', 'all').
 */
function resetDependentFields(level) {
    if (level === 'phase' || level === 'all') {
        activiteProSelect.innerHTML = '<option value="">Sélectionner une activité professionnelle</option>';
    }
    if (level === 'activitePro' || level === 'phase' || level === 'all') {
        tacheSelect.innerHTML = '<option value="">Sélectionner une tâche</option>';
        problematiqueSelect.innerHTML = '<option value="">Sélectionner une problématique</option>';
    }
    if (level === 'tache' || level === 'activitePro' || level === 'phase' || level === 'all') {
        resultatAttenduSelect.innerHTML = '<option value="">Sélectionner un résultat attendu</option>';
        competenceSelect.innerHTML = '<option value="">Sélectionner une compétence</option>';
    }
    // Toujours réinitialiser les détails des compétences
    etreCapableDiv.innerHTML = '<h3>Être capable de faire :</h3><p>Sélectionnez une compétence pour voir les détails.</p>';
    conditionsRessourcesDiv.innerHTML = '<h3>Conditions et ressources :</h3><p>Sélectionnez une compétence pour voir les détails.</p>';
    criteresEvaluationDiv.innerHTML = '<h3>Critères d\'évaluation :</h3><p>Sélectionnez une compétence pour voir les détails.</p>';
}

// Lancer le chargement des données au chargement de la page
document.addEventListener('DOMContentLoaded', loadData);
// script.js

// Déclarer les variables globales pour stocker les données chargées
let phasesActivitesTachesData = {}; // Nouveau: pour le fichier phases_activites_taches.json
let activitesTachesData = {}; // Correspond à A PAT.json
let resultatsAttendusData = {}; // Correspond à A1 RA.json
let problematiquesData = {}; // Correspond à A2 PBTIQ.json
let competencesParTacheData = {}; // Correspond à B TP.json
let competenceDetailsData = {}; // Correspond à D Comp_etrCap_Ress_Eval.json
let ressourcesOnDonneData = {}; // Correspond à C On_donne.json

/**
 * Fonction asynchrone pour charger les données depuis les fichiers JSON.
 * Gère les erreurs de chargement pour chaque fichier.
 */
async function loadData() {
    try {
        const [
            phasesActivitesTachesResponse, // Nouveau
            activitesTachesResponse,
            resultatsAttendusResponse,
            problematiquesResponse,
            competencesParTacheResponse,
            competenceDetailsResponse,
            ressourcesOnDonneResponse
        ] = await Promise.allSettled([
            fetch('phases_activites_taches.json'), // Nouveau fichier à charger
            fetch('A PAT.json'),
            fetch('A1 RA.json'),
            fetch('A2 PBTIQ.json'),
            fetch('B TP.json'),
            fetch('D Comp_etrCap_Ress_Eval.json'),
            fetch('C On_donne.json')
        ]);

        // Vérifier si le chargement a réussi pour chaque fichier et assigner les données
        if (phasesActivitesTachesResponse.status === 'fulfilled') {
            phasesActivitesTachesData = await phasesActivitesTachesResponse.value.json();
            console.log('phases_activites_taches.json chargé avec succès.');
        } else {
            console.error('Erreur de chargement de phases_activites_taches.json:', phasesActivitesTachesResponse.reason);
        }

        if (activitesTachesResponse.status === 'fulfilled') {
            activitesTachesData = await activitesTachesResponse.value.json();
            console.log('A PAT.json chargé avec succès.');
        } else {
            console.error('Erreur de chargement de A PAT.json:', activitesTachesResponse.reason);
        }

        if (resultatsAttendusResponse.status === 'fulfilled') {
            resultatsAttendusData = await resultatsAttendusResponse.value.json();
            console.log('A1 RA.json chargé avec succès.');
        } else {
            console.error('Erreur de chargement de A1 RA.json:', resultatsAttendusResponse.reason);
        }

        if (problematiquesResponse.status === 'fulfilled') {
            problematiquesData = await problematiquesResponse.value.json();
            console.log('A2 PBTIQ.json chargé avec succès.');
        } else {
            console.error('Erreur de chargement de A2 PBTIQ.json:', problematiquesResponse.reason);
        }

        if (competencesParTacheResponse.status === 'fulfilled') {
            competencesParTacheData = await competencesParTacheResponse.value.json();
            console.log('B TP.json chargé avec succès.');
        } else {
            console.error('Erreur de chargement de B TP.json:', competencesParTacheResponse.reason);
        }

        if (competenceDetailsResponse.status === 'fulfilled') {
            competenceDetailsData = await competenceDetailsResponse.value.json();
            console.log('D Comp_etrCap_Ress_Eval.json chargé avec succès.');
        } else {
            console.error('Erreur de chargement de D Comp_etrCap_Ress_Eval.json:', competenceDetailsResponse.reason);
        }

        if (ressourcesOnDonneResponse.status === 'fulfilled') {
            ressourcesOnDonneData = await ressourcesOnDonneResponse.value.json();
            console.log('C On_donne.json chargé avec succès.');
        } else {
            console.error('Erreur de chargement de C On_donne.json:', ressourcesOnDonneResponse.reason);
        }

        initApp();

    } catch (error) {
        console.error('Erreur fatale lors du chargement des données:', error);
        alert('Impossible de charger toutes les données nécessaires. Veuillez recharger la page.');
    }
}

/**
 * Fonction principale pour initialiser l'application après le chargement des données.
 */
function initApp() {
    // --- Références aux éléments du DOM ---
    const pages = document.querySelectorAll('.page');
    const phaseSeanceSelect = document.getElementById('phase-seance');
    const intituleActiviteInput = document.getElementById('intitule-activite');
    const contexteProfessionnelTextarea = document.getElementById('contexte-professionnel');
    const activiteProSelect = document.getElementById('activite-pro');
    const tacheSelect = document.getElementById('tache-associee');
    const problematiqueSelect = document.getElementById('problematique');
    const resultatAttenduSelect = document.getElementById('resultat-attendu');
    const competenceSelect = document.getElementById('competence-associee');
    const etreCapableSelect = document.getElementById('etre-capable');
    const conditionsRessourcesTextarea = document.getElementById('conditions-ressources');
    const criteresEvaluationTextarea = document.getElementById('criteres-evaluation');
    const ressourcesDonneesSelect = document.getElementById('ressources-donnees');
    const ressourcesAjouteesTextarea = document.getElementById('ressources-ajoutees');
    const criteresSpecifiquesTextarea = document.getElementById('criteres-specifiques');
    const baremeNotationTextarea = document.getElementById('bareme-notation');
    const enseignantOutputDiv = document.getElementById('enseignant-output');
    const eleveOutputDiv = document.getElementById('eleve-output');
    const exportOutputSection = document.getElementById('export-output');
    const effacerBtn = document.getElementById('effacer');

    let currentPageIndex = 0;

    /**
     * Affiche la page spécifiée et masque les autres.
     * @param {number} index L'indice de la page à afficher.
     */
    function afficherPage(index) {
        pages.forEach((page, i) => {
            if (i === index) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
        currentPageIndex = index;
    }

    // --- Gestion de la navigation entre les pages ---
    document.querySelectorAll('.navigation-buttons .btn').forEach(button => {
        button.addEventListener('click', function() {
            const buttonId = this.id;
            if (buttonId.startsWith('next-')) {
                afficherPage(currentPageIndex + 1);
            } else if (buttonId.startsWith('prev-')) {
                afficherPage(currentPageIndex - 1);
            }
        });
    });

    // --- Remplissage des menus déroulants et champs de texte ---

    // Remplir initialement la liste des phases (Page 1)
    // Les options pour la phase sont déjà dans l'HTML, mais si tu voulais qu'elles viennent d'un JSON,
    // ce serait le moment de le faire ici. Pour l'instant, elles sont statiques dans index.html.

    // Remplir les ressources données (Page 4)
    if (ressourcesOnDonneData && ressourcesOnDonneData.ressourcesOnDonne) {
        ressourcesOnDonneData.ressourcesOnDonne.forEach(ressource => {
            const option = document.createElement('option');
            option.value = ressource;
            option.textContent = ressource;
            ressourcesDonneesSelect.appendChild(option);
        });
    }

    // NOUVEAU: Événement pour charger les activités professionnelles en fonction de la phase sélectionnée
    phaseSeanceSelect.addEventListener('change', () => {
        const selectedPhase = phaseSeanceSelect.value;
        activiteProSelect.innerHTML = '<option value="">Sélectionner une activité professionnelle</option>'; // Réinitialiser

        // Réinitialiser également les champs dépendants de l'activité
        tacheSelect.innerHTML = '<option value="">Sélectionner une tâche</option>';
        problematiqueSelect.innerHTML = '<option value="">Sélectionner une problématique</option>';
        resultatAttenduSelect.innerHTML = '<option value="">Sélectionner un résultat attendu</option>';
        competenceSelect.innerHTML = '<option value="">Sélectionner une compétence</option>';
        etreCapableSelect.innerHTML = '<option value="">Sélectionner ce qu\'il faut être capable de faire</option>';
        conditionsRessourcesTextarea.value = '';
        criteresEvaluationTextarea.value = '';

        if (selectedPhase && phasesActivitesTachesData.phases) {
            // Trouver la phase sélectionnée dans le nouveau JSON
            const phase = phasesActivitesTachesData.phases.find(p => p.nom === selectedPhase);
            if (phase && phase.activites) {
                phase.activites.forEach(activite => {
                    const option = document.createElement('option');
                    option.value = activite;
                    option.textContent = activite;
                    activiteProSelect.appendChild(option);
                });
            }
        }
    });


    // Événement pour charger les tâches associées, problématiques et réinitialiser les champs dépendants
    activiteProSelect.addEventListener('change', () => {
        const selectedActivite = activiteProSelect.value;

        // Réinitialiser les menus déroulants et champs de texte qui dépendent de l'activité
        tacheSelect.innerHTML = '<option value="">Sélectionner une tâche</option>';
        problematiqueSelect.innerHTML = '<option value="">Sélectionner une problématique</option>';
        resultatAttenduSelect.innerHTML = '<option value="">Sélectionner un résultat attendu</option>';
        competenceSelect.innerHTML = '<option value="">Sélectionner une compétence</option>';
        etreCapableSelect.innerHTML = '<option value="">Sélectionner ce qu\'il faut être capable de faire</option>';
        conditionsRessourcesTextarea.value = '';
        criteresEvaluationTextarea.value = '';

        if (selectedActivite) {
            // Remplir les tâches associées à l'activité professionnelle
            if (activitesTachesData.tachesParActivite && activitesTachesData.tachesParActivite[selectedActivite]) {
                activitesTachesData.tachesParActivite[selectedActivite].forEach(tache => {
                    const option = document.createElement('option');
                    option.value = tache;
                    option.textContent = tache;
                    tacheSelect.appendChild(option);
                });
            }

            // Remplir les problématiques associées à l'activité professionnelle
            if (problematiquesData.problematiquesParActivite && problematiquesData.problematiquesParActivite[selectedActivite]) {
                problematiquesData.problematiquesParActivite[selectedActivite].forEach(problematique => {
                    const option = document.createElement('option');
                    option.value = problematique;
                    option.textContent = problematique;
                    problematiqueSelect.appendChild(option);
                });
            }
        }
    });

    // Événement pour afficher le résultat attendu et les compétences pour la tâche sélectionnée
    tacheSelect.addEventListener('change', () => {
        const selectedTache = tacheSelect.value;

        // Réinitialiser les menus déroulants et champs de texte qui dépendent de la tâche
        resultatAttenduSelect.innerHTML = '<option value="">Sélectionner un résultat attendu</option>';
        competenceSelect.innerHTML = '<option value="">Sélectionner une compétence</option>';
        etreCapableSelect.innerHTML = '<option value="">Sélectionner ce qu\'il faut être capable de faire</option>';
        conditionsRessourcesTextarea.value = '';
        criteresEvaluationTextarea.value = '';

        if (selectedTache) {
            // Remplir le SELECT des résultats attendus pour la tâche
            if (resultatsAttendusData.resultatsAttendusParTache) {
                 const specificResult = resultatsAttendusData.resultatsAttendusParTache[selectedTache];
                 if (specificResult) {
                     const option = document.createElement('option');
                     option.value = specificResult;
                     option.textContent = specificResult;
                     resultatAttenduSelect.appendChild(option);
                     resultatAttenduSelect.value = specificResult;
                 }
            }

            // Remplir les compétences associées à la tâche
            if (competencesParTacheData.competencesParTache && competencesParTacheData.competencesParTache[selectedTache]) {
                competencesParTacheData.competencesParTache[selectedTache].forEach(competence => {
                    const option = document.createElement('option');
                    option.value = competence;
                    option.textContent = competence;
                    competenceSelect.appendChild(option);
                });
            }
        }
    });

    // Événement pour afficher les détails de la compétence sélectionnée
    competenceSelect.addEventListener('change', () => {
        const selectedCompetence = competenceSelect.value;
        etreCapableSelect.innerHTML = '<option value="">Sélectionner ce qu\'il faut être capable de faire</option>';
        conditionsRessourcesTextarea.value = '';
        criteresEvaluationTextarea.value = '';

        if (selectedCompetence && competenceDetailsData.competenceDetails && competenceDetailsData.competenceDetails[selectedCompetence]) {
            const details = competenceDetailsData.competenceDetails[selectedCompetence];

            // Remplir le SELECT "Etre capable de"
            if (details.etreCapable) {
                const option = document.createElement('option');
                option.value = details.etreCapable;
                option.textContent = details.etreCapable;
                etreCapableSelect.appendChild(option);
                etreCapableSelect.value = details.etreCapable;
            }

            conditionsRessourcesTextarea.value = details.conditionsRessources || '';
            criteresEvaluationTextarea.value = details.criteresEvaluation || '';
        }
    });


    /**
     * Génère le contenu d'exportation pour l'enseignant ou l'élève.
     * @param {string} type 'enseignant' ou 'eleve'
     * @returns {string} Le texte formaté pour l'export.
     */
    function generateExportContent(type) {
        const phaseSeance = phaseSeanceSelect.value.trim();
        const intituleActivite = intituleActiviteInput.value.trim();
        const contexteProfessionnel = contexteProfessionnelTextarea.value.trim();
        const activitePro = activiteProSelect.value.trim();
        const tacheAssociee = tacheSelect.value.trim();
        const problematique = problematiqueSelect.value.trim();
        const resultatAttendu = resultatAttenduSelect.value.trim();
        const competenceAssociee = competenceSelect.value.trim();
        const etreCapable = etreCapableSelect.value.trim();
        const conditionsRessources = conditionsRessourcesTextarea.value.trim();
        const criteresEvaluation = criteresEvaluationTextarea.value.trim();
        const ressourcesDonnees = ressourcesDonneesSelect.value.trim();
        const ressourcesAjoutees = ressourcesAjouteesTextarea.value.trim().split('\n').filter(line => line.trim() !== '').map(line => `- ${line.trim()}`).join('\n');
        const criteresSpecifiques = criteresSpecifiquesTextarea.value.trim().split('\n').filter(line => line.trim() !== '').map(line => `- ${line.trim()}`).join('\n');
        const baremeNotation = baremeNotationTextarea.value.trim();

        // Le titre principal est maintenant la problématique
        let output = `## Situation d'Évaluation : ${problematique || 'Problématique non renseignée'}\n\n`;

        if (type === 'enseignant') {
            output += `### Informations Générales\n`;
            output += `**Phase de la Séance :** ${phaseSeance || 'Non sélectionnée'}\n`;
            output += `**Intitulé de l'Activité / Situation :** ${intituleActivite || 'Non renseigné'}\n`;
            output += `**Contexte Professionnel :**\n${contexteProfessionnel || 'Non renseigné'}\n\n`;

            output += `### Détails de l'Activité\n`;
            output += `**Activité Professionnelle :** ${activitePro || 'Non sélectionnée'}\n`;
            output += `**Tâche Associée :** ${tacheAssociee || 'Non sélectionnée'}\n`;
            output += `**Problématique :**\n${problematique || 'Non sélectionnée'}\n\n`;

            output += `### Résultats et Compétences\n`;
            output += `**Résultat Attendu :**\n${resultatAttendu || 'Non sélectionné'}\n\n`;
            output += `**Compétence Associée :** ${competenceAssociee || 'Non sélectionnée'}\n`;
            output += `**Être Capable de :**\n${etreCapable || 'Non sélectionné'}\n\n`;
            output += `**Conditions et Ressources :**\n${conditionsRessources || 'Non renseigné'}\n\n`;
            output += `**Critères d'Évaluation Associés :**\n${criteresEvaluation || 'Non renseigné'}\n\n`;

            output += `### Ressources et Barème\n`;
            output += `**Ressources Données :** ${ressourcesDonnees || 'Non sélectionnée'}\n`;
            if (ressourcesAjoutees) {
                output += `**Ressources Ajoutées :**\n${ressourcesAjoutees}\n\n`;
            } else {
                output += `**Ressources Ajoutées :** Non renseigné\n\n`;
            }
            if (criteresSpecifiques) {
                output += `**Critères Spécifiques :**\n${criteresSpecifiques}\n\n`;
            } else {
                output += `**Critères Spécifiques :** Non renseigné\n\n`;
            }
            output += `**Barème de Notation :**\n${baremeNotation || 'Non renseigné'}\n`;

        } else if (type === 'eleve') {
            output += `### Contexte de la Situation\n`;
            output += `**Intitulé :** ${intituleActivite || 'Non renseigné'}\n`;
            output += `**Contexte Professionnel :**\n${contexteProfessionnel || 'Non renseigné'}\n\n`;
            output += `**Votre Mission (Tâche) :** ${tacheAssociee || 'Non sélectionnée'}\n\n`;
            output += `### Problématique à Résoudre\n`;
            output += `${problematique || 'Non sélectionnée'}\n\n`;
            output += `### Ce qui est Attendu de Vous (Résultat)\n`;
            output += `${resultatAttendu || 'Non sélectionné'}\n\n`;
            output += `### Compétence Évaluée\n`;
            output += `${competenceAssociee || 'Non sélectionnée'}\n\n`;
            output += `### Ce que vous devez être capable de faire\n`;
            output += `${etreCapable || 'Non sélectionné'}\n\n`;

            output += `### Ressources à votre disposition\n`;
            output += `- Ressource Principale : ${ressourcesDonnees || 'Non sélectionnée'}\n`;
            if (ressourcesAjoutees) {
                output += `${ressourcesAjoutees}\n\n`;
            } else {
                output += `- Autres ressources : Non renseigné\n\n`;
            }

            output += `### Critères d'Évaluation (Comment vous serez évalué)\n`;
            if (criteresSpecifiques) {
                output += `${criteresSpecifiques}\n`;
            }
            if (criteresEvaluation) {
                output += `- Basés sur la compétence : ${criteresEvaluation}\n`;
            } else if (!criteresSpecifiques) {
                 output += `Non renseigné.\n`;
            }
            output += `\n`;
            output += `### Barème de Notation\n`;
            output += `${baremeNotation || 'Non renseigné'}\n`;
        }
        return output;
    }

    // --- Gestion des exports ---
    document.getElementById('export-enseignant').addEventListener('click', () => {
        enseignantOutputDiv.textContent = generateExportContent('enseignant');
        eleveOutputDiv.textContent = '';
        exportOutputSection.classList.add('active');
        exportOutputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('export-eleve').addEventListener('click', () => {
        eleveOutputDiv.textContent = generateExportContent('eleve');
        enseignantOutputDiv.textContent = '';
        exportOutputSection.classList.add('active');
        exportOutputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // --- Fonctionnalité Effacer ---
    if (effacerBtn) {
        effacerBtn.addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment effacer toutes les données du formulaire ?')) {
                // Réinitialiser tous les champs du formulaire
                phaseSeanceSelect.value = '';
                intituleActiviteInput.value = '';
                contexteProfessionnelTextarea.value = '';
                // NOUVEAU: Appel de resetDependentFields pour réinitialiser les champs dépendants de la phase
                resetDependentFields();
                ressourcesDonneesSelect.value = '';
                ressourcesAjouteesTextarea.value = '';
                criteresSpecifiquesTextarea.value = '';
                baremeNotationTextarea.value = '';

                enseignantOutputDiv.textContent = '';
                eleveOutputDiv.textContent = '';
                exportOutputSection.classList.remove('active');

                afficherPage(0);
                alert('Formulaire effacé !');
            }
        });
    }

    /**
     * Réinitialise tous les champs de formulaire qui dépendent d'un choix précédent.
     * Utile lors du changement de phase ou de l'effacement complet.
     */
    function resetDependentFields() {
        activiteProSelect.innerHTML = '<option value="">Sélectionner une activité professionnelle</option>';
        tacheSelect.innerHTML = '<option value="">Sélectionner une tâche</option>';
        problematiqueSelect.innerHTML = '<option value="">Sélectionner une problématique</option>';
        resultatAttenduSelect.innerHTML = '<option value="">Sélectionner un résultat attendu</option>';
        competenceSelect.innerHTML = '<option value="">Sélectionner une compétence</option>';
        etreCapableSelect.innerHTML = '<option value="">Sélectionner ce qu\'il faut être capable de faire</option>';
        conditionsRessourcesTextarea.value = '';
        criteresEvaluationTextarea.value = '';
    }


    // Initialisation : Afficher la première page au chargement
    afficherPage(0);
}

// Lancer le chargement des données au chargement de la page
document.addEventListener('DOMContentLoaded', loadData);
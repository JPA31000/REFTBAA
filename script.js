// script.js

// Déclarer les variables globales pour stocker les données chargées
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
            activitesTachesResponse,
            resultatsAttendusResponse,
            problematiquesResponse,
            competencesParTacheResponse,
            competenceDetailsResponse,
            ressourcesOnDonneResponse
        ] = await Promise.allSettled([ // Utilisation de Promise.allSettled pour ne pas arrêter si une promesse échoue
            fetch('A PAT.json'),
            fetch('A1 RA.json'),
            fetch('A2 PBTIQ.json'),
            fetch('B TP.json'),
            fetch('D Comp_etrCap_Ress_Eval.json'),
            fetch('C On_donne.json')
        ]);

        // Vérifier si le chargement a réussi pour chaque fichier et assigner les données
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

        // Une fois toutes les données (ou la majorité) chargées, initialiser l'application
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
    const activiteProSelect = document.getElementById('activite-pro');
    const tacheSelect = document.getElementById('tache-associee');
    const problematiqueSelect = document.getElementById('problematique');
    const resultatAttenduTextarea = document.getElementById('resultat-attendu');
    const competenceSelect = document.getElementById('competence-associee');
    const etreCapableTextarea = document.getElementById('etre-capable');
    const conditionsRessourcesTextarea = document.getElementById('conditions-ressources');
    const criteresEvaluationTextarea = document.getElementById('criteres-evaluation');
    const ressourcesDonneesSelect = document.getElementById('ressources-donnees');
    const intituleActiviteInput = document.getElementById('intitule-activite');
    const contexteProfessionnelTextarea = document.getElementById('contexte-professionnel');
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

    // Remplir la liste des activités professionnelles (Page 2)
    if (activitesTachesData && activitesTachesData.activitesProfessionnelles) {
        activitesTachesData.activitesProfessionnelles.forEach(activite => {
            const option = document.createElement('option');
            option.value = activite;
            option.textContent = activite;
            activiteProSelect.appendChild(option);
        });
    }

    // Remplir les ressources données (Page 5)
    if (ressourcesOnDonneData && ressourcesOnDonneData.ressourcesOnDonne) {
        ressourcesOnDonneData.ressourcesOnDonne.forEach(ressource => {
            const option = document.createElement('option');
            option.value = ressource;
            option.textContent = ressource;
            ressourcesDonneesSelect.appendChild(option);
        });
    }

    // Événement pour charger les tâches associées à l'activité professionnelle sélectionnée
    activiteProSelect.addEventListener('change', () => {
        const selectedActivite = activiteProSelect.value;
        tacheSelect.innerHTML = '<option value="">Sélectionner une tâche</option>'; // Réinitialiser
        problematiqueSelect.innerHTML = '<option value="">Sélectionner une problématique</option>'; // Réinitialiser
        resultatAttenduTextarea.value = ''; // Effacer le résultat attendu
        competenceSelect.innerHTML = '<option value="">Sélectionner une compétence</option>'; // Réinitialiser compétences
        etreCapableTextarea.value = ''; // Effacer être capable
        conditionsRessourcesTextarea.value = ''; // Effacer conditions ressources
        criteresEvaluationTextarea.value = ''; // Effacer critères évaluation


        if (selectedActivite && activitesTachesData.tachesParActivite && activitesTachesData.tachesParActivite[selectedActivite]) {
            activitesTachesData.tachesParActivite[selectedActivite].forEach(tache => {
                const option = document.createElement('option');
                option.value = tache;
                option.textContent = tache;
                tacheSelect.appendChild(option);
            });
        }

        // Remplir les problématiques associées à l'activité professionnelle
        if (selectedActivite && problematiquesData.problematiquesParActivite && problematiquesData.problematiquesParActivite[selectedActivite]) {
            problematiquesData.problematiquesParActivite[selectedActivite].forEach(problematique => {
                const option = document.createElement('option');
                option.value = problematique;
                option.textContent = problematique;
                problematiqueSelect.appendChild(option);
            });
        }
    });

    // Événement pour afficher le résultat attendu et les compétences pour la tâche sélectionnée
    tacheSelect.addEventListener('change', () => {
        const selectedTache = tacheSelect.value;
        resultatAttenduTextarea.value = ''; // Effacer le résultat attendu
        competenceSelect.innerHTML = '<option value="">Sélectionner une compétence</option>'; // Réinitialiser compétences
        etreCapableTextarea.value = ''; // Effacer être capable
        conditionsRessourcesTextarea.value = ''; // Effacer conditions ressources
        criteresEvaluationTextarea.value = ''; // Effacer critères évaluation

        // Afficher le résultat attendu pour la tâche
        if (selectedTache && resultatsAttendusData.resultatsAttendusParTache && resultatsAttendusData.resultatsAttendusParTache[selectedTache]) {
            resultatAttenduTextarea.value = resultatsAttendusData.resultatsAttendusParTache[selectedTache];
        }

        // Remplir les compétences associées à la tâche
        if (selectedTache && competencesParTacheData.competencesParTache && competencesParTacheData.competencesParTache[selectedTache]) {
            competencesParTacheData.competencesParTache[selectedTache].forEach(competence => {
                const option = document.createElement('option');
                option.value = competence;
                option.textContent = competence;
                competenceSelect.appendChild(option);
            });
        }
    });

    // Événement pour afficher les détails de la compétence sélectionnée
    competenceSelect.addEventListener('change', () => {
        const selectedCompetence = competenceSelect.value;
        etreCapableTextarea.value = '';
        conditionsRessourcesTextarea.value = '';
        criteresEvaluationTextarea.value = '';

        if (selectedCompetence && competenceDetailsData.competenceDetails && competenceDetailsData.competenceDetails[selectedCompetence]) {
            const details = competenceDetailsData.competenceDetails[selectedCompetence];
            etreCapableTextarea.value = details.etreCapable || '';
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
        const intituleActivite = intituleActiviteInput.value.trim();
        const contexteProfessionnel = contexteProfessionnelTextarea.value.trim();
        const activitePro = activiteProSelect.value.trim();
        const tacheAssociee = tacheSelect.value.trim();
        const problematique = problematiqueSelect.value.trim();
        const resultatAttendu = resultatAttenduTextarea.value.trim();
        const competenceAssociee = competenceSelect.value.trim();
        const etreCapable = etreCapableTextarea.value.trim();
        const conditionsRessources = conditionsRessourcesTextarea.value.trim();
        const criteresEvaluation = criteresEvaluationTextarea.value.trim();
        const ressourcesDonnees = ressourcesDonneesSelect.value.trim();
        const ressourcesAjoutees = ressourcesAjouteesTextarea.value.trim().split('\n').filter(line => line.trim() !== '').map(line => `- ${line.trim()}`).join('\n');
        const criteresSpecifiques = criteresSpecifiquesTextarea.value.trim().split('\n').filter(line => line.trim() !== '').map(line => `- ${line.trim()}`).join('\n');
        const baremeNotation = baremeNotationTextarea.value.trim();

        let output = `## Situation d'Évaluation : ${intituleActivite || 'Non renseigné'}\n\n`;

        if (type === 'enseignant') {
            output += `### Informations Générales\n`;
            output += `**Intitulé de l'Activité :** ${intituleActivite || 'Non renseigné'}\n`;
            output += `**Contexte Professionnel :**\n${contexteProfessionnel || 'Non renseigné'}\n\n`;

            output += `### Détails de l'Activité\n`;
            output += `**Activité Professionnelle :** ${activitePro || 'Non sélectionnée'}\n`;
            output += `**Tâche Associée :** ${tacheAssociee || 'Non sélectionnée'}\n`;
            output += `**Problématique :**\n${problematique || 'Non sélectionnée'}\n\n`;

            output += `### Résultats et Compétences\n`;
            output += `**Résultat Attendu :**\n${resultatAttendu || 'Non renseigné'}\n\n`;
            output += `**Compétence Associée :** ${competenceAssociee || 'Non sélectionnée'}\n`;
            output += `**Être Capable de :**\n${etreCapable || 'Non renseigné'}\n\n`;
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
            output += `${resultatAttendu || 'Non renseigné'}\n\n`;
            output += `### Compétence Évaluée\n`;
            output += `${competenceAssociee || 'Non sélectionnée'}\n\n`;
            output += `### Ce que vous devez être capable de faire\n`;
            output += `${etreCapable || 'Non renseigné'}\n\n`;

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
            output += `\n`; // Ajoute une ligne vide pour une meilleure lisibilité
            output += `### Barème de Notation\n`;
            output += `${baremeNotation || 'Non renseigné'}\n`;
        }
        return output;
    }

    // --- Gestion des exports ---
    document.getElementById('export-enseignant').addEventListener('click', () => {
        enseignantOutputDiv.textContent = generateExportContent('enseignant');
        eleveOutputDiv.textContent = ''; // S'assurer que l'autre est vide
        exportOutputSection.classList.add('active'); // Afficher la section d'export
        // Faire défiler vers la section d'export
        exportOutputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('export-eleve').addEventListener('click', () => {
        eleveOutputDiv.textContent = generateExportContent('eleve');
        enseignantOutputDiv.textContent = ''; // S'assurer que l'autre est vide
        exportOutputSection.classList.add('active'); // Afficher la section d'export
        // Faire défiler vers la section d'export
        exportOutputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // --- Fonctionnalité Effacer ---
    if (effacerBtn) {
        effacerBtn.addEventListener('click', () => {
            if (confirm('Voulez-vous vraiment effacer toutes les données du formulaire ?')) {
                // Réinitialiser tous les champs du formulaire
                document.getElementById('intitule-activite').value = '';
                document.getElementById('contexte-professionnel').value = '';
                activiteProSelect.value = '';
                tacheSelect.innerHTML = '<option value="">Sélectionner une tâche</option>';
                problematiqueSelect.innerHTML = '<option value="">Sélectionner une problématique</option>';
                resultatAttenduTextarea.value = '';
                competenceSelect.innerHTML = '<option value="">Sélectionner une compétence</option>';
                etreCapableTextarea.value = '';
                conditionsRessourcesTextarea.value = '';
                criteresEvaluationTextarea.value = '';
                ressourcesDonneesSelect.value = '';
                ressourcesAjouteesTextarea.value = '';
                criteresSpecifiquesTextarea.value = '';
                baremeNotationTextarea.value = '';

                enseignantOutputDiv.textContent = '';
                eleveOutputDiv.textContent = '';
                exportOutputSection.classList.remove('active'); // Cache la section d'export

                afficherPage(0); // Revenir à la première page (indice 0)
                alert('Formulaire effacé !');
            }
        });
    }

    // Initialisation : Afficher la première page au chargement
    afficherPage(0);
}

// Lancer le chargement des données au chargement de la page
document.addEventListener('DOMContentLoaded', loadData);
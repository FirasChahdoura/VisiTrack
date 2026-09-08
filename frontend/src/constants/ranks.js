export const RANKS = [
  { value: 'ProfesseurEcolesPrimaires', label: 'Professeur des écoles primaires' },
  { value: 'ProfesseurEcolesPrimairesHorsClasse', label: 'Professeur des écoles primaires hors classe' },
  { value: 'ProfesseurEcolesPrimairesHorsClasseEmerite', label: 'Professeur des écoles primaires hors classe émérite' },
  { value: 'ProfesseurPrincipalEcolesPrimaires', label: 'Professeur principal des écoles primaires' },
  { value: 'ProfesseurPrincipalHorsClasseEcolesPrimaires', label: 'Professeur principal hors classe des écoles primaires' },
  { value: 'ProfesseurEmeriteEcolesPrimaires', label: 'Professeur émérite des écoles primaires' },
  { value: 'Stagiaire1ereAnnee', label: 'Stagiaire 1ère année' },
  { value: 'Stagiaire2emeAnnee', label: 'Stagiaire 2ème année' },
  { value: 'Contractuelle', label: 'Contractuelle' },
];

// Ranks that do NOT get a nomination date
export const NON_TITULARISE_RANKS = ['Stagiaire1ereAnnee', 'Stagiaire2emeAnnee', 'Contractuelle'];

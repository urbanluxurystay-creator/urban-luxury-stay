# Urban Luxury Stay — code source du site

Site 100 % statique : HTML + CSS + JS, sans installation, sans dépendance
(les seules ressources externes sont les polices Google Fonts, chargées
depuis Internet). Il fonctionne aussi bien en local qu'hébergé sur
GitHub Pages.

## 1. Arborescence à créer

```
urban-luxury-stay/
├── index.html            ← la page (toutes les « pages » du site sont gérées en JS)
├── style.css              ← toute la mise en forme
├── config.js               ← TOUT ce que vous modifiez vous-même (logements, prix, textes, WhatsApp, images…)
├── script.js               ← le fonctionnement du site (à ne modifier que si vous savez coder)
├── favicon.svg
├── .nojekyll               ← fichier vide, nécessaire pour GitHub Pages
├── assets/                 ← vidéo du hero si vous utilisez une vidéo plutôt qu'une photo
└── images/
    ├── hero/                ← LA photo d'accueil (ex. Casa Finance City de nuit)
    ├── apartments/
    │   ├── penthouse-marina/
    │   ├── villa-anfa-royale/
    │   ├── suite-corniche-ocean/
    │   ├── loft-gauthier/
    │   ├── villa-californie-jardin/
    │   └── bourgogne-signature/
    └── pages/                ← photos optionnelles pour les blocs « fidélité / guide / à propos »
```

Chaque dossier `images/…` contient un fichier `.gitkeep` vide, juste pour
que le dossier existe sur GitHub (Git n'enregistre pas les dossiers
vides). Vous pouvez le supprimer une fois que vous avez ajouté vos
photos dedans.

## 2. Où mettre vos photos, et comment les appeler

Tout se passe dans **config.js**, rien à toucher dans script.js.

**Photo d'accueil (hero)** — mettez le fichier dans `images/hero/`,
par exemple `images/hero/cfc-night.jpg`, puis en haut de `config.js` :
```js
heroImage:'images/hero/cfc-night.jpg',
```
Tant que ce fichier n'existe pas (ou que le chemin est faux), une
animation de ville dorée s'affiche à la place — le site ne casse
jamais, il se rabat automatiquement sur l'illustration.

**Photos d'un logement** — mettez vos fichiers dans le dossier du
logement concerné, puis listez-les dans `config.js`, dans le bloc
`ULS_APTS`, sur la ligne `photos:[]` de ce logement :
```js
photos:[
  'images/apartments/penthouse-marina/1.jpg',
  'images/apartments/penthouse-marina/2.jpg',
  'images/apartments/penthouse-marina/3.jpg'
],
```
La 1ʳᵉ photo de la liste sert de vignette sur la page « Appartements ».
Tant que `photos` est vide, une illustration remplace les vraies
photos.

**Photos des blocs « Fidélité / Guide / À propos »** (les images en
arche sur l'accueil et la page à propos) — optionnel, dans `config.js` :
```js
images:{loyalty:'images/pages/loyalty.jpg', guide:'images/pages/guide.jpg', about:'images/pages/about.jpg'},
```

## 3. Vos réglages (dans config.js)

- `whatsapp` : votre numéro, sans le `+` (ex. `212600000000`)
- `email`, `instagram`, `tiktok`
- La liste des logements `ULS_APTS` : nom, quartier, prix, capacité,
  équipements, description en français/anglais/arabe
- Le guide de Casablanca `ULS_GUIDE`
- Les avis `ULS_REVIEWS` (avis génériques utilisés par défaut) — ou,
  pour un logement précis, ajoutez un champ `reviews:[...]` avec vos
  vrais avis, au même format
- **La tarification dynamique**, expliquée ci-dessous

## 4. Tarification dynamique (week-end / haute saison / dates spéciales)

Toujours dans `config.js` :
```js
weekendMultiplier:1.25,           // +25% les nuits de vendredi et samedi
weekendNights:[5,6],               // 5=nuit du vendredi, 6=nuit du samedi
highSeason:[
  {from:'06-15', to:'09-15', multiplier:1.3, label:{fr:'Haute saison été', ...}}
],
specialDates:[
  {date:'02-14', multiplier:1.6, label:{fr:'Saint-Valentin', ...}},
  {date:'12-31', multiplier:1.6, label:{fr:'Réveillon du Nouvel An', ...}}
]
```
Le prix affiché sur les cartes (« à partir de… ») reste le prix de
base d'une nuit en semaine. Le total exact est recalculé nuit par nuit
dès que le client choisit ses dates, sur la fiche du logement et dans
le message WhatsApp envoyé. Une nuit ne cumule qu'une seule majoration
(la plus forte des trois s'applique, elles ne s'additionnent pas).
Ajoutez, modifiez ou supprimez librement des lignes dans `highSeason`
et `specialDates`.

## 5. Dates déjà réservées (bloquer un logement sur une période)

Le site n'a pas de serveur : il ne peut donc pas savoir tout seul
qu'une réservation a été confirmée sur WhatsApp. **Après chaque
réservation confirmée**, vous devez donc l'ajouter vous-même dans
`config.js`, sur le logement concerné :
```js
blockedDates:[
  {from:'2026-10-05', to:'2026-10-08'}   // from = arrivée, to = départ (non compris)
],
```
Puis republier le site (voir §7). Un client qui essaie de réserver
des dates qui chevauchent une période bloquée reçoit un message
d'indisponibilité et ne peut pas envoyer la demande sur WhatsApp.
C'est une solution simple, fiable, mais manuelle — voir la section
« Pour aller plus loin » ci-dessous si vous voulez que ce soit
automatique.

## 6. Dépendances / installations

Aucune. Pas de Node, pas de build, pas de `npm install`. Le site
s'ouvre tel quel dans un navigateur (double-cliquez sur `index.html`),
ou peut être déposé sur n'importe quel hébergement statique.
Seule connexion Internet nécessaire : le chargement des polices
Google Fonts (sinon, le site utilise une police système de secours).

## 7. Publier sur GitHub Pages

1. Créez un dépôt GitHub (ex. `urban-luxury-stay`), public.
2. Mettez-y tous les fichiers de ce dossier, en conservant
   exactement la même arborescence (`git add . && git commit -m "site" && git push`,
   ou glisser-déposer les fichiers dans l'interface GitHub).
3. Dans le dépôt : **Settings → Pages → Build and deployment → Source :
   Deploy from a branch**, branche `main`, dossier `/ (root)` → Save.
4. Après 1–2 minutes, le site est en ligne à l'adresse indiquée en
   haut de cette même page (en général
   `https://votre-compte.github.io/urban-luxury-stay/`).
5. Le fichier `.nojekyll` est là pour éviter que GitHub Pages
   n'ignore certains dossiers — ne le supprimez pas.

Pour un nom de domaine personnalisé (ex. `urbanluxurystay.ma`),
ajoutez-le dans Settings → Pages → Custom domain, puis configurez
chez votre registrar un enregistrement CNAME pointant vers
`votre-compte.github.io`.

## 8. Pour aller plus loin (calendrier automatique, espace équipe, comptes clients)

Un site purement statique comme celui-ci (fichiers HTML/CSS/JS,
hébergé sur GitHub Pages) n'a pas de base de données ni de serveur.
Il ne peut donc pas, à lui seul :
- mettre à jour automatiquement les dates disponibles dès qu'une
  réservation est validée sur WhatsApp (aujourd'hui : mise à jour
  manuelle, voir §5) ;
- offrir un espace de connexion pour votre équipe avec la liste des
  clients et leurs points fidélité ;
- créer un vrai « compte client » qui retrouve ses points d'une
  visite à l'autre.

Ce sont les mêmes trois besoins au fond : un endroit unique, en ligne,
où sont stockées les réservations et les données clients, que le
site (et vous) peuvent lire et écrire. Cela demande un service
supplémentaire, en plus des fichiers statiques. Je n'ai pas connecté
cela pour l'instant afin de ne pas ajouter de compte externe sans
votre accord. Dites-moi quand vous voulez avancer là-dessus.

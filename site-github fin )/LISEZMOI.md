# Alliance Properties — site + espace agent (GitHub + Supabase)

## Comment ça marche (en 3 lignes)
- **GitHub** héberge le site (gratuit, via GitHub Pages).
- **Supabase** (gratuit) garde les biens, les photos et le mot de passe de l'agent.
- Le site public est `index.html`, l'espace de l'agent est `admin.html` (connexion email + mot de passe).
  Un bien ajouté, modifié ou supprimé dans l'admin apparaît tout de suite sur le site.

## Contenu du dossier
Tous les fichiers sont dans UN SEUL dossier, sans sous-dossier :
```
index.html        site public
admin.html        espace de l'agent (CRUD + photos)
config.js         réglages (clés Supabase, téléphone, email)
seed.js           les 8 biens de départ (mode démo)
supabase.sql      à coller dans Supabase (pas besoin sur GitHub)
robots.txt, .nojekyll   (laisser tels quels)
```

## ÉTAPE 1 — Supabase (base de données, 10 min)
1. supabase.com → **Start your project** → connexion (GitHub ou email) → **New project**. Nom : `alliance`. Choisissez un mot de passe de base (notez-le, il ne sert pas au site) et la région la plus proche (Europe). Attendez 1-2 min.
2. Menu gauche **SQL Editor** → **New query**. Ouvrez `supabase.sql` (Bloc-notes), Ctrl+A, Ctrl+C, collez dans Supabase, cliquez **Run**. Résultat attendu : *Success. No rows returned*.
3. **Table Editor → listings** : vous devez voir les 8 biens.
4. **Authentication → Sign In / Providers → Email** : désactivez **Allow new users to sign up** (inscriptions fermées), **Save**.
5. **Authentication → Users → Add user → Create new user** :
   - Email : `alliancepropertiesnadlan@gmail.com`
   - Mot de passe : l'agent le choisit lui-même (8 caractères minimum). **Ne l'écrivez dans aucun fichier ni message.**
   - Cochez **Auto Confirm User** → **Create user**.
   - Faites pareil pour votre propre email si vous voulez aussi accéder à l'admin.
6. Récupérez les 2 informations pour le site :
   - bouton **Connect** (en haut) ou **Project Settings → API** : **Project URL** (`https://xxxx.supabase.co`)
   - la clé **anon public** ou **Publishable key**. Jamais la clé *service_role* / *secret*.

## ÉTAPE 2 — Remplir config.js
Ouvrez `config.js` avec le Bloc-notes. Collez entre les guillemets :
```
SUPABASE_URL: "https://xxxx.supabase.co",
SUPABASE_ANON_KEY: "votre-clé-anon",
```
Le téléphone, WhatsApp et email de l'agent sont déjà remplis. Enregistrez (Ctrl+S). Vérifiez que le fichier s'appelle bien `config.js` et pas `config.js.txt`.

## ÉTAPE 3 — GitHub (mettre les fichiers en ligne)
Votre dépôt existe déjà : `github.com/ichaysit/alliance-propretis`. Il doit être **Public** (Settings → General → tout en bas *Danger Zone* → Change visibility), car GitHub Pages gratuit exige un dépôt public. La clé « anon » de Supabase est faite pour être publique, la sécurité vient des règles du fichier SQL.

1. Dézippez `site-github.zip` sur votre ordinateur.
2. Ouvrez le dépôt sur GitHub → **Add file → Upload files**.
3. Ouvrez le dossier dézippé, sélectionnez **tous les fichiers** (Ctrl + A) et glissez-les d'un coup dans la page GitHub. Il n'y a aucun sous-dossier.
   - `.nojekyll` est un fichier caché : s'il n'apparaît pas, ce n'est pas grave.
4. En bas : **Commit changes** (message libre, ex. « site »).
5. Vérifiez dans le dépôt que vous voyez bien `index.html` et `admin.html` au même endroit, à la racine. **Supprimez l'ancien dossier `admin`** s'il existe déjà dans le dépôt (ouvrir le dossier, puis `...` > Delete directory).

## ÉTAPE 4 — Activer GitHub Pages
1. Dépôt → **Settings → Pages**.
2. **Source** : *Deploy from a branch*. **Branch** : `main`, dossier `/ (root)` → **Save**.
3. Attendez 1 à 2 minutes, rechargez. L'adresse apparaît en haut :
   - site public : `https://ichaysit.github.io/alliance-propretis/`
   - espace agent : `https://ichaysit.github.io/alliance-propretis/admin.html`

## ÉTAPE 5 — Premier test
1. Ouvrez l'adresse de l'admin (`…/admin.html`) → connexion avec l'email de l'agent et son mot de passe.
2. **+ Ajouter un bien** : remplissez, **Choisir des fichiers** pour envoyer des photos (elles sont réduites automatiquement), **Enregistrer**.
3. Ouvrez le site public, rechargez (Ctrl+F5) : le bien est là.
4. Supprimez le bien de test.

## ÉTAPE 6 — Formulaire de contact
Le formulaire envoie un email à `CONTACT_EMAIL` (dans config.js) via le service gratuit FormSubmit.
**Au tout premier envoi**, FormSubmit envoie un email de confirmation à cette adresse : ouvrez-le et cliquez sur **Activate**. Faites un message de test depuis le site ensuite. Regardez aussi les spams.

## ÉTAPE 7 — Domaine IONOS (facultatif)
1. GitHub → Settings → Pages → **Custom domain** : `www.votredomaine.fr` → Save.
2. IONOS → Domaines → votre domaine → DNS : ajoutez un **CNAME** `www` → `ichaysit.github.io`.
3. Pour le domaine sans www : 4 enregistrements **A** vers `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (vérifiez ces adresses dans la documentation GitHub Pages).
4. Quand GitHub valide, cochez **Enforce HTTPS**. L'admin sera alors à `www.votredomaine.fr/admin.html`.

## Utilisation par l'agent
- Connexion : `…/admin.html` avec email + mot de passe.
- **Ajouter / Modifier / Supprimer** un bien. **Masquer** = le bien reste dans l'admin mais disparaît du site.
- Photos : bouton « Choisir des fichiers » (plusieurs à la fois) ou coller le lien d'une image. ★ = photo principale (la première). × = retirer.
- **Mon mot de passe** : pour le changer.
- Les messages du formulaire arrivent par email.

## Si ça ne marche pas
| Symptôme | Cause probable |
|---|---|
| Bandeau jaune « Mode démo » dans l'admin | `SUPABASE_URL` / clé vides ou mal collés dans config.js |
| « Email ou mot de passe incorrect » | utilisateur pas créé / pas « Auto Confirm » dans Supabase |
| Site : « Impossible de charger les biens » | URL/clé fausses, ou projet Supabase en pause (voir ci-dessous) |
| Erreur à l'envoi de photo | le SQL n'a pas été exécuté en entier (bucket `photos`) |
| Page 404 sur l'adresse GitHub | Pages pas activé, ou index.html pas à la racine |
| Modification invisible | recharger avec Ctrl+F5 |

**Supabase gratuit** : un projet inactif 7 jours est mis en pause. Il suffit de cliquer **Restore** sur supabase.com. Tant que le site reçoit des visites, il reste actif.

## Sécurité
- Ne mettez jamais de mot de passe dans les fichiers ni dans GitHub. Les mots de passe sont gérés uniquement par Supabase.
- Seules les personnes créées dans Supabase peuvent modifier les biens ; le public ne voit que les biens « publiés ».

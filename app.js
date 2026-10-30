const cols = {
  clients: ["nom", "prenom", "email", "telephone", "adresse"],
  reclamations: ["client", "objet", "description", "statut", "date_creation"],
};
const donnees = { clients: [], reclamations: [] };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const classe = { "Ouverte": "ouverte", "En cours": "encours", "Résolue": "resolue", "Clôturée": "cloturee" };
const cellule = (c, v) => (c === "statut" ? `<span class="badge ${classe[v] || ""}">${esc(v)}</span>` : esc(v));

function api(t, methode = "GET", corps = null, id = "") {
  return fetch(`api.php?t=${t}${id ? "&id=" + id : ""}`, {
    method: methode,
    headers: { "Content-Type": "application/json" },
    body: corps ? JSON.stringify(corps) : undefined,
  }).then((r) => r.json());
}

async function charger(t) {
  const res = await api(t);
  if (!Array.isArray(res)) return alert(res.erreur || "Erreur serveur");
  donnees[t] = res;
  document.getElementById("liste-" + t).innerHTML = res
    .map(
      (r) => `<tr>${cols[t].map((c) => `<td>${cellule(c, r[c])}</td>`).join("")}
        <td>
          <button onclick="modifier('${t}', ${r.id})">Modifier</button>
          <button class="suppr" onclick="supprimer('${t}', ${r.id})">Supprimer</button>
        </td></tr>`
    )
    .join("") || '<tr><td colspan="6" class="vide">Aucun élément pour le moment.</td></tr>';
  afficherStats();
  if (t === "clients") {
    document.querySelector("#form-reclamations [name=client_id]").innerHTML = res
      .map((c) => `<option value="${c.id}">${esc(c.nom + " " + c.prenom)}</option>`)
      .join("");
  }
}

function afficherStats() {
  const r = donnees.reclamations;
  const n = (s) => r.filter((x) => x.statut === s).length;
  const cartes = [
    ["👥", donnees.clients.length, "Clients"],
    ["📋", r.length, "Réclamations"],
    ["🟠", n("Ouverte") + n("En cours"), "À traiter"],
    ["✅", n("Résolue") + n("Clôturée"), "Traitées"],
  ];
  document.getElementById("stats").innerHTML = cartes
    .map(([i, v, l]) => `<div class="carte"><span class="ico">${i}</span><div><strong>${v}</strong><small>${l}</small></div></div>`)
    .join("");
}

function modifier(t, id) {
  const r = donnees[t].find((x) => x.id == id);
  const f = document.getElementById("form-" + t);
  for (const el of f.elements) if (el.name && r[el.name] != null) el.value = r[el.name];
  f.scrollIntoView();
}

async function supprimer(t, id) {
  if (!confirm("Supprimer cet élément ?")) return;
  await api(t, "DELETE", null, id);
  await charger(t);
  if (t === "clients") charger("reclamations"); // les réclamations du client sont supprimées aussi
}

for (const t of ["clients", "reclamations"]) {
  document.getElementById("form-" + t).addEventListener("submit", async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.target));
    const id = d.id;
    delete d.id;
    if (d.client_id) d.client_id = Number(d.client_id);
    const res = await api(t, id ? "PUT" : "POST", d, id);
    if (res.erreur) return alert(res.erreur);
    e.target.reset();
    charger(t);
  });
}

document.querySelectorAll("nav button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll("nav button").forEach((x) => x.classList.toggle("actif", x === b));
    document.querySelectorAll("main section").forEach((s) => (s.hidden = s.id !== b.dataset.tab));
  })
);

charger("clients").then(() => charger("reclamations"));
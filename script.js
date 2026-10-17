const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const STORAGE_PETS = "mypet_profiles_v1";
const STORAGE_NOTES = "mypet_care_notes_v1";
let audioContext;
let activeOscillators = [];
let toastTimer;

function safeRead(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
}
function safeWrite(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { showToast("Browser storage is unavailable. Your change may not be saved."); return false; }
}
function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) {
    $("#soundStatus").textContent = "Audio playback is not supported in this browser.";
    return null;
  }
  if (!audioContext) audioContext = new Ctx();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}
function stopSound() {
  activeOscillators.forEach(node => { try { node.stop(); } catch {} });
  activeOscillators = [];
  $$(".is-playing").forEach(el => { el.classList.remove("is-playing"); if (el.classList.contains("sound-button")) el.textContent = "▶"; });
}
function tone(ctx, {freq=440, endFreq=freq, start=0, duration=.2, type="sine", volume=.08, attack=.015}) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(30, freq), ctx.currentTime + start);
  if (endFreq !== freq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), ctx.currentTime + start + duration);
  gain.gain.setValueAtTime(.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), ctx.currentTime + start + attack);
  gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + start + duration);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + duration + .02);
  activeOscillators.push(osc);
}
function playSound(kind, sourceEl) {
  stopSound();
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  if (kind === "cat") {
    // A playful synthesised meow-like glide, not a field recording.
    tone(ctx,{freq:520,endFreq:760,start:0,duration:.18,type:"triangle",volume:.065});
    tone(ctx,{freq:760,endFreq:390,start:.17,duration:.38,type:"triangle",volume:.07});
    tone(ctx,{freq:390,endFreq:300,start:.52,duration:.17,type:"sine",volume:.04});
  } else if (kind === "dog") {
    // Two short, rounded synthetic bark-like bursts.
    [0,.23].forEach((t,i) => {
      tone(ctx,{freq:i?210:165,endFreq:i?115:95,start:t,duration:.12,type:"sawtooth",volume:.07,attack:.008});
      tone(ctx,{freq:340,endFreq:190,start:t+.015,duration:.075,type:"triangle",volume:.025,attack:.005});
    });
  } else if (kind === "bird") {
    // A small sequence of synthetic chirps.
    [[1250,1850,0],[1650,2200,.13],[1450,2050,.28],[1900,2400,.44],[1550,2050,.62]].forEach(([f,e,t]) => tone(ctx,{freq:f,endFreq:e,start:t,duration:.095,type:"sine",volume:.04,attack:.008}));
  }
  if (sourceEl) {
    sourceEl.classList.add("is-playing");
    if (sourceEl.classList.contains("sound-button")) sourceEl.textContent = "♪";
  }
  const labels = {cat:"Playing a playful, synthesised meow.",dog:"Playing a playful, synthesised bark.",bird:"Playing bright, synthesised chirps."};
  $("#soundStatus").textContent = labels[kind] || "Playing sound.";
  setTimeout(() => {
    $$(".is-playing").forEach(el => {el.classList.remove("is-playing"); if(el.classList.contains("sound-button")) el.textContent="▶";});
    $("#soundStatus").textContent = "Sound is off until you choose to play.";
  }, 1050);
}
$$("[data-sound]").forEach(button => button.addEventListener("click", () => playSound(button.dataset.sound, button)));
$("#heroSound").addEventListener("click", () => {
  $("#sounds").scrollIntoView({behavior:"smooth"});
  setTimeout(() => playSound("bird", $("#heroSound")), 350);
});
$("#year").textContent = new Date().getFullYear();

const menuToggle = $("#menuToggle");
menuToggle.addEventListener("click", () => {
  const nav = $(".main-nav");
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
$$(".main-nav a").forEach(a => a.addEventListener("click", () => {
  $(".main-nav").classList.remove("open"); menuToggle.setAttribute("aria-expanded","false");
}));

const petDialog = $("#petDialog");
function openPetDialog(kind="Dog") {
  $("#petSpecies").value = ["Dog","Cat","Bird","Rabbit","Fish","Other"].includes(kind) ? kind : "Other";
  $("#petForm").reset();
  $("#petSpecies").value = ["Dog","Cat","Bird","Rabbit","Fish","Other"].includes(kind) ? kind : "Other";
  $("#petFormMessage").textContent = "";
  if (typeof petDialog.showModal === "function") petDialog.showModal();
  else showToast("Please use a modern browser to create a pet profile.");
}
$("#addPetButton").addEventListener("click", () => openPetDialog("Other"));
$("#closeDialog").addEventListener("click", () => petDialog.close());
$$(".profile-open").forEach(btn => btn.addEventListener("click", () => openPetDialog(btn.dataset.kind)));
petDialog.addEventListener("click", e => { if (e.target === petDialog) petDialog.close(); });

const speciesEmoji = {Dog:"🐕",Cat:"🐈",Bird:"🦜",Rabbit:"🐇",Fish:"🐠",Other:"🐾"};
function renderPets() {
  const pets = safeRead(STORAGE_PETS);
  $("#customPets").hidden = pets.length === 0;
  $("#savedCount").textContent = `${pets.length} ${pets.length === 1 ? "pet" : "pets"}`;
  $("#savedPetList").replaceChildren();
  pets.forEach(pet => {
    const card = document.createElement("article"); card.className = "saved-pet";
    const icon = document.createElement("span"); icon.className = "saved-pet-icon"; icon.textContent = speciesEmoji[pet.species] || "🐾";
    const body = document.createElement("div");
    const title = document.createElement("h4"); title.textContent = pet.name;
    const detail = document.createElement("p");
    detail.textContent = [pet.species,pet.breed,pet.age].filter(Boolean).join(" · ") + (pet.personality ? ` · ${pet.personality}` : "");
    const note = document.createElement("p"); note.textContent = pet.notes || "A new member of the family.";
    const remove = document.createElement("button"); remove.className = "remove-pet"; remove.type = "button"; remove.textContent = "Remove profile";
    remove.addEventListener("click", () => {
      const updated = safeRead(STORAGE_PETS).filter(p => p.id !== pet.id);
      safeWrite(STORAGE_PETS, updated); renderPets(); showToast("Pet profile removed from this browser.");
    });
    body.append(title,detail,note,remove); card.append(icon,body); $("#savedPetList").append(card);
  });
}
$("#petForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const pet = {
    id: (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2),
    name: String(form.get("name")||"").trim(),
    species: String(form.get("species")||"Other"),
    breed: String(form.get("breed")||"").trim(),
    age: String(form.get("age")||"").trim(),
    personality: String(form.get("personality")||"Curious"),
    notes: String(form.get("notes")||"").trim(),
    createdAt: new Date().toISOString()
  };
  if (!pet.name) { $("#petFormMessage").textContent = "Please add your pet’s name."; return; }
  const pets = safeRead(STORAGE_PETS); pets.unshift(pet);
  if (safeWrite(STORAGE_PETS,pets)) {
    renderPets(); petDialog.close(); showToast(`${pet.name}’s profile has been saved on this device.`);
    $("#companions").scrollIntoView({behavior:"smooth"});
  }
});
renderPets();

function renderNotes() {
  const notes = safeRead(STORAGE_NOTES);
  $("#notesWrap").hidden = notes.length === 0;
  $("#notesList").replaceChildren();
  notes.slice(0,12).forEach(note => {
    const card = document.createElement("article"); card.className = "note-card";
    const type = document.createElement("div"); type.className = "note-type"; type.textContent = note.type;
    const title = document.createElement("h4"); title.textContent = note.pet;
    const body = document.createElement("p"); body.textContent = note.note;
    const date = document.createElement("time"); date.dateTime = note.createdAt; date.textContent = new Date(note.createdAt).toLocaleString();
    card.append(type,title,body,date); $("#notesList").append(card);
  });
}
$("#careForm").addEventListener("submit", e => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const note = {id:Date.now(),pet:String(form.get("pet")||"").trim(),type:String(form.get("type")||"Daily routine"),note:String(form.get("note")||"").trim(),createdAt:new Date().toISOString()};
  if (!note.pet || !note.note) return;
  const notes = safeRead(STORAGE_NOTES); notes.unshift(note);
  if (safeWrite(STORAGE_NOTES,notes)) {
    e.currentTarget.reset(); renderNotes();
    $("#careMessage").textContent = "Saved on this device.";
    showToast("Care note saved.");
  }
});
$("#clearNotes").addEventListener("click", () => {
  if (confirm("Clear all care notes saved in this browser?")) {
    safeWrite(STORAGE_NOTES,[]); renderNotes(); $("#careMessage").textContent = "Care notes cleared.";
  }
});
renderNotes();

type Person = {
  // Grazie a READONLY sappiamo che queste due proprietà non sono modificabili
  readonly id: number,
  readonly name: string,
  birth_year: number,
  // Tramite (?) stabilisco che è un campo condizionale, infatti la persona potrebbe essere ancora in vita
  death_year?: number,
  biography: string,
  image: string,
}

// Scritto al singolare perchè, nonostante rappresenti una lista, viene usato solo un valore per volta
type ActressNationality =
  // Ciascuna stringa è di tipo STRING, ed è un valore specifico
  | "American"
  | "British"
  | "Australian"
  | "Israeli-American"
  | "South African"
  | "French"
  | "Indian"
  | "Israeli"
  | "Spanish"
  | "South Korean"
  | "Chinese"


type Actress = Person & {
  // Uso una TUPLE, ovvero una struttura predefinita di un Array che contiene quel tipo di elementi in quel dato ordine
  most_famous_movies: [string, string, string],
  awards: string,
  // Utilizzando il mio ALIAS, so che questa chiave può essere uguale solo a uno dei valori della mia lista e nessun altro tipo o valore
  nationality: ActressNationality,
}


// TYPEGUARD
// Mi servo di una funzione di supporto TYPEGUARD che verifichi se i dati ricevuti siano nel formato e del TYPE che mi serve.
// Tramite IS specifico che il RETURN (dopo i due punti dopo i parametri) deve essere un ALIAS di Actress.
function isActress(dati: unknown): dati is Actress {
  return (
    // Dati deve essere un TRUTHY quindi uso l'operatore && per dirgli che deve esistere prima di tutto
    typeof dati === 'object' &&
    dati !== null &&

    // Verifico che l'OBJECT "dati" contenga effettivamente la KEY (in questo caso "id")
    "id" in dati &&
    typeof dati.id === 'number' &&

    // Procedo in questo modo per tutte le KEY che voglio verificare
    "name" in dati && typeof dati.name === 'string' &&
    "birth_year" in dati && typeof dati.birth_year === 'number' &&
    "death_year" in dati && typeof dati.death_year === 'number' &&
    "biography" in dati && typeof dati.biography === 'string' &&
    "image" in dati && typeof dati.image === 'string' &&

    "most_famous_movies" in dati &&
    dati.most_famous_movies instanceof Array &&
    dati.most_famous_movies.length === 3 &&
    dati.most_famous_movies.every(m => typeof m === 'string') &&

    "awards" in dati && typeof dati.awards === 'string' &&
    "nationality" in dati && typeof dati.nationality === 'string'
  )
}


// Il RETURN è una PROMISE, in quanto stiamo eseguendo un Fetch, e i dati della promise devono essere un ALIAS di Actress oppure null.
async function getActress(id: number): Promise<Actress | null> {
  try {
    const response = await fetch(`https://boolean-spec-frontend.vercel.app/freetestapi/actresses/:${id}`);
    // Per TS la Response è sempre di tipo ANY (che non va bene perchè disabilità l'evidenziazione di errori), quindi gli assegno UNKNOWN
    const dati: unknown = await response.json();
    // Visto che è UNKNOWN, devo sfruttare una TYPE-NARROWING, quindi una verifica
    if (!isActress(dati)) {
      throw new Error('Formato dei dati non valido');
    }
    return dati;
  } catch (error) {
    // Siccome in TS l'errore è inizialmente di tipo UNKNOWN, io devo controllare che effettivamente sia un Error.
    if (error instanceof Error) {
      console.error('Errore durante il recupero dell\'attrice:', error);
    } else {
      // Se non ricevo un OBJECT di tipo Error, voglio stamparmi ciò che ho ricevuto in console.
      console.error('Errore sconosciuto:', error)
    }
    return null;
  }
}


async function getAllActresses(): Promise<Actress[]> {
  try {
    const response = await fetch('https://boolean-spec-frontend.vercel.app/freetestapi/actresses');
    if (!response.ok) {
      throw new Error(`Errore HTTP ${response.status}:  ${response.statusText}`)
    }
    const dati = await response.json();
    if (!(dati instanceof Array)) {
      throw new Error('Formato dei dati non valido: non è un Array!')
    }
    // Qui controllo se effettivamente ogni elemento dell'Array sia un ALIAS di Actress
    const attriciValide: Actress[] = dati.filter(a => isActress(a)) // Posso anche scrivere dati.filter(isActress) per eseguire la TYPEGUARD e scriverlo in modo compatto
    return attriciValide; // Non specifico che il RETURN rende un Array di Actress perchè per INFERENCE TS già lo sa e lo deduce.
  } catch (error) {
    if (error instanceof Error) {
      console.error('Errore durante il recupero dell\'attrice:', error);
    } else {
      console.error('Errore sconosciuto:', error)
    }
    // Se c'è un errore in questo caso ritorno un Array vuoto.
    return [];
  }
}


async function getActresses(ids: number[]): Promise<(Actress | null)[]> {
  try {
    // Creo il mio Array di Promises tramite MAP per comodità
    const promises = ids.map(id => getActress(id));
    const actresses = await Promise.all(promises);
    return actresses;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Errore durante il recupero dell\'attrice:', error);
    } else {
      console.error('Errore sconosciuto:', error)
    }
    // Se c'è un errore in questo caso ritorno un Array vuoto.
    return [];
  }
}


// Per servirmi di tutte le proprietà dell'ALIAS Actress tranne l'id, sfrutto l'Omit, perchè l'id lo andrò a creare io.
function createActress(data: Omit<Actress, "id">): Actress {
  return {
    ...data,
    // Qui andrebbe eseguita la mia funzione centralizzata per creare id, ma in questo caso sfrutto un banale Math.random per dimostrazione
    id: Math.floor(Math.random() * 10000),
  }
}


// Sfrutto il PARTIAL per poter modificare una qualunque delle KEY della Actress a mio piacimento
function updateActress(actress: Actress, updates: Partial<Omit<Actress, "id" | "name">>): Actress {

  // V1
  // Faccio il RETURN riutilizzando id e name, in modo tale che qualsiasi cosa io faccia vengano ritilizzati i valori originali
  // return {
  //   ...actress,
  //   ...updates,
  //   id: actress.id,
  //   name: actress.name,
  // }

  // V2
  // Per non sovradcrivere "name" e "id" posso sfruttare OMIT nei parametri che passo, così da escludere modifiche a "id" e "name"
  return {
    ...actress,
    ...updates,
  }
}
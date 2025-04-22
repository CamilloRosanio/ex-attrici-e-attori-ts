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
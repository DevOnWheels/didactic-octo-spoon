-- Realistische Demo-Inhalte für "Keramikwerkstatt Lehmglück" (siehe README, Abschnitt Demo-Daten).
-- image_path bleibt zunächst leer; Bilder werden nach dem Upload in den "media"-Bucket ergänzt
-- (Dateiname z.B. 'posts/brennofen.jpg', dann per UPDATE eingetragen).

insert into public.posts (title, slug, excerpt, body, published) values
(
  'Wie ein Krug im Brennofen sein Gesicht bekommt',
  'brennofen-krug',
  'Vom feuchten Ton zur fertigen Glasur: ein Blick in unseren Brennofen und was bei 1250°C wirklich passiert.',
  'Bevor eine Tasse oder ein Krug bei uns aus der Werkstatt geht, durchläuft er zwei Brände. Der erste Brand, der Schrühbrand, härtet den getrockneten Ton bei rund 950°C zu porösem Scherben. Erst danach kommt die Glasur zum Einsatz – aufgetragen per Tauchbad oder Pinsel. Der zweite Brand, der Glattbrand, erreicht je nach Glasur zwischen 1200°C und 1280°C. In dieser Hitze verschmilzt die Glasur zu einer glasartigen, wasserdichten Schicht. Der Ofen braucht für einen vollen Zyklus – Aufheizen, Halten, kontrolliertes Abkühlen – etwa 18 Stunden. Wer bei einem unserer Werkstattbesuche vorbeischaut, darf gerne einen Blick durch das Guckloch werfen, wenn gerade gebrannt wird.',
  true
),
(
  'Töpferkurse für Einsteiger: was euch in den ersten zwei Stunden erwartet',
  'toepferkurse-einsteiger',
  'Kein Vorwissen nötig: unser Grundkurs an der Scheibe erklärt, wie ihr aus einem Klumpen Ton ein erstes Gefäß zentriert.',
  'Unser Einsteigerkurs beginnt immer mit dem Zentrieren – dem schwierigsten und wichtigsten Schritt an der Töpferscheibe. Bevor überhaupt an Formen zu denken ist, muss der Ton exakt in der Mitte der rotierenden Scheibe sitzen, sonst "eiert" jedes weitere Gefäß. Wir nehmen uns dafür bewusst die erste Stunde Zeit, auch wenn das frustrierend sein kann. In der zweiten Stunde öffnen wir den zentrierten Klumpen und ziehen die ersten Wände hoch – meist entsteht dabei eine kleine Schale. Der Kurs findet in Gruppen von maximal sechs Personen statt, damit wir wirklich jedem über die Schulter schauen können. Mitzubringen ist nichts außer Kleidung, die Tonspritzer verträgt.',
  true
),
(
  'Wir sind auf dem Herbstmarkt am Marktplatz vertreten',
  'herbstmarkt-stand',
  'Am ersten Septemberwochenende zeigen wir eine Auswahl aktueller Stücke live vor Ort – inklusive Sonderanfertigungen nach Absprache.',
  'Von Freitag bis Sonntag stehen wir mit einem Stand auf dem herbstlichen Kunsthandwerkermarkt am Marktplatz. Mit dabei ist ein Querschnitt aus unserem aktuellen Sortiment – von Kaffeetassen bis zu größeren Vasen – sowie einige Einzelstücke, die es nicht in den Online-Shop schaffen, weil jedes davon eine eigene Glasur-Laune hatte. Wer vor Ort eine Sonderanfertigung besprechen möchte – etwa eine Serie individueller Tassen für ein Café oder ein Hochzeitsgeschenk – ist herzlich eingeladen, direkt am Stand vorbeizukommen. Für alle, die es nicht schaffen: die Werkstatt ist wie gewohnt nach Vereinbarung geöffnet.',
  true
);

insert into public.products (name, slug, description, price_cents, active) values
(
  'Kaffeetasse "Morgenlicht"',
  'kaffeetasse-morgenlicht',
  'Handgedrehte Kaffeetasse, 250ml, mit heller Reaktionsglasur. Jedes Stück ist ein Unikat mit leicht unterschiedlicher Farbverteilung.',
  1890,
  true
),
(
  'Butterdose mit Deckel',
  'butterdose-gedeckelt',
  'Zweiteilige Butterdose aus Steinzeug, spülmaschinenfest. Der Deckel schließt mit einem leichten Falz, damit die Butter frisch bleibt.',
  3200,
  true
),
(
  'Vase "Schilf", schmal',
  'vase-schilf-schmal',
  'Hochgezogene, schmale Vase für einzelne Stiele oder kleine Sträuße. Höhe ca. 24cm, matte Glasur in Schilfgrün.',
  4500,
  true
),
(
  'Frühstücksschale, klein',
  'fruehstuecksschale-klein',
  'Kleine Schale für Müsli oder Obst, ca. 350ml Fassungsvermögen, innen glasiert, außen naturbelassener Scherben.',
  2400,
  true
);

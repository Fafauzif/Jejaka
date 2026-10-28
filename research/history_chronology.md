# Chronology boundaries for scene construction

The event sequence below is deliberately bounded. Consult the claim ledger for wording, source IDs and evidence limitations. A date in this table is not permission to place a particular event anywhere in the district.

| Period / date | Evidence IDs | Scene rule |
|---|---|---|
| 19 September 1945 | HC001 | The Hotel Yamato flag incident is a separate earlier event. It must not occur simultaneously with the November episode. |
| 25 October | HC002 | Treat arrival context as a separate dated layer. Do not populate all later unit types on this date. |
| 26 October | HC003 | Urban observations from this date may guide a period-prop vocabulary, but not November street-by-street population or traffic. |
| 27–28 October | HC004 | Keep the leaflet episode and the diary’s fighting sequence distinct from the later ultimatum and main November attack. |
| 30 October | HC005 | Mallaby’s death is earlier context. Do not reenact an alleged killer or precise mechanism as settled history. |
| 8–9 November | HC006–HC007 | Different sources refer to different communications. Keep issue, delivery and deadline fields separate. |
| 10 November onward | HC007 | This is the November battle frame. It does not mean all destruction happened on the opening morning. |
| 13 November | HC010 | An unnamed government building in one dispatch cannot be automatically identified with a selected landmark. |
| 16 November | HC008–HC009, HC011 | Media metadata and a dispatch supply mid-battle reference points. Neither is a comprehensive snapshot of every location. |
| 28 November | HC012 | Southern operations are outside the proposed core. Do not compress Wonokromo into the Jembatan Merah district. |
| 1951 onward | HC013 | Later monument construction is outside the world date. |
| Recent revitalisation | HC014 | Contemporary park design, memorial furniture and replica vehicles are not original scene geometry. |

## Recommended date policy

Until a day is selected from evidence, name the working scene `Surabaya_Nov1945_BaseSetting`. Keep `scenario_date` null in the build state and explicitly state `historical_time_precision: month`.

For a later daily scenario, make a short date-lock record containing:

- Exact date and local time, if supported.
- Claims used to establish the date.
- Which sources predate that moment and which postdate it.
- Which buildings changed condition during the interval.
- Which battle props are verified, reconstructed or hypothetical.
- Whether the lighting is an artistic presentation or an actual weather/time reconstruction.

If only a later image exists, model its permanent architectural features where appropriate and leave date-specific damage in an unapproved layer. Do not claim that the absence of visible damage in another view proves the entire building was intact.

## Naming and historical labels

Use a canonical asset ID plus aliases. Keep original source spelling in metadata and use a modern name only to help navigation. Surabaya/Soerabaja/Sourabaya spellings refer to the city, not three locations. Canal and street aliases need individual verification. An apparently familiar name such as government building is not a unique identifier.

Do not solve a place-name ambiguity by placing an object at the nearest modern landmark with a similar name. Record candidate identifications and the discriminating evidence needed.

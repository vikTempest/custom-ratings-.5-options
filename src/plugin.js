/// <reference path="./plugin.d.ts" />
/// <reference path="./app.d.ts" />

// AniList Custom Ratings for Seanime
//
// Adds a "Bewerten" button to anime and manga pages (and the media card context menu) that
// opens a rating window with your AniList Advanced Scoring categories (e.g. Story, Characters,
// Visuals, Audio, Enjoyment). The overall score is the average of the rated categories, like on
// AniList. A second button, "Custom Lists", lets you assign the entry to your custom lists.
// Everything is saved directly to AniList.

function init() {
    $ui.register((ctx) => {

        const QUERY_VIEWER = `query {
  Viewer {
    id
    mediaListOptions {
      scoreFormat
      animeList { customLists advancedScoring advancedScoringEnabled }
      mangaList { customLists advancedScoring advancedScoringEnabled }
    }
  }
}`

        const QUERY_ENTRY = `query ($mediaId: Int, $userId: Int) {
  MediaList(mediaId: $mediaId, userId: $userId) {
    id
    status
    score
    advancedScores
    hiddenFromStatusLists
    customLists(asArray: true)
  }
}`

        const MUTATION_SAVE_SCORES = `mutation ($mediaId: Int, $score: Float, $advancedScores: [Float], $status: MediaListStatus) {
  SaveMediaListEntry(mediaId: $mediaId, score: $score, advancedScores: $advancedScores, status: $status) {
    id
    status
    score
    advancedScores
  }
}`

        const MUTATION_SAVE_LISTS = `mutation ($mediaId: Int, $customLists: [String], $hidden: Boolean, $status: MediaListStatus) {
  SaveMediaListEntry(mediaId: $mediaId, customLists: $customLists, hiddenFromStatusLists: $hidden, status: $status) {
    id
    status
    hiddenFromStatusLists
    customLists(asArray: true)
  }
}`

        const MUTATION_ANIME_LISTS = `mutation ($lists: [String]) {
  UpdateUser(animeListOptions: { customLists: $lists }) { id }
}`

        const MUTATION_MANGA_LISTS = `mutation ($lists: [String]) {
  UpdateUser(mangaListOptions: { customLists: $lists }) { id }
}`

        // Score formats that support advanced scoring on AniList, with their range
        const SCALES = {
            POINT_100: { max: 100, decimals: 0, label: "0–100" },
            POINT_10_DECIMAL: { max: 10, decimals: 1, label: "0–10" },
        }

        // Current modal state
        const s = {
            mode: "rating",     // "rating" | "lists"
            media: null,        // { id, title, type: "ANIME" | "MANGA" }
            loading: false,
            saving: false,
            error: "",
            userId: 0,
            scoreFormat: "",
            categories: [],     // advanced scoring categories for this media type
            advancedEnabled: false,
            scores: {},         // category -> string typed by the user
            lists: [],          // custom list names for this media type
            selected: {},       // list name -> boolean
            hidden: false,      // hiddenFromStatusLists
            entryExists: false,
            entryScore: 0,
            newListName: "",
        }

        const modal = ctx.newModal({ title: "AniList" })

        // ---------------------------------------------------------------------------------------------

        function plain(v) {
            // Convert Go values into plain JS objects/arrays
            return v === undefined || v === null ? v : JSON.parse(JSON.stringify(v))
        }

        function getToken() {
            try {
                return $database.anilist.getToken() || ""
            }
            catch (e) {
                return ""
            }
        }

        function query(body) {
            const token = getToken()
            if (!token) throw new Error("Du bist in Seanime nicht bei AniList angemeldet.")
            return plain($anilist.customQuery(body, token))
        }

        function errMsg(e) {
            if (!e) return "Unbekannter Fehler"
            if (typeof e === "string") return e
            return e.message || String(e)
        }

        function titleOf(media) {
            const t = (media && media.title) || {}
            return t.userPreferred || t.english || t.romaji || t.native || ("#" + (media && media.id))
        }

        function scale() {
            return SCALES[s.scoreFormat] || null
        }

        function round(n, decimals) {
            const f = Math.pow(10, decimals)
            return Math.round(n * f) / f
        }

        function formatNum(n) {
            const sc = scale()
            return sc ? String(round(n, sc.decimals)) : String(n)
        }

        // Parses a typed score; returns null when the input is invalid
        function parseScore(str) {
            const sc = scale()
            const t = String(str === undefined || str === null ? "" : str).trim().replace(",", ".")
            if (t === "") return 0
            if (!/^\d+(\.\d+)?$/.test(t)) return null
            const n = parseFloat(t)
            if (!sc || n < 0 || n > sc.max) return null
            return round(n, sc.decimals)
        }

        // Average of all rated (non-zero) categories, like AniList does
        function average() {
            const sc = scale()
            let sum = 0, count = 0
            for (let i = 0; i < s.categories.length; i++) {
                const n = parseScore(s.scores[s.categories[i]])
                if (n === null) return null
                if (n > 0) {
                    sum += n
                    count++
                }
            }
            if (!count) return 0
            return round(sum / count, sc ? sc.decimals : 1)
        }

        function parseEntryCustomLists(raw) {
            // asArray: true -> [{ name, enabled }], fallback: { name: bool }
            const out = {}
            if (!raw) return out
            if (Array.isArray(raw)) {
                for (let i = 0; i < raw.length; i++) {
                    if (raw[i] && raw[i].name) out[raw[i].name] = !!raw[i].enabled
                }
            } else if (typeof raw === "object") {
                for (const k in raw) out[k] = !!raw[k]
            }
            return out
        }

        function refreshCollection(type) {
            try {
                if (type === "MANGA") $anilist.refreshMangaCollection()
                else $anilist.refreshAnimeCollection()
            }
            catch (e) {
                console.warn("anilist-custom-ratings: refresh failed", e)
            }
        }

        // ---------------------------------------------------------------------------------------------

        function load() {
            s.loading = true
            s.error = ""
            modal.update()
            try {
                const viewer = (query({ query: QUERY_VIEWER }) || {}).Viewer
                if (!viewer) throw new Error("AniList-Konto konnte nicht geladen werden.")
                s.userId = viewer.id
                const opts = viewer.mediaListOptions || {}
                const listOpts = (s.media.type === "MANGA" ? opts.mangaList : opts.animeList) || {}
                s.scoreFormat = opts.scoreFormat || ""
                s.categories = (listOpts.advancedScoring || []).filter((n) => !!n)
                s.advancedEnabled = !!listOpts.advancedScoringEnabled
                s.lists = (listOpts.customLists || []).filter((n) => !!n)

                s.scores = {}
                s.selected = {}
                s.hidden = false
                s.entryExists = false
                s.entryScore = 0
                try {
                    const res = query({ query: QUERY_ENTRY, variables: { mediaId: s.media.id, userId: s.userId } })
                    const entry = res && res.MediaList
                    if (entry) {
                        s.entryExists = true
                        s.entryScore = entry.score || 0
                        s.hidden = !!entry.hiddenFromStatusLists
                        s.selected = parseEntryCustomLists(entry.customLists)
                        const adv = entry.advancedScores || {}
                        for (let i = 0; i < s.categories.length; i++) {
                            const v = adv[s.categories[i]]
                            s.scores[s.categories[i]] = v ? formatNum(v) : ""
                        }
                    }
                }
                catch (e) {
                    // AniList answers with "Not Found." when the media is not on the user's list
                    if (!/not found/i.test(errMsg(e))) throw e
                }
            }
            catch (e) {
                s.error = errMsg(e)
            }
            s.loading = false
            modal.update()
        }

        function saveScores() {
            if (s.saving) return
            const advancedScores = []
            for (let i = 0; i < s.categories.length; i++) {
                const n = parseScore(s.scores[s.categories[i]])
                if (n === null) {
                    ctx.toast.warning("\"" + s.categories[i] + "\": bitte eine Zahl von 0 bis " + scale().max + " eingeben.")
                    return
                }
                advancedScores.push(n)
            }
            const score = average()

            s.saving = true
            s.error = ""
            modal.update()
            try {
                const variables = { mediaId: s.media.id, score: score, advancedScores: advancedScores }
                if (!s.entryExists) variables.status = "PLANNING"
                const res = query({ query: MUTATION_SAVE_SCORES, variables: variables })
                const entry = res && res.SaveMediaListEntry
                if (entry) {
                    s.entryExists = true
                    s.entryScore = entry.score || 0
                }
                refreshCollection(s.media.type)
                ctx.toast.success("Bewertung gespeichert: " + formatNum(score))
                modal.close()
            }
            catch (e) {
                s.error = errMsg(e)
                ctx.toast.error("Speichern fehlgeschlagen: " + s.error)
            }
            s.saving = false
            modal.update()
        }

        function saveLists() {
            if (s.saving) return
            s.saving = true
            s.error = ""
            modal.update()
            try {
                const names = s.lists.filter((n) => !!s.selected[n])
                const variables = { mediaId: s.media.id, customLists: names, hidden: s.hidden }
                if (!s.entryExists) variables.status = "PLANNING"
                const res = query({ query: MUTATION_SAVE_LISTS, variables: variables })
                const entry = res && res.SaveMediaListEntry
                if (entry) {
                    s.entryExists = true
                    s.hidden = !!entry.hiddenFromStatusLists
                    s.selected = parseEntryCustomLists(entry.customLists)
                }
                refreshCollection(s.media.type)
                ctx.toast.success(names.length ? "Gespeichert: " + names.join(", ") : "Gespeichert: in keiner Custom List")
                modal.close()
            }
            catch (e) {
                s.error = errMsg(e)
                ctx.toast.error("Speichern fehlgeschlagen: " + s.error)
            }
            s.saving = false
            modal.update()
        }

        function createList() {
            const name = (s.newListName || "").trim()
            if (!name) return
            if (s.lists.some((n) => n.toLowerCase() === name.toLowerCase())) {
                ctx.toast.warning("Die Liste \"" + name + "\" gibt es schon.")
                return
            }
            s.saving = true
            modal.update()
            try {
                const lists = s.lists.concat([name])
                query({
                    query: s.media.type === "MANGA" ? MUTATION_MANGA_LISTS : MUTATION_ANIME_LISTS,
                    variables: { lists: lists },
                })
                s.lists = lists
                s.selected[name] = true
                s.newListName = ""
                ctx.toast.success("Liste \"" + name + "\" angelegt und ausgewählt. Zum Übernehmen auf Speichern klicken.")
            }
            catch (e) {
                ctx.toast.error("Liste konnte nicht angelegt werden: " + errMsg(e))
            }
            s.saving = false
            modal.update()
        }

        function openFor(media, type, mode) {
            if (!media || !media.id) return
            s.mode = mode
            s.media = { id: media.id, title: titleOf(media), type: type }
            s.categories = []
            s.scores = {}
            s.lists = []
            s.selected = {}
            s.newListName = ""
            s.error = ""
            s.loading = true
            modal.open()
            load()
        }

        // ---------------------------------------------------------------------------------------------
        // Rendering

        function renderRating(items, key, kind) {
            const sc = scale()

            if (!sc) {
                items.push(modal.alert({
                    title: "Advanced Scoring nicht möglich",
                    description: "Dein AniList-Bewertungssystem ist \"" + s.scoreFormat + "\". Kategorien gibt es auf AniList nur mit "
                        + "\"100 Point\" oder \"10 Point Decimal\". Stell das auf anilist.co unter Settings → Lists um.",
                    intent: "warning",
                }))
                return
            }
            if (!s.categories.length || !s.advancedEnabled) {
                items.push(modal.alert({
                    title: "Keine Kategorien eingerichtet",
                    description: "Aktiviere auf anilist.co unter Settings → Lists → " + kind + " List das \"Advanced Scoring\" "
                        + "und lege dort deine Kategorien an. Danach erscheinen sie hier.",
                    intent: "info",
                }))
                return
            }

            const rows = s.categories.map((cat) => modal.input({
                label: cat,
                placeholder: sc.label,
                value: s.scores[cat] || "",
                disabled: s.saving,
                onChange: ctx.eventHandler("acr-score-" + key + "-" + cat, (e) => {
                    s.scores[cat] = (e && e.value !== undefined && e.value !== null) ? String(e.value) : ""
                    modal.update()
                }),
            }))
            items.push(modal.stack(rows, { gap: 3 }))

            const avg = average()
            items.push(modal.text(
                avg === null
                    ? "Gesamt: bitte nur Zahlen von 0 bis " + sc.max + " eingeben"
                    : "Gesamt (Durchschnitt): " + (avg ? formatNum(avg) : "–") + " / " + sc.max,
                { className: "font-semibold" },
            ))

            items.push(modal.flex([
                modal.button("Abbrechen", {
                    intent: "gray-subtle",
                    onClick: ctx.eventHandler("acr-cancel", () => modal.close()),
                }),
                modal.button("Speichern", {
                    intent: "primary",
                    loading: s.saving,
                    disabled: s.saving || avg === null,
                    onClick: ctx.eventHandler("acr-save-scores-" + key, () => saveScores()),
                }),
            ], { gap: 2, className: "justify-end" }))
        }

        function renderLists(items, key, kind) {
            if (!s.lists.length) {
                items.push(modal.text("Du hast noch keine " + kind + " Custom Lists. Leg unten eine an.", { className: "text-[--muted]" }))
            }

            const checks = s.lists.map((name) => modal.checkbox({
                label: name,
                value: !!s.selected[name],
                disabled: s.saving,
                onChange: ctx.eventHandler("acr-check-" + key + "-" + name, (e) => {
                    s.selected[name] = !!(e && e.value)
                }),
            }))
            if (checks.length) items.push(modal.stack(checks, { gap: 2 }))

            items.push(modal.switch({
                label: "In den Status-Listen ausblenden (nur in Custom Lists zeigen)",
                value: !!s.hidden,
                disabled: s.saving,
                onChange: ctx.eventHandler("acr-hidden-" + key, (e) => {
                    s.hidden = !!(e && e.value)
                }),
            }))

            items.push(modal.flex([
                modal.input({
                    placeholder: "Neue " + kind + " Custom List…",
                    value: s.newListName,
                    disabled: s.saving,
                    onChange: ctx.eventHandler("acr-newlist-" + key, (e) => {
                        s.newListName = (e && e.value) || ""
                    }),
                    className: "w-full",
                }),
                modal.button("Anlegen", {
                    intent: "gray-subtle",
                    disabled: s.saving,
                    onClick: ctx.eventHandler("acr-create-" + key, () => createList()),
                }),
            ], { gap: 2, className: "items-end" }))

            items.push(modal.flex([
                modal.button("Abbrechen", {
                    intent: "gray-subtle",
                    onClick: ctx.eventHandler("acr-cancel", () => modal.close()),
                }),
                modal.button("Speichern", {
                    intent: "primary",
                    loading: s.saving,
                    disabled: s.saving,
                    onClick: ctx.eventHandler("acr-save-lists-" + key, () => saveLists()),
                }),
            ], { gap: 2, className: "justify-end" }))
        }

        modal.render(() => {
            if (!s.media) return modal.text("")

            const items = []
            const kind = s.media.type === "MANGA" ? "Manga" : "Anime"
            const key = s.media.type + "-" + s.media.id

            items.push(modal.text((s.mode === "rating" ? "Bewerten: " : "Custom Lists: ") + s.media.title, { className: "font-semibold text-lg" }))

            if (s.loading) {
                items.push(modal.text("Lade deine Einstellungen von AniList…", { className: "text-[--muted]" }))
                return modal.stack(items, { gap: 3 })
            }

            if (s.error) {
                items.push(modal.alert({ title: "Fehler", description: s.error, intent: "alert" }))
                if (!s.userId) return modal.stack(items, { gap: 4 })
            }

            if (!s.entryExists) {
                items.push(modal.alert({
                    description: "Dieser " + kind + " ist noch nicht auf deiner Liste. Beim Speichern wird er als \"Planning\" hinzugefügt.",
                    intent: "info",
                }))
            }

            if (s.mode === "rating") renderRating(items, key, kind)
            else renderLists(items, key, kind)

            return modal.stack(items, { gap: 4 })
        })

        // ---------------------------------------------------------------------------------------------
        // Entry points

        function addButtons(type) {
            const isManga = type === "MANGA"
            const newPageButton = (props) => isManga ? ctx.action.newMangaPageButton(props) : ctx.action.newAnimePageButton(props)

            const rate = newPageButton({ label: "Bewerten", intent: "primary-subtle" })
            rate.mount()
            rate.onClick((e) => openFor(e.media, type, "rating"))

            const lists = newPageButton({ label: "Custom Lists", intent: "gray-subtle" })
            lists.mount()
            lists.onClick((e) => openFor(e.media, type, "lists"))

            const forMedia = isManga ? "manga" : "anime"
            const rateItem = ctx.action.newMediaCardContextMenuItem({ label: "Bewerten (Kategorien)", for: forMedia })
            rateItem.mount()
            rateItem.onClick((e) => openFor(e.media, type, "rating"))

            const listItem = ctx.action.newMediaCardContextMenuItem({ label: "Custom Lists", for: forMedia })
            listItem.mount()
            listItem.onClick((e) => openFor(e.media, type, "lists"))
        }

        addButtons("ANIME")
        addButtons("MANGA")
    })
}

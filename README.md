# Калкулатор за план за пожарогасене

Десктоп приложение (React + TypeScript + Electron) за изчисляване на силите и
средствата за гасене на пожар по **Методиката от Приложение № 5** (формули 1–40,
справочни Таблици 1–5). Интерфейсът е изцяло на български език. Целева платформа: **Windows**.

🌐 **Живо приложение:** https://ppo-calculator.plamen-1b4.workers.dev

## Какво изчислява

- **Раздел I** — твърди горими вещества: свободно време `t_св`, площ на пожара `F_п`
  (кръгово/правоъгълно развитие), площ на гасене `F_г` по форма, разход на вода `Q_н^г`,
  брой струйници, автомобили и личен състав.
- **Раздел II** — ЛЗТ и ГТ: охлаждане на горящ и съседни вертикални резервоари,
  пеногенератори и количество пенообразувател.
- **Раздел III** — пяна по обем: обем за запълване, разход на пяна, брой пеногенератори.
- **Раздел IV** — прахово гасене: разход на прах, струйници, количество прах, автомобили.

Всеки раздел показва **подробно решение** (формула → заместени стойности → резултат),
рендирано с KaTeX, и позволява **Печат** / **Запази като PDF**.

## Разработка

```bash
npm install
npm run dev      # стартира Vite + Electron в режим на разработка
npm test         # изпълнява изчислителните тестове (Vitest)
npm run build    # type-check + production build
```

## Пакетиране за Windows

```bash
npm run pack:win   # разпакетирана папка release/win-unpacked/ (не изисква Wine)
npm run dist:win   # NSIS инсталатор + portable .exe (изисква Wine на macOS/Linux)
```

- `pack:win` създава `release/win-unpacked/ppo-calc.exe` — готова за стартиране
  преносима папка. Работи директно на macOS/Linux/Windows.
- `dist:win` създава инсталатор (NSIS) и единичен portable `.exe`. На **macOS/Linux това
  изисква инсталиран `wine`**; без него стъпката за инсталатора се проваля. Препоръчва се
  билдът за разпространение да се прави на **Windows** или в **CI** (напр. GitHub Actions
  `windows-latest`), където Wine не е нужен.

### Windows 7 (наследен билд)

Стандартният билд използва Electron 42, който **не работи на Windows 7/8/8.1**
(Electron спира поддръжката им от версия 23). За тези системи има отделен билд с
**Electron 22.3.27** — последната версия със поддръжка на Windows 7:

```bash
npm run dist:win7   # release-win7/ppo-calc-win7.exe (portable) + инсталатор
```

- Главният процес се компилира до **CommonJS** (`scripts/build-electron-win7.mjs`,
  esbuild), тъй като Electron 22 не поддържа ESM. Конфигурацията е в
  `electron-builder-win7.yml`, а изходът отива в `release-win7/`.
- Билдът е с по-стар Chromium и **без обновления за сигурност** (Electron 22 е EOL).
  Ползвай го само за Windows 7; за Windows 10/11 разпространявай стандартния `ppo-calc.exe`.

## Публикуване

Приложението има две части за разпространение: **уеб версия** (статичен билд) и
**Windows изпълним файл**.

### Уеб версия → Cloudflare Pages

Статичен билд (`base: './'`, работи и на root, и на подпапка).

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Node version:** 22 (задава се чрез променлива `NODE_VERSION=22`)

Свържи GitHub репото в Cloudflare Pages → всеки push към `main` се публикува
автоматично, а всеки PR получава preview URL.

Текущ адрес: <https://ppo-calculator.plamen-1b4.workers.dev>

> Алтернатива: GitHub Pages (build command/output са същите; URL е на подпапка
> `…/ppo-calculator/`, освен ако се ползва собствен домейн).

### Windows `.exe` → GitHub Releases

Бинарните файлове се качват като GitHub Release, а бутонът „Изтегли за Windows“
в приложението сочи към последния:

```
https://github.com/plamen911/ppo-calculator/releases/latest/download/ppo-calc.exe
```

Стъпки:

```bash
npm run dist:win    # release/ppo-calc.exe (Windows 10/11)
npm run dist:win7   # release-win7/ppo-calc-win7.exe (Windows 7)
gh release create v1.0.0 \
  release/ppo-calc.exe \
  release-win7/ppo-calc-win7.exe \
  --title "v1.0.0" --notes "First release"
```

> Имената на качените файлове трябва да са точно `ppo-calc.exe` и
> `ppo-calc-win7.exe`, за да работят връзките към последния release.

## Структура

- `src/calc/` — чисто изчислително ядро (без DOM), напълно тествано: `helpers.ts`,
  `sectionI.ts` … `sectionIV.ts`, `types.ts`.
- `src/data/tables.ts` — справочни Таблици 1–5.
- `src/ui/` — React компоненти (таблове, полета, избор от таблица, форми, панел с решение).
- `electron/` — main процес и preload (export към PDF чрез `printToPDF`).

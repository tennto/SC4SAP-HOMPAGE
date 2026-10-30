/* Release notes for the update pages (js/updates.js), newest first.
   A script rather than JSON so the pages also work opened from disk,
   where fetch is blocked. Add a new release at the top of the list. */
window.SC4_UPDATES = {
 "plugin": [
  {
   "repo": "plugin",
   "version": "0.6.57",
   "date": "2026-10-30",
   "title": "Better selection-text handling on S/4HANA",
   "summary": "Reading and writing selection-screen texts on S/4HANA no longer drops or shifts labels.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "When selection texts are read and merged on S/4HANA, labels are no longer dropped or shifted onto other entries. The text pool is saved as active by default.",
      "Object search results show each program's title, preferring the title in the logon language.",
      "Program reads also read includes, and return an error for names that don't exist."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.56",
   "date": "2026-10-30",
   "title": "SAP password entered in a separate window",
   "summary": "The SAP password is no longer typed into the chat; it's entered in a separate prompt window and saved straight to the OS keychain.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "Setup and `/sc4sap:sap-option` no longer ask for the SAP password in the conversation. They open a masked input window outside Claude Code (Windows PowerShell console, macOS, Linux) and save the value directly to the OS keychain.",
      "Where the window can't be opened, the profile is created without a password and you can set it later from a desktop terminal. In no case does the password pass through the conversation."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.55",
   "date": "2026-10-29",
   "title": "System type setting fixes",
   "summary": "Fixed some tools being hidden on on-premise systems and the sensitive-table block being lifted.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "Removed the `/sc4sap:s4-conversion-readiness` skill from this repository."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "The system type is now saved only as onprem or cloud. The s4hana and ecc values offered earlier were read as cloud by the MCP server, hiding on-premise-only tools. Those values, empty values and typos now become onprem. The ECC vs. S/4HANA distinction stays in the SAP version setting.",
      "The custom row-blocklist profile keeps the default minimal tier (personal data, credentials) and adds the user's list on top. Previously all defaults were dropped, so tables such as USR02 could be read.",
      "Corrected MCP tool call arguments in the skill docs to match the actual names."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.54",
   "date": "2026-10-29",
   "title": "S/4HANA conversion readiness report",
   "summary": "Get everything to prepare before converting from ECC to S/4HANA in a single HTML report.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`/sc4sap:s4-conversion-readiness`: builds one HTML report with summary, target, Simplification Items, CBO objects, code locations, exits and BAdIs, table extensions and CDS, interfaces and events, T-codes in use, extensions and a checklist. Every table has filters, sorting and CSV.",
      "It first asks for the target (S/4HANA 2023, 2025, Public Cloud, comparison), then reads the system and asks which extensions to assess (EWM, RAP and Fiori elements, Integration Suite, etc.), with the evidence it found.",
      "Matches the CBO reference graph, source, exits, BAdIs, VOFM, appends and actual usage against the Simplification list using fixed rules. Covers changed tables (KONV, VBUK/VBUP, MKPF/MSEG, etc.), removed transactions and BAPIs, Business Partner, PI/PO proxies, IDocs, 40-character MATNR and more.",
      "Reads customer fields of affected tables from DDIC and groups them by work to do: data to move to new tables, CDS views to extend, BP screens and CVI mapping, and so on.",
      "Shows the highest severity, a rough effort estimate and the Clean Core level for each object. It doesn't replace SAP Readiness Check, SI-Check or ATC; those go on the to-do list.",
      "The ECC dispatcher can read IDoc partner profiles and event type linkage tables for the report's interface section."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.53",
   "date": "2026-10-29",
   "title": "Company templates for the role matrix",
   "summary": "Build the role matrix in your company's own layout, and load a completed company Excel back in to edit.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`role-matrix` can take a company layout: sheet titles and order, company-specific columns, level markers, headers spanning several columns, cover fields, colors, fonts and logo, while editing, search, CSV, checks and SoD keep working.",
      "Reads a company template (.xlsx, .docx, .html) and uses its tables, merged cells, fills, fonts and images as the basis for the layout.",
      "Loads a completed company Excel as an editable document. Menu levels written only once are filled down."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Role matrix editor: a filter row now sits under the sheet header, and CSV exports only filtered rows. Matrix cells pick values from a list. Inserted rows go above the selected cell, and right-click offers insert above/below and delete.",
      "The same user ID on several rows is flagged with a warning, and those rows are kept on sync.",
      "The `project-dashboard` milestone timeline gains month ticks, a today marker, shapes by type, completion marks, baseline and delay, and a legend, and labels no longer overlap."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.52",
   "date": "2026-10-29",
   "title": "Project dashboard and role matrix",
   "summary": "Build an SAP project status dashboard and an authorization design document as editable HTML.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`/sc4sap:project-dashboard`: builds an editable HTML page per project for PMs and the PMO (summary, KPIs, milestones with Q-gates, WBS and Gantt, team, history) plus a portfolio page across all projects.",
      "Comes with templates by project type (SAP Activate greenfield, S/4 conversion, rollout, AMS release, small) and shows a handover queue between module and development consultants for each WRICEF item. Pulls transports, package objects, inactive objects and post-go-live dumps read-only from the connected system.",
      "`/sc4sap:role-matrix`: builds an editable HTML authorization document with business roles, PFCG roles, a role × T-code matrix, user × role assignments, authorization objects, SoD rules with automatic conflict checks, and change history.",
      "For a new design, the module consultant proposes roles, T-codes, authorization objects and SoD rules, narrowed to T-codes actually used when ST03N usage is available. On an existing system it reads the PFCG role design and user assignments (IDs and validity dates only) and doesn't read USR* tables.",
      "Systems with many roles are read in chunks and long sheets are paged. Paging takes about 0.6 seconds with over 8,500 roles."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Of the PFCG tables, the ECC dispatcher can read only the role design and user assignment tables; the remaining AGR_*, USR*, UST* and credential tables stay blocked. Update the dispatcher before syncing."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed the allowed-tables setting not reaching the MCP server."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.51",
   "date": "2026-10-28",
   "title": "Cost-saving eco mode",
   "summary": "A new eco mode produces the same deliverables at lower cost, and Korean documents read more naturally.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Two cost modes: standard (default) and eco. Eco produces the same deliverables with cheaper models and fewer calls, without changing safety rules. Set it in `/sc4sap:sap-option` or run once with `/sc4sap:eco <skill>`.",
      "Korean documents (`module-to-process`, `program-to-manual`, `interface-mapping-spec`, `config-to-document`, `compare-programs`, `program-to-spec`) go through a sentence polishing step after review. It removes unnecessary commas after verbs and, if the humanize-korean plugin is installed, rewrites only sentences that still read like translations. A rewrite is discarded if it changes identifiers, code or numbers.",
      "When documents are in Korean, setup recommends installing humanize-korean."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Skills look for the SAP objects they work on only in the active profile's system, and stop to ask instead of guessing when they're not found.",
      "Team mode is now optional. `analyze-code` runs it only with the team argument or when you accept the suggestion, and the live consultant review in `create-program` runs only after asking (never in eco or unattended runs).",
      "`interface-mapping-spec` page file names include the interface ID, SAP object and interface name."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "`analyze-symptom` on ECC also reads dumps older than 24 hours from the ST22 list, so it no longer ends with \"no dumps\".",
      "Rewrote the Korean README in a friendlier polite register."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.50",
   "date": "2026-10-28",
   "title": "Dumps older than 24 hours on ECC",
   "summary": "Runtime errors older than 24 hours can now be looked up on ECC.",
   "sections": [
    {
     "type": "added",
     "items": [
      "The ECC dispatcher can read the ST22 runtime error list by period, user and client, checking ST22 display authorization. Reinstall the ECC dispatcher from setup to use it."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Dump lookups for periods older than 24 hours also fetch the ST22 list. When a single dump can't be opened on ECC, it explains how to get the facts.",
      "Some lookups returning 0 rows on BASIS 7.31 systems were fixed by an MCP server update."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.49",
   "date": "2026-10-28",
   "title": "Fewer tokens for GUI status reads",
   "summary": "GUI status reads fetch only what's needed, sharply cutting token use.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "GUI status reads narrow every CUA table to the given status. Previously the whole interface of a large program came back.",
      "A compact format picks only the function codes you want and returns one line per function. Reading the captions of a few buttons drops from 15K+ tokens to a few hundred."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.48",
   "date": "2026-10-28",
   "title": "Large scopes and cross-module integration maps",
   "summary": "`module-to-process` handles large modules and links between modules, and its pages are easier for consultants and operators to read.",
   "sections": [
    {
     "type": "added",
     "items": [
      "A large-scope mode for scopes with more than 300 entry points in use. Sources are fetched in chunks and batches and reviews run in parallel. Added FI and CO standard process skeletons.",
      "Modules that already have process maps can be combined into an integration map. It finds touchpoints through cross-module table reads/writes and function calls, and builds cross-module E2E scenarios and per-module-pair pages (swimlanes, touchpoint matrix, evidence).",
      "Module pages show the integration maps they belong to, read-only, and link each step to the other modules' steps before and after it."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Every step shows where it runs (T-code, program, RFC, job) and what starts it (button and function code, F8, batch job, exit). Steps done by several programs are shown as per-program cases.",
      "Decision-flow nodes are grouped into frames for the program that runs them, each program with its own color and label.",
      "BPH tables get Excel-style column filters. Swimlane boxes wrap text instead of truncating it.",
      "Arrows converging on one point no longer overlap in any skill's flowcharts."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Existing translations land on the correct entries even when the model revises them later. Unknown revisions are not copied into rows but left as questions to confirm."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.47",
   "date": "2026-10-27",
   "title": "Module process maps: module-to-process",
   "summary": "Build an editable process map per module based on the T-codes actually in use.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`/sc4sap:module-to-process`: builds an editable HTML process map per module (or process area spanning modules) for consultants starting a conversion or enhancement project. Replaces `package-to-process`.",
      "Analyzes only T-codes actually used, from production ST03N, submitted usage data or previous runs. Unused T-codes are only counted, not fetched.",
      "Places used T-codes on MM and SD standard process skeletons (L1–L4) and adds CBO-only tasks, variants, owners and connected systems.",
      "Writes a PDD-style sheet for each L4 task (definition, outputs, business rules with source lines, steps by role, decision flow, related standard and CBO objects, interfaces, S/4 conversion notes). Module consultant review is optional.",
      "Pages include a BPH table, L3 scenario swimlanes, a variant matrix and appendices, and edits made in edit mode are loaded back into the next version. Can reconcile against existing BPH/BPML Excel and produce an English companion page."
     ]
    },
    {
     "type": "changed",
     "items": [
      "`package-to-process` redirects to `module-to-process` during this release."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.46",
   "date": "2026-10-20",
   "title": "MCP update with SmartForm tools",
   "summary": "New installs include the MCP tools the SmartForm skills use.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "New installs include the SmartForm tools used by `smartform-preview` and `smartform-from-pdf` (layout and content reads, rendering, create, delete). The MCP server's dependencies were also updated."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.45",
   "date": "2026-10-20",
   "title": "Better SmartForm generation from PDF",
   "summary": "SmartForms built from PDF come closer to the original, including item repetition, shading and conditional text.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "In `smartform-from-pdf`, item lines are always built as a loop. Multi-line items are detected too, and on forms without rules the header, loop and totals go into a single MAIN window so the totals follow the items down.",
      "Filled boxes become cell shading, and image areas become SE78 graphic windows you specify.",
      "Supports conditional text, currency/quantity reference fields, initialization code and text modules per company code (header and footer). Company codes without a module print a blank instead of stopping output.",
      "Matches layout such as right-aligned columns and line spacing more precisely, measures font size from screenshots using SAP character widths, and asks about handwritten notes instead of printing them."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.44",
   "date": "2026-10-19",
   "title": "Accurate line breaks in SmartForm preview",
   "summary": "SmartForm preview breaks lines at the same positions as SAP output.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "`smartform-preview` uses the character widths of the SAP output device as-is, so it breaks lines at the same positions as SAP.",
      "Reflects table sort begin/end events, WHERE, and first-line/last-line output conditions. Fine details such as tabs, barcode formatting and Thai fonts were also aligned.",
      "Tested on 40 forms it had never seen; 37 matched SAP output exactly.",
      "`config-to-document` adds validation/substitution rules (GGB) and CMOD projects to the document, and reads large tables in chunks."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.43",
   "date": "2026-10-19",
   "title": "SmartForms from PDF",
   "summary": "Build a SmartForm from a PDF or screenshot of a printed form and upload it to the development system.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`/sc4sap:smartform-from-pdf`: builds a SmartForm from a printed-form PDF (or a screenshot, with estimated positions). Ruled areas become templates, and text is placed at its original position using formats from an existing SmartStyle (no new style is created).",
      "Which text is a field, which rows are item lines and which DDIC types to use in the interface are decided together with you. The form is uploaded to the DEV system, printed, and scored against the original.",
      "Built and compared on about 100 print forms, it averaged 98/100.",
      "Added ABAP functions to upload and delete SmartForms. DEV systems only, and delete works only on local Z/Y forms."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.42",
   "date": "2026-10-19",
   "title": "SmartForm preview that matches SAP",
   "summary": "SmartForm preview now matches actual SAP output in most cases.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Added an ABAP function that fetches SAP's rendering result, plus a dispatcher branch."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Tuned by rendering over 100 customer forms in SAP and comparing them with the preview; most match exactly.",
      "Fonts and widths: prints printer fonts per device type, SAP space widths, fixed-width DBCS fonts, and Korean/CJK inside Latin-1 text the way SAP does.",
      "Layout: reflects table patterns and borders, window boxes, fixed-position templates, 4.6-style tables, folders and loops inside templates and tables, footer and sort events, and page breaks.",
      "Text: prints right and center tabs, dynamic text, numbers with sign positioning, page totals, master language fallback, and barcodes following SE73 settings."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.41",
   "date": "2026-10-16",
   "title": "SmartForm preview",
   "summary": "See a SmartForm's expected output as an image without a print program or test data.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`/sc4sap:smartform-preview`: renders a SmartForm's expected output as JPG and HTML. Draws window positions, SmartStyle formatting, template grids and shading, loops and tables with sample rows, and SE78 graphics.",
      "Fills every field with a fictional sample value matching its DDIC type and reads no business data.",
      "Draws truncated cells and overflowing windows clipped the way SAP does and reports them, and also tells you which parts are only approximations.",
      "Added a read-only ABAP function that reads SmartForm content."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.40",
   "date": "2026-10-16",
   "title": "Documenting BAdI implementations and value meanings",
   "summary": "Configuration documents now show what customer BAdI implementations do and what column values mean.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`config-to-document` reads customer BAdI implementation classes method by method; the module consultant writes a summary and a reviewer checks it against the source. BAdI cards show a method table and the source.",
      "IMG activities that only open SE18/SE19 also recognize the BAdI named in their documentation and show its implementations.",
      "The column info popup shows up to 300 possible values for the column, with SAP texts.",
      "Each fixed value gets a one-line explanation, and the reviewed result is stored in a knowledge base shared by all modules and systems. SAP texts in the document language that are mistranslated are flagged separately."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed customer-changed rows being undercounted and tables being cut off at 1,000 or 5,000 rows on systems with many plants. Large tables are read to the end in chunks by key.",
      "Fixed runs ending without saving results because the read cache grew too large.",
      "IMG documentation was cut at 1,000 characters, leaving 40% of activities incomplete; up to 6,000 characters are now included.",
      "Reviewers also read Z includes to check BAdI and user exit code directly. Enhancement-based BAdI implementations show creator, date and implementing class.",
      "Fixed IMG links, filter labels and date formats in the BAdI table."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.39",
   "date": "2026-10-16",
   "title": "Column meanings in configuration documents",
   "summary": "Every value-table column in configuration documents gets its business meaning and the SAP F1 description.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Each value-table column in `config-to-document` shows its business meaning. It can be viewed with the SAP F1 text via the ⓘ in the header and the collapsed list above the table.",
      "Column meanings written by the module consultant and reviewed stay in a knowledge base shared by all modules, so the next module only writes new data elements.",
      "IMG activities that are BAdIs show this system's customer implementations (classic and enhancement-based) as cards, and the overview collects BAdIs with customer implementations.",
      "Case flows and screen drawings can be zoomed. Corrected SD pricing transaction details."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed selection-condition handling that made some views come out with 0 rows.",
      "Fixed BAdIs not being read at all. On ECC, update the dispatcher to see classic BAdI implementations.",
      "The top bar stays on one line on phones, and browsers that can't open the page show the reason instead of a blank screen."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.38",
   "date": "2026-10-15",
   "title": "Interface mapping specifications",
   "summary": "Build per-interface mapping specifications as editable HTML and sync them with SAP.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`/sc4sap:interface-mapping-spec`: builds a mapping specification per interface with cover, revision history, header, systems, a Source → Target field table, conversion rules and extraction conditions, plus an English companion page.",
      "Offers four scenarios: master outbound, transactional outbound, SAP inbound and lookup. SAP-side fields come from a field list, module consultant suggestions, pasted Excel, or existing table/view/structure/function module signatures.",
      "Suggests counterpart fields, DB types and date/ALPHA/currency/quantity conversion rules based on field types, and checks missing mandatory fields and type or length mismatches within the page.",
      "Edit mode works without installing anything, and saving bumps the revision history and version. You can re-read SAP to flag changed fields, or hand the field list to `/sc4sap:create-object`."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.37",
   "date": "2026-10-15",
   "title": "Editing views in configuration documents",
   "summary": "Edit mode in configuration documents can now change view values and change history too.",
   "sections": [
    {
     "type": "added",
     "items": [
      "In `config-to-document` edit mode you can edit view card titles, value-table cells and rows, and change history rows. Edited views get an editor and date badge.",
      "SM30 screen drawings can be replaced with real screenshots and switched back to drawings.",
      "Tables no longer collapse into one column in edit mode. Edited views carry into the next version and the SM30 screen is redrawn."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.36",
   "date": "2026-10-15",
   "title": "Module configuration documents: config-to-document",
   "summary": "Read IMG settings from a live system and build a configuration document per module.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`/sc4sap:config-to-document` (MM first): walks the IMG tree and, for each activity, draws the actual table values like the SM30 screen, building HTML with rows and history changed by customer transports, configuration checks, SAP IMG documentation and reviewed consultant notes.",
      "For each activity it writes an SAP documentation summary, configuration cases and flow diagrams, comparison tables and decision criteria, with sources limited to official SAP documentation. Reviewed notes stay in a knowledge base and are reused on other systems.",
      "Notes and reference panels can be edited in edit mode and carried into the next version.",
      "Aligned model routing to Opus 5.5 / Sonnet 5.5 / Haiku 5.5 and added a read-only Haiku check agent for narrow verification tasks. `create-program` and `analyze-code` use it to verify the evidence for each finding.",
      "`program-to-spec` and `compare-programs` produce versioned, editable HTML reports.",
      "Callers, impact scope and flow are queried from the CBO reference graph. Added T-code and job usage functions on ECC."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Table reads in the ECC dispatcher read configuration and system tables by delivery class, and still refuse business data and credential tables."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Customer-changed rows count only customer transports and exclude SAP delivery records.",
      "Tables cut off at 5,000 rows are read in chunks so output determination rows aren't lost. Values in ALV screen drawings no longer cover the next column."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.35",
   "date": "2026-10-07",
   "title": "VOFM routine extraction and ECC fixes",
   "summary": "Finds customer VOFM routines, and customer enhancement extraction works properly on ECC.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Customer enhancement extraction lists customer VOFM routines (requirements, formulas, data transfer, copy requirements, etc.) with group, number, description, active flag, include and code. They're identified by the VOFM customer number range and split by module."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "CMOD, GGB, BTE and VOFM table reads work on ECC (BASIS below 7.50).",
      "Reads GGB validation/substitution rules and BTE function modules that couldn't be read before. Also finds customer rules that don't start with Z/Y.",
      "Items that couldn't be read are marked separately as \"couldn't read\" rather than \"none\".",
      "Corrected the criteria for identifying CMOD, BAdIs, form-based exits and table extensions."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.34",
   "date": "2026-10-06",
   "title": "Screen numbers for manual field references",
   "summary": "Field references in manuals now let you match numbers on the screen drawing to rows in the table.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Field references in `program-to-manual` show drawings of the selection screen and output grid, and each field in the table is numbered on the drawing so you can find its row by the same number.",
      "Output columns spanning several screens are numbered continuously across per-screen drawings, and numbers update when rows are changed in edit mode.",
      "Wide grids are shown at full size with horizontal scrolling, and fit the page width when printed."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.33",
   "date": "2026-10-06",
   "title": "Process flows redrawn on the page",
   "summary": "Process flows in manuals and specifications can now be redrawn directly on the page.",
   "sections": [
    {
     "type": "added",
     "items": [
      "In `program-to-manual` edit mode and `program-to-spec` HTML you can move flowchart shapes, connect arrows, add and delete steps, and edit text. The edited layout carries into PNG, Excel and HTML as-is.",
      "Business rules, checkpoints, step notes and callout descriptions in manuals can be added, deleted and reordered.",
      "Terms and message codes in the body link to the glossary and message table and show their meaning in a tooltip.",
      "Saving after edits asks for the author and a change note, bumps the version by 0.1, and records it in the revision history."
     ]
    },
    {
     "type": "changed",
     "items": [
      "`program-to-spec` also produces an English version after review when the specification language isn't English. You can skip it if you don't want it."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.32",
   "date": "2026-10-02",
   "title": "Startup permission warning removed",
   "summary": "The permission rule warning shown when Claude Code starts is gone.",
   "sections": [
    {
     "type": "fixed",
     "items": [
      "`trust-session` grants only read and edit permissions that match Claude Code's path rule format.",
      "Mismatched permission entries left by earlier versions caused a warning at startup. Those entries are now removed automatically, and other rules are left untouched."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.31",
   "date": "2026-09-30",
   "title": "Editing finished manual pages",
   "summary": "Business users can edit a finished manual right on the page, with nothing to install.",
   "sections": [
    {
     "type": "added",
     "items": [
      "The edit button on `program-to-manual` pages lets you edit text and add bold, emphasis and list formatting. Nothing is loaded from the network.",
      "Supports moving, duplicating and deleting steps, adding, deleting and repositioning callouts, replacing screen drawings with real screenshots, editing field, message and term tables, and undo.",
      "Edits stay in the browser until saved, and when a saved page is loaded back in, your changes are kept in the next version.",
      "Excel worksheet-style screens can be drawn for steps done inside an upload template."
     ]
    },
    {
     "type": "changed",
     "items": [
      "After the manual is finalized, an English manual is produced alongside it by default. Screens, sample values, SAP identifiers and message texts are left as-is, and you can skip it if you don't want it.",
      "Including the editor grew the page from about 220 KB to 480 KB."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.30",
   "date": "2026-09-30",
   "title": "User manuals: program-to-manual",
   "summary": "Build a business user manual for a single program as one HTML file.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`/sc4sap:program-to-manual`: for each usage scenario, draws each step's screen (selection screen, ALV, popup) from the source and builds a manual with numbered callouts and instruction lists. When printed, each step becomes its own A4 landscape page.",
      "Each scenario gets checkpoints taken from the source (mandatory inputs, confirmation popups, irreversible processing), plus field references, messages and actions, a glossary and an auto-numbered revision history.",
      "The module consultant writes the business context, asks up to three questions about anything the source couldn't confirm, and marks the rest as \"needs confirmation\"."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Screen mockups in `program-to-spec` and `program-to-manual` are drawn in the SAP GUI Signature theme. The theme can be changed per system in `/sc4sap:sap-option`.",
      "Popups are drawn with a bottom toolbar and window frame like SAP, with support for nested blocks, ALV grid titles, traffic-light status icons and SAP icon names.",
      "Wide ALV grids are no longer cut off at 1600px, and narrow column headers no longer cover the next column."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.29",
   "date": "2026-09-30",
   "title": "Every screen documented in the specification",
   "summary": "`program-to-spec` now documents popups and detail screens, not just the main ALV.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`program-to-spec` draws additional dynpros such as popups and detail screens, and writes the call location and a PBO/PAI table for each screen.",
      "Screen elements above the grid (input fields, checkboxes, push buttons) are drawn, and push buttons are also linked into flows by function code.",
      "The Excel template has no place for additional screens, so they're left out of Excel."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed flowchart layout where long message nodes overlapped the node above or ran outside the image.",
      "Labels on loop-back lines at the right edge are no longer cut off."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.28",
   "date": "2026-09-30",
   "title": "Business flowcharts per output-screen button",
   "summary": "`program-to-spec` specifications show the ALV screen's buttons together with each button's business flow.",
   "sections": [
    {
     "type": "added",
     "items": [
      "ALV screen images in `program-to-spec` show the GUI status title, application toolbar and ALV grid toolbar buttons.",
      "One business flowchart is built for each button that changes data or starts processing, and the matching button in the screen image gets the same number badge.",
      "Buttons belonging to the same business step, such as online, batch and cancel, can share one flowchart, so a screen with about 30 function codes comes down to around 10 flowcharts.",
      "A warning appears for business buttons without a flowchart or flowcharts without a button."
     ]
    },
    {
     "type": "changed",
     "items": [
      "The HTML specification became a web page with a table-of-contents sidebar, sortable and filterable tables, SAP name tooltips, and a full/functional toggle that hides technical detail.",
      "Messages are written as code plus English text, like `M07 (Already FD Done)`, and text elements are read in English regardless of the specification language."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed flowcharts where labels on multi-way branches piled up in one spot."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.27",
   "date": "2026-09-30",
   "title": "Compatibility with the latest Claude Code",
   "summary": "Hook and skill settings were aligned with the latest Claude Code, so setup hooks that weren't running and skill argument passing now work.",
   "sections": [
    {
     "type": "fixed",
     "items": [
      "Fixed setup and maintenance hooks not running because they were registered on the wrong events.",
      "Recent transports and recent objects are reloaded into the session after context compaction.",
      "Fixed arguments entered for skills not being passed through.",
      "Cleaned up skill settings and the manifest so plugin validation passes without warnings."
     ]
    },
    {
     "type": "docs",
     "items": [
      "Corrected agent and skill counts, the missing `package-to-process` entry and broken table-of-contents links in the README and feature docs (English, Korean, Japanese, German)."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.26",
   "date": "2026-09-29",
   "title": "More accurate selection-screen mockups",
   "summary": "Selection-screen images in `program-to-spec` now draw push buttons, radio buttons and multiple blocks like the real screen.",
   "sections": [
    {
     "type": "fixed",
     "items": [
      "Fixed selection-screen images missing push buttons, toolbar buttons and additional blocks, and drawing radio groups as checkboxes.",
      "Each block draws input fields, ranges, checkboxes, radio groups, push buttons and comments distinctly, and default values are shown inside the input boxes.",
      "PARAMETERS no longer show a multiple-selection button (only SELECT-OPTIONS do), and long descriptions widen the image instead of being cut off.",
      "Results were checked against three real selection screens."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.25",
   "date": "2026-09-29",
   "title": "Skills use the session model",
   "summary": "All skills now run on the session model you chose, cutting unnecessary costs from model switching.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "Changed all 14 skills to follow the session model, including 12 that were pinned to Sonnet or Haiku.",
      "The cache rewrite costs caused by model pinning are gone. For example, a one-sentence `ask-consultant` answer in a Haiku session dropped from $0.43 to $0.09.",
      "Work that needs a specific model still runs on that model in a sub-agent, as before."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.24",
   "date": "2026-09-28",
   "title": "Choose sub-agent models yourself",
   "summary": "You can pick the models sub-agents use, and HUD cost calculations follow current pricing.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`sap-option` lets you choose how models are assigned. Automatic (default) follows the existing rules; custom asks for Opus / Sonnet / Haiku before each batch of work and shows the recommended model."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Agents use the latest model of each tier (Opus / Sonnet / Haiku) instead of being tied to a specific version.",
      "`ask-consultant` and `setup` also run on the session model.",
      "Lookup-oriented agents have their reasoning effort lowered to medium.",
      "Team mode discussions use parallel calls instead of the Claude Code team feature, which is no longer supported. The synthesis step is unchanged."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed the HUD cost display using old prices. It reflects current model prices and the 1-hour cache write rate."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.23",
   "date": "2026-09-22",
   "title": "Trimmed executor agent tools",
   "summary": "The executor agent carries fewer SAP tools, so each call uses less context.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "Cut the executor agent's SAP tools from 142 to 92, reducing the minimum call from about 71.4K to 59.7K tokens. Delete tools moved to the main conversation because each use needs user approval.",
      "Added the bulk activation and bulk text-element read/write tools that `create-program` and `create-object` tell the executor to use."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.22",
   "date": "2026-09-22",
   "title": "Fix for shifted values in table reads",
   "summary": "Fixed values shifting into other rows when reading tables with empty cells, and shrank MCP responses.",
   "sections": [
    {
     "type": "fixed",
     "items": [
      "Fixed empty cells merging with the next cell when reading table contents, shifting values by one row. If you extracted customizing or SPRO data from tables with empty cells, extract it again after updating.",
      "Whole function group sources are read correctly, following nested includes."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Object search and table read responses are smaller. Search returns 50 hits and table reads 20 rows by default.",
      "Large sources are saved to a file and only a list of METHOD / FORM / MODULE blocks is returned. A 66 KB class comes back as about a 3 KB response.",
      "`analyze-symptom` and `compare-programs` look only at the parts they need instead of reading large sources whole."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.21",
   "date": "2026-09-22",
   "title": "Less context for dump analysis",
   "summary": "`analyze-symptom` reads dumps only as far as needed, so each analysis uses less context.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "Looks at the dump list and metadata first, and reads the long ST22 text at most once, and only the developer chapters.",
      "Quick dump analysis runs on Sonnet; if it can't find the cause, it moves to a full Opus analysis carrying what it found so far.",
      "Removed the unverified multi-consultant team mode. Remaining business questions are written into the report as `ask-consultant` suggestions.",
      "Web search, source reads and transport lookups are limited to when they're really needed."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed dump summaries pointing at the wrong chapter (System environment).",
      "Fixed the server rejecting the zrfc RFC backend suggested by setup.",
      "Fixed new installs and auto-repair failing with missing-dependency errors."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.20",
   "date": "2026-09-22",
   "title": "Read-only symptom analysis and HTML output",
   "summary": "`analyze-symptom` never modifies SAP, and several skills can deliver their documents as HTML files.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Result documents from `program-to-spec`, `package-to-process`, `compare-programs`, `analyze-code`, `analyze-cbo-obj` and `create-program` can also be delivered as a single HTML file with images included.",
      "`program-to-spec` lets you choose several formats together from Markdown / HTML / Excel."
     ]
    },
    {
     "type": "changed",
     "items": [
      "`analyze-symptom` doesn't use SAP write tools even when asked for a fix, and shows fixes only as 'suggestions, not applied'.",
      "`analyze-symptom` first runs a short web search using only standard identifiers to find known issues. Z/Y names, SIDs, user IDs and data are never used in searches.",
      "The profiler only analyzes existing traces and doesn't start new ones."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed agent results being wrongly judged empty and agents being woken up again and again."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.19",
   "date": "2026-09-22",
   "title": "Hook cleanup and less context",
   "summary": "Removed hooks that didn't work or only made noise and trimmed the base documents agents read, making work lighter.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "Cleaned up hooks that never ran or made noise on every call, from 22 down to 14. Only the permission approval hook runs on SAP tool calls.",
      "Trimmed the base documents agents read every time, saving about 18 KB per call.",
      "Module consultants no longer pre-read all configuration documents, only those the question needs.",
      "Report-only steps are handled in the main conversation without a separate agent."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed the HUD showing 200K even when the subscription plan has a 1M context."
     ]
    },
    {
     "type": "docs",
     "items": [
      "Corrected outdated guidance such as multi-profile paths and skill model descriptions."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.18",
   "date": "2026-08-23",
   "title": "Stronger QA/PRD read-only protection",
   "summary": "Four change tools that slipped through on QA and PRD profiles are now blocked, strengthening production protection.",
   "sections": [
    {
     "type": "fixed",
     "items": [
      "Fixed object activation, GUI status changes, bulk text pool writes and profiler trace settings not being blocked on QA and PRD profiles.",
      "These tools are blocked in both the plugin hooks and the MCP server.",
      "DEV profile behavior is unchanged."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.17",
   "date": "2026-08-23",
   "title": "Hooks restored and permission approval reworked",
   "summary": "All hooks work again, and SAP tool permission prompts in the middle of pipelines are resolved.",
   "sections": [
    {
     "type": "fixed",
     "items": [
      "Fixed hooks failing with timeouts because they didn't receive input. Hook run time dropped from about 5.3 seconds to 0.3 seconds."
     ]
    },
    {
     "type": "changed",
     "items": [
      "A change in Claude Code's permission model made sub-agents ask for permissions mid-task; a new hook resolves this. SAP tools other than table content reads are approved automatically.",
      "Changed the setup wizard's system type values to `s4hana` / `cloud` / `ecc`. Existing profiles keep working.",
      "Removed the unused `deep-interview`, `team` and `release` skills. Team mode inside skills remains."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.16",
   "date": "2026-07-20",
   "title": "`package-to-process` BPML output",
   "summary": "`package-to-process` produces a BPML in Excel or Markdown along with the business process document.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`package-to-process` produces a BPML (Business Process Master List) in Excel or Markdown, with an overview sheet, an English BPML sheet and a sheet per L1 with flow images.",
      "It asks for the output language (Korean / English / Japanese / other) and BPML format (xlsx / md / both) at the start. The BPML sheet always stays in English."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Removed hyperlinks between sheets inside the BPML workbook."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.15",
   "date": "2026-06-09",
   "title": "New `package-to-process` skill",
   "summary": "A new skill analyzes a CBO package and builds an end-to-end business process document.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`package-to-process` finds the TCode entry points of a CBO package, groups them into processes such as PR→PO→GR→IR, and builds a description, flowchart, sequence diagram and step table for each process.",
      "If there's no CBO inventory, it collects one automatically first.",
      "`program-to-spec` renders branch flowcharts as images and puts them in the document.",
      "Sequence diagrams and process maps are drawn as PNG images, and the selection-screen and ALV mockups got a fresh design."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.14",
   "date": "2026-04-29",
   "title": "ECC DDIC lookups and classic BAdI search",
   "summary": "Table, structure, data element and domain definitions can be looked up on ECC too, and classic BAdI implementations can be found.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Full definitions of tables, structures, data elements and domains can be read on ECC systems.",
      "Finds Z/Y implementations of classic BAdI definitions (implementing class, package, redefined methods).",
      "Ships the server-side ABAP source for this (DEV only)."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.13",
   "date": "2026-04-27",
   "title": "Keychain password login fix",
   "summary": "Fixed SAP login failing for profiles whose password is stored in the OS keychain.",
   "sections": [
    {
     "type": "fixed",
     "items": [
      "Fixed every ADT tool call ending in a login failure for profiles using a password stored in the keychain.",
      "No more need to write the password in plain text as a workaround."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.12",
   "date": "2026-04-24",
   "title": "Choose the interview style",
   "summary": "In `create-program` you can choose between a sequential requirements interview and a team-synthesis interview.",
   "sections": [
    {
     "type": "added",
     "items": [
      "When the business interview in `create-program` ends, you can choose between the existing sequential interview (one question at a time) and team synthesis (analyst, architect and consultant write the interview document together).",
      "Answering \"you decide\" gets a recommendation that fits the situation.",
      "`program-to-spec` now uses the same response header, phase banners and agent composition rules as other skills."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed agent call examples in skill docs failing at run time because they were written without the plugin prefix."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.11",
   "date": "2026-04-24",
   "title": "Keychain bundle integrity check",
   "summary": "Check offline whether the bundled keychain module files have changed.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Records a hash for each bundled keychain module file, and an offline check finds missing, added and tampered files."
     ]
    },
    {
     "type": "docs",
     "items": [
      "Corrected the keychain module version misstated in the 0.6.9 release notes to 1.2.0."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.10",
   "date": "2026-04-24",
   "title": "HUD profile display and cache cleanup",
   "summary": "The HUD shows the SAP profile correctly even when run from a subfolder, and `sap-doctor` can clean up old caches.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`sap-doctor --prune` actually works. It finds caches of old plugin versions and shows their size, and deletes them with `--yes`.",
      "`sap-doctor` checks cache size and warns when old versions take 500 MB or more."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed the HUD showing 'SAP not configured' when Claude Code was started from a subfolder.",
      "Fixed user-added table deny rules being masked by default warn rules. User rules now take precedence."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.9",
   "date": "2026-04-24",
   "title": "Keychain password storage restored",
   "summary": "Passwords for new profiles are stored properly in the OS keychain instead of plain text.",
   "sections": [
    {
     "type": "fixed",
     "items": [
      "Fixed new profile passwords being stored in plain text because the keychain module was missing from the plugin install.",
      "Keychain modules for Windows, macOS and Linux now ship with the plugin, so `sap-option` and the setup wizard store passwords in Windows Credential Manager / macOS Keychain / libsecret.",
      "Existing plain-text profiles keep working; after updating, delete and re-add a profile to move it to the keychain."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.8",
   "date": "2026-04-24",
   "title": "0.6.7 model enforcement reverted",
   "summary": "Reverted the 0.6.7 model enforcement that broke most skills, so skills work normally again.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "Reverted the per-skill model enforcement added in 0.6.7. Sub-agents couldn't call other agents or use SAP tools, so 12 of 14 skills didn't work properly.",
      "Skill model settings remain as guidance only, and skills run on the session model, the same as before 0.6.6."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.5",
   "date": "2026-04-22",
   "title": "Simpler release process",
   "summary": "A release that only lightens the plugin release process, with no change to user features.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "Releases no longer pre-download the large MCP server source. No change to user features."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.4",
   "date": "2026-04-22",
   "title": "ECC DDIC write support shipped",
   "summary": "Updated the MCP server so ECC DDIC write support is included in installs.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "Bumped the MCP server to v4.8.1 so the ECC DDIC write path from 0.6.3 is included in installs."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.3",
   "date": "2026-04-22",
   "title": "ECC DDIC write path added",
   "summary": "Create and modify domains and data elements even on ECC systems where ADT doesn't support DDIC editing.",
   "sections": [
    {
     "type": "added",
     "items": [
      "On systems without ADT DDIC endpoints, such as ECC 7.40, DDIC work goes through server-side function modules.",
      "Domains and data elements support create, update and delete; tables support delete. Table create and update are guidance only for now.",
      "Ships the ABAP source for this."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Polished the guidance in `sap-option` and the setup wizard."
     ]
    },
    {
     "type": "docs",
     "items": [
      "Added the ECC DDIC path to the feature docs (4 languages) and the multi-profile and OData docs."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.6.0",
   "date": "2026-04-21",
   "title": "Multi-environment profiles",
   "summary": "Register several SAP systems such as Dev / QA / Prod and switch between them without restarting.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Register several SAP system profiles per company (e.g. KR-DEV, KR-QA, KR-PRD) and switch without restarting Claude Code.",
      "On QA and PRD profiles, create, update, delete, transport creation and execution tools are blocked automatically, in both the plugin hooks and the MCP server.",
      "Passwords can be stored in Windows Credential Manager / macOS Keychain / libsecret.",
      "`sap-option` lets you switch, add, delete, edit and migrate profiles, and shows the current profile and tier.",
      "The HUD shows the current profile and tier, with a lock icon on anything other than DEV.",
      "Projects using the old single configuration see a one-time migration notice."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Projects that haven't migrated keep working, and a missing tier is treated as DEV."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.5.4",
   "date": "2026-04-20",
   "title": "Plugin version display corrected",
   "summary": "Fixed the plugin list showing an old version; the actual version is now displayed.",
   "sections": [
    {
     "type": "fixed",
     "items": [
      "Aligned the version shown as 0.3.10 in `/plugin` with the actual version. Updating brings in all features accumulated in 0.4.0–0.5.3."
     ]
    },
    {
     "type": "changed",
     "items": [
      "The plugin description now reflects the skills and features added in 0.4–0.5. No change to skill behavior."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.5.3",
   "date": "2026-04-20",
   "title": "New `ask-consultant` skill",
   "summary": "Ask a module consultant directly without running the full development pipeline.",
   "sections": [
    {
     "type": "added",
     "items": [
      "`ask-consultant` routes a question to the right consultant among SD/MM/FI/CO/PP/PS/PM/QM/TR/HCM/WM/TM/BW/Ariba/BC, and asks two or three at once for questions spanning modules.",
      "Answers are tailored to the configured SAP version, industry, country and modules in use.",
      "It's read-only: it doesn't create or change objects and doesn't read table data."
     ]
    },
    {
     "type": "docs",
     "items": [
      "Added `compare-programs` and `ask-consultant` to the feature docs and README (4 languages)."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.5.2",
   "date": "2026-04-20",
   "title": "Four-tier context loading and response headers",
   "summary": "Agents read only the documents their role needs, and every response shows which model is working.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Split the documents agents read into four tiers: common required, role required, conditional and task-specific.",
      "Skill responses start with a `[Model: … · Dispatched: …]` header so you can see at a glance which model is working."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Tokens per consultant call are expected to drop by about another 15%."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.5.1",
   "date": "2026-04-20",
   "title": "Splitting large jobs across executors",
   "summary": "`create-program` splits large jobs across several executor agents and runs them in parallel.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Large jobs are split across two or three executor agents that share the same transport and run in parallel.",
      "The planning phase calculates program, include and DDIC counts and the split up front and shows them in the specification, so you can check before approving."
     ]
    },
    {
     "type": "changed",
     "items": [
      "If one agent gets stuck, the rest of the work is unaffected."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.5.0",
   "date": "2026-04-20",
   "title": "Context kits and model assignment rules",
   "summary": "Each phase uses only the documents and models it needs, cutting `create-program` costs.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Agents read only the minimum documents the task needs instead of every rule document.",
      "Reads and repetitive work go to Sonnet, new code and complex judgment to Opus, and simple lookups to Haiku."
     ]
    },
    {
     "type": "changed",
     "items": [
      "Each phase of `create-program` states which documents and model it uses. Tokens per call are expected to drop by 40–60% and Opus usage by about 50%.",
      "Code review is split by category, with each category looking only at its own rules, so it catches important findings better."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.4.1",
   "date": "2026-04-20",
   "title": "OK_CODE binding rule",
   "summary": "Screen programs built by `create-program` handle user commands correctly even with popups and ALV toolbar events.",
   "sections": [
    {
     "type": "added",
     "items": [
      "Added a three-step rule: bind the screen's user command to an OK_CODE variable, then copy, clear and branch. It prevents errors caused by popups overwriting sy-ucomm."
     ]
    },
    {
     "type": "changed",
     "items": [
      "The screen creation step checks the OKCODE field binding, and review flags direct use of `CASE sy-ucomm.` as a major finding."
     ]
    }
   ]
  },
  {
   "repo": "plugin",
   "version": "0.4.0",
   "date": "2026-04-19",
   "title": "Stronger program creation checks",
   "summary": "`create-program` checks are stronger, so it no longer reports empty screens, empty GUI statuses or inactive includes as done.",
   "sections": [
    {
     "type": "changed",
     "items": [
      "Selection texts for SELECT-OPTIONS / PARAMETERS are always created so technical names don't show on the selection screen.",
      "Screens and GUI statuses count as successful only after three steps: create → fill content → verify.",
      "After activation it checks that there are zero inactive objects, so it doesn't report 'activation complete' while sub-includes are still inactive.",
      "Procedural programs follow the standard main program template and include order."
     ]
    },
    {
     "type": "fixed",
     "items": [
      "Fixed review missing empty screens, empty GUI statuses, missing selection texts, inactive includes and forbidden include structures."
     ]
    }
   ]
  }
 ]
};

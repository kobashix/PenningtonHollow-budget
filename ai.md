# Pennington Hollow Budget Application Roadmap

This file tracks the project requirements, implementation state, and future tasks. It is for documentation and AI reference and is excluded from deployment via `.gitignore`.

## Project Goal
Create a comprehensive budget and financing management tool for the Pennington Hollow project.
- **Key Constraint:** Total monthly financing costs must stay under $2,000.
- **Requirement:** Integrate with `New_Build_Checklist_With_Phases_Costs.xlsx`.

## Completed
- [x] Project initialization (Vite, React, TS).
- [x] Basic loan calculator logic.
- [x] Vercel project setup and initial deployment (`https://hollow-eosin.vercel.app`).
- [x] `xlsx` library integration for budget file parsing.
- [x] Created utility `src/utils/budgetParser.ts`.

## In Progress
- [x] Refactor architecture to ledger-based model (Original -> Committed -> Paid).
- [ ] Implement hierarchical budget ledger (Category -> Line Item -> Financial Stages).

## Future Tasks
- [ ] Implement Change Order Log (Pending transfers/adjustments).
- [ ] Add Forecast to Complete (FTC) engine.
- [ ] Build automated Draw Request generator for lenders.
- [ ] Add persistence layer (browser storage) for session data.
- [ ] Implement CSV/JSON export functionality.
- [ ] Add unit testing for financing engine logic to guarantee constraint enforcement.
- [ ] Advanced dashboard visualization (Gantt-style/Charts).

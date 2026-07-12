# Kwickly Client Documentation

Welcome to the documentation for the Kwickly Client repository. 
This folder contains Architecture Decision Records (ADRs) and implementation plans.

## 📂 Documentation Structure
To prevent documentation fatigue, we organize files by **Domain (Topic) -> Chronological Order**. 
Deprecated or superseded decisions are moved to the `archive/` folder.

### 🏛️ Architecture & Infrastructure
- [2026-06-17: Project Context](architecture-and-infrastructure/2026-06-17-project-context/project-context.md)
- [2026-07-12: White-Labeling Architecture](architecture-and-infrastructure/2026-07-12-white-labeling-architecture/white-labeling-architecture.md)

### 🧪 Testing & QA
- [2026-06-17: Testing Progress](testing-and-qa/2026-06-17-testing-progress/testing-progress.md)

### 📦 Archive
*(Superseded or deprecated decisions live in `docs/archive/`)*

---

**Rule of Thumb for adding new Docs:**
1. Pick the correct domain folder (or create one if it doesn't fit).
2. Create a folder named `YYYY-MM-DD-short-topic-name`.
3. Add your markdown file inside.
4. Update this `README.md` to link to your new file!

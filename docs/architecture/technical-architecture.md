# Technical Architecture Blueprint: Expense Tracker Application

## Executive Summary

This document presents a comprehensive technical architecture for a modern expense tracker application designed to support voice-driven input, seamless integration with Google Sheets, and robust security controls aligned to the 2025 threat landscape. The solution targets end users who want to log expenses quickly using natural speech, optionally maintain a mirror of their data in Google Sheets for collaborative reporting, and rely on strong application security to protect financial information. The architecture addresses the complete lifecycle—from frontend component design and state management to backend APIs, external integrations, voice processing, data synchronization, security, deployment, observability, and testing.

At a high level, the system is composed of a React-based frontend; a REST backend exposing versioned APIs for expenses, categories, authentication, and synchronization; a Google Sheets integration module for optional mirroring and reporting; and a voice input pipeline that converts speech to structured expense records. The data flow is deliberately simple and resilient: the frontend captures user intents (typed or spoken), performs local state management and offline queuing, and persists changes through the backend. The backend writes to Google Sheets and a primary database (to be selected) while enforcing idempotency, concurrency control, and eventual consistency across clients.

![High-level system architecture overview](/workspace/docs/architecture/system-architecture-diagram.png)

Three non-negotiable principles guide the design. First, minimal moving parts: use proven patterns and tools that reduce complexity while delivering required functionality. Second, explicit state boundaries: distinguish remote server state, URL state, local UI state, and shared cross-component state, and select the most suitable library for each concern. Third, security-by-design: enforce OWASP Top 10 mitigations, implement defense-in-depth with WAF/WAAP and Cloud Application Detection and Response (CADR), and protect sensitive data at rest and in transit with disciplined key management and secure session handling.[^1][^2]

The architecture also candidly acknowledges information gaps that must be resolved during implementation: the final hosting provider and regions; the primary database choice and schema; Speech-to-Text provider selection and accuracy requirements; compliance scope; offline UX nuances; quota, rate limits, and latency targets; and SLOs/SLAs for availability and incident response. These are called out in context and revisited in the roadmap.

## Requirements and Constraints

Functional requirements center on the end-to-end lifecycle of an expense: creation, editing, categorization, deletion, search/filter, and reporting. Users can log expenses via typed forms or natural voice input. An optional integration allows mirroring transactions to Google Sheets for personal or team reporting. The application must provide secure authentication, a consistent user experience across devices, and clear observability for support and troubleshooting.

Non-functional requirements emphasize performance, availability, and security. Users should experience responsive interactions (including offline queuing when network connectivity is unavailable) and predictable behavior under load. Security baselines include HTTPS everywhere, strong session management, least privilege access, secure coding practices, and layered runtime protections (WAF/WAAP, CADR, bot management, and edge protection). Observability must capture logs, metrics, and traces for both application behavior and security events, with alerts and dashboards to detect anomalies quickly.[^2][^1]

Constraints include third-party API quotas (notably Speech-to-Text and Google Sheets), budget limits, and privacy considerations for financial data. The architecture must remain adaptable to different hosting platforms and regions and to a future decision on the primary database while preserving core patterns for consistency and idempotency.

To make the interplay between requirements and architecture explicit, the following mapping table ties key requirements to architectural responses.

### Requirement-to-Architecture Mapping

To illustrate how requirements translate into architectural decisions and mechanisms, Table 1 summarizes the mapping. This is a living artifact that can be expanded as information gaps are closed.

| Requirement | Architectural Response | Mechanism |
|---|---|---|
| Voice-driven expense logging | Voice input pipeline capturing audio, Speech-to-Text (STT), and NLU parsing to normalized fields | Browser microphone capture, STT API integration, deterministic parser with category merchant heuristics, review screen |
| Typed expense entry | React form components with validation and optimistic updates | Controlled inputs, schema validation, TanStack Query mutations, offline queue |
| Google Sheets mirroring | Backend service performing idempotent upserts with retry/backoff | Service account or user OAuth, batched writes, append-only event log pattern, reconciliation |
| Secure authentication | Standards-based auth with JWTs and optional OAuth/OIDC | Server-side session store or JWT with short TTL, refresh tokens, MFA (optional), CSRF defenses |
| Offline support | Local queue for operations, background sync when online | IndexedDB/LocalStorage for queue, synchronization service with exponential backoff |
| Search and filter | URL-driven search and filters with typed parsing | Router query state, nuqs for type-safe parsing and defaults |
| Reporting | Server-side aggregation endpoints and optional Sheets mirroring | Pagination and grouping endpoints, Sheets batch appends, scheduled reports |
| Security controls | OWASP-aligned mitigations plus layered runtime protections | Input validation, output encoding, least privilege, WAF/WAAP, CADR, bot management, edge protection |
| Observability | Centralized logging, metrics, and tracing | Structured logs, RED/USE metrics, API request tracing, alerting |

As these responses imply, the architecture favors explicit separation of concerns, clear interfaces, and idempotent operations to handle intermittent connectivity and eventual consistency.

## Frontend Architecture (React)

The frontend is implemented in React using TypeScript to ensure type safety and improve developer productivity. React’s hook-based API supports modular component design, while TypeScript helps enforce contract clarity across forms, lists, filters, and voice review screens. The routing layer is based on React Router, with URL state tightly integrated via typed query parameters to support deep linking and shareable filter states.

The component hierarchy is layered to keep presentation, container, and shared state concerns distinct. Layout components manage the chrome—navigation, header, sidebar, and footer—while feature pages compose domain-specific components such as expense lists, filters, forms, and a voice recording and review flow. Feature pages leverage shared components for consistency across the application. The design prioritizes accessibility and maintainability, with forms that validate early and voice screens that provide clear confirmations before final submission.

![Frontend component hierarchy and layering](/workspace/docs/architecture/frontend-component-hierarchy.png)

State boundaries are explicit. Remote server state—expenses, categories, and report data—is handled by TanStack Query (formerly React Query) to address caching, deduplication, invalidation, pagination, retries, and optimistic updates. URL state is managed through router hooks and nuqs for type-safe parsing, defaults, and two-way synchronization. Local UI state—modal visibility, toggles, and transient inputs—remains localized using useState/useReducer to avoid overloading global stores. Shared state across multiple components—such as session information, theme, or multi-page wizard flows—uses Zustand, a lightweight library with fine-grained subscriptions that minimize unnecessary re-renders and keep the mental model close to idiomatic React.[^3][^4][^5][^6]

Offline support is designed to enhance resilience without sacrificing correctness. An operations queue stores pending expense create/update/delete operations locally and replays them when connectivity returns. The frontend coordinates with the backend through an idempotent API, ensuring that replays do not produce duplicate records. A robust synchronization service applies exponential backoff on failures and surfaces clear status to the user: pending, retrying, success, and error.

To make state boundaries and tooling choices concrete, Table 2 outlines the state taxonomy with recommended libraries and rationales.

### State Taxonomy and Recommended Libraries

| State Type | Description | Recommended Library | Rationale |
|---|---|---|---|
| Remote state | Server-fetched data with caching, invalidation, retries, pagination | TanStack Query | Comprehensive remote-state primitives, deduplication, optimistic updates, stable and well-documented[^3] |
| URL state | Query parameters and route state for deep linking | React Router + nuqs | Type-safe parsing, defaults, simplified two-way sync with router hooks[^3] |
| Local UI state | Component-scoped concerns (toggles, visibility) | React hooks (useState/useReducer) | Keeps components simple and avoids unnecessary global re-renders[^3] |
| Shared state | Cross-component data (session, theme, wizard flow) | Zustand | Minimal API, fine-grained subscriptions, SSR/RSC compatibility, actively maintained[^4][^5][^6] |

In practice, many teams adopt a hybrid approach: use Zustand for UI/shared concerns, and TanStack Query for server data, thus avoiding the overreach of a single library trying to solve all state problems.[^3][^4][^5]

### Component Design and Hierarchy

Feature-first composition keeps the codebase maintainable. ExpenseList renders a paginated, filterable view; ExpenseForm handles structured entry and validation; the Voice module provides a natural interface for logging expenses, including a recording button and a review screen where users confirm parsed fields. The SearchBar and FiltersPanel rely on URL state so that users can share or revisit the same view easily. Shared components—such as buttons, modals, and empty states—centralize behavior and design tokens.

This hierarchy also reduces prop drilling: components consume only the state they need, either via TanStack Query hooks or Zustand selectors. Context providers are reserved for global concerns such as theming or authentication status, keeping the provider tree shallow and avoiding “providers hell.”[^3]

### Routing and URL State

Search, filters, and pagination are encoded in the URL. The router integrates with nuqs to parse integers and apply defaults for pagination and tab indices. Two-way synchronization ensures that when a user clears a filter, the URL and internal state remain consistent. This design supports shareable links to filtered views and makes back/forward navigation behave predictably across the app. The benefit is practical: it eliminates ad hoc synchronization code and reduces bugs related to stale state.[^3]

### State Management Strategy

TanStack Query governs server data with automatic caching, background refetching, and fine-grained control over stale time. Invalidation strategies align with mutation flows; for example, after an expense creation or update, the relevant query caches are invalidated to keep views consistent. Optimistic updates provide immediate feedback, and error handling triggers appropriate UI feedback and retry logic. Zustand holds session and cross-component UI state, with selectors ensuring that components re-render only when the specific slice they consume changes.[^3][^4]

### Offline-First UX

An operations queue stores pending changes in local storage (or IndexedDB) when offline. On reconnection, the frontend replays operations via the backend’s idempotent endpoints. The user sees queue status: pending, retrying, and final success or error. Backend idempotency keys guarantee that replays do not produce duplicates. This approach gives users confidence that their actions are durable, even without a stable network connection.

## Backend API Structure and Authentication Flow

The backend exposes a versioned REST API with endpoints for expenses, categories, authentication, and synchronization. Versioning is explicit (for example, /api/v1) to enable backward-compatible evolution. The API design favors idempotency for mutation endpoints through idempotency keys, enabling safe retries from both the frontend and the synchronization service. Input validation, output encoding, structured errors, and consistent pagination patterns ensure a predictable developer and operator experience.

![Backend API structure and module boundaries](/workspace/docs/architecture/api-structure-diagram.png)

Authentication follows standards-based flows using JSON Web Tokens (JWTs). Depending on deployment and compliance requirements, the system can integrate with an external identity provider via OAuth 2.0/OpenID Connect (OIDC) or implement its own auth service. Sessions are short-lived with refresh tokens to balance usability and security. Multi-factor authentication (MFA) is optional but recommended for sensitive operations. All sensitive operations are authorized with least privilege and documented with clear scopes and roles. CSRF defenses are applied where cookies are used for session management; when bearer tokens are used, CSRF risk is mitigated by avoiding automatic credential injection.

To make the API surface concrete, Table 3 catalogs primary endpoints, methods, auth requirements, and idempotency considerations.

### API Endpoint Catalog

| Path | Method | Purpose | Auth Required | Idempotency |
|---|---|---|---|---|
| /api/v1/auth/login | POST | Exchange credentials for JWT or session | No | N/A |
| /api/v1/auth/refresh | POST | Refresh short-lived tokens | Yes (refresh token) | N/A |
| /api/v1/auth/logout | POST | Invalidate session/refresh token | Yes | N/A |
| /api/v1/expenses | GET | List expenses with filters/pagination | Yes | N/A |
| /api/v1/expenses | POST | Create expense (supports idempotency key) | Yes | Yes (Idempotency-Key header) |
| /api/v1/expenses/{id} | PUT | Update expense (supports idempotency key) | Yes | Yes |
| /api/v1/expenses/{id} | DELETE | Delete expense | Yes | Yes (optional) |
| /api/v1/categories | GET | List categories | Yes | N/A |
| /api/v1/sync/operations | POST | Replay queued operations | Yes | Yes (client-supplied key) |
| /api/v1/sheets/mirror | POST | Trigger mirroring to Google Sheets (optional) | Yes | Yes (operation key) |

### Authentication Flow Details

On login, the backend validates credentials and issues access and refresh tokens. Access tokens have short time-to-live (TTL) to limit exposure; refresh tokens enable seamless re-authentication without password re-entry. Where cookies are used, session cookies carry Secure and HttpOnly flags to prevent theft via client-side scripts and ensure transport security. MFA can be layered for high-risk actions such as exporting financial data or changing account settings.

Logout invalidates tokens server-side, and password changes revoke refresh tokens to prevent session fixation. Rate limiting protects login endpoints from brute-force attacks, and abnormal session behavior triggers alerts. These measures align with secure session management practices and OWASP guidance on identity and authentication failures.[^2][^1]

## Google Sheets Integration Patterns

Many users prefer Google Sheets as a lightweight reporting surface, whether for personal budgeting or team collaboration. The integration must preserve correctness and avoid duplicate rows under retries and concurrent writes. The design supports two modes: a per-user sheet mirrored from the application’s primary database and an append-only event log that supports reconciliation and auditing.

Two authentication approaches are supported. For user-owned sheets, OAuth 2.0 grants the application access to the user’s spreadsheet. For centralized mirroring, a service account can be used with proper sharing and access controls. The integration uses the Google Sheets API (Node.js client), performing batched writes, retries with exponential backoff, and clear error handling. Schema mapping from application records to sheet rows is consistent and type-safe, with date and timezone normalization handled centrally.[^7][^8][^9][^10]

A practical caution: avoid patterns that attempt to bypass OAuth using static API keys for user data, as such approaches undermine security and violate platform policies. Instead, use the documented OAuth flows or service accounts appropriately.[^11]

To make the data contract explicit, Table 4 presents a canonical spreadsheet schema.

### Spreadsheet Schema Mapping

| Column | Field Name | Type | Required | Notes |
|---|---|---|---|---|
| A | expense_id | String (UUID) | Yes | Unique identifier; used to prevent duplicates |
| B | date | ISO 8601 date | Yes | Normalized to UTC or user’s timezone |
| C | amount | Decimal | Yes | Currency stored separately or implied by user settings |
| D | currency | ISO 4217 code | No | Optional if implied by user profile |
| E | category | String | No | Free-form or normalized from categories endpoint |
| F | merchant | String | No | Free-form; can be derived from voice parsing |
| G | notes | String | No | Optional free-text |
| H | source | Enum: voice\|typed | Yes | Captures origin for auditing |
| I | created_at | ISO 8601 timestamp | Yes | Server-side timestamp |
| J | updated_at | ISO 8601 timestamp | Yes | Server-side timestamp |
| K | sheet_sync_status | Enum: pending\|synced\|error | Yes | Used for reconciliation |

### Auth and Access Management

For per-user sheets, OAuth 2.0 is used to obtain tokens scoped to the user’s spreadsheets. The backend stores tokens securely and refreshes them as needed. When a service account is used, the sheet must be shared with the service account’s email, and least privilege access is enforced—only the required spreadsheets are accessible. Keys are rotated periodically, and access reviews ensure no privilege creep. These practices align with security fundamentals for credential handling and least privilege.[^2][^7]

### Sync and Reconciliation

Mirroring is idempotent: the backend uses expense_id to determine whether to append a new row or update an existing one. In high-concurrency scenarios, a last-write-wins policy is applied cautiously, or a strictly append-only event log pattern is used to avoid overwrites. Errors are handled gracefully with retries and backoff, and reconciliation jobs detect and fix anomalies such as missing rows or inconsistent values. This approach ensures reliable data mirroring without accidental duplicates, even under network retries.[^8]

## Voice Input Processing Workflow

Voice input is designed to be natural and fast: users speak in everyday language and the system parses essential details like amount, category, and merchant. The workflow is a pipeline: microphone capture in the browser, Speech-to-Text (STT) conversion, natural language understanding (NLU) to extract structured fields, normalization and validation, a review screen in the frontend, and final submission through an idempotent API. Privacy is respected: raw audio may be temporarily processed by the STT provider and then discarded according to retention policy; transcripts and extracted data are handled as sensitive information and protected accordingly.[^12]

Speech-to-Text provider selection remains open. There are three main options with documented free tiers or evaluation paths: AssemblyAI, Google Speech-to-Text, and AWS Transcribe. Each differs in accuracy, language support, latency, and pricing. The application’s decision should be driven by benchmarking against realistic expense语料, latency targets, and budget constraints.[^13]

To aid selection, Table 5 summarizes the providers and the evaluation dimensions the team should consider.

### STT Provider Comparison Matrix

| Provider | Free Tier Availability | Languages | Latency | Accuracy (to be benchmarked) | Pricing Model | Notes |
|---|---|---|---|---|---|---|
| AssemblyAI | Documented free tier options | Broad coverage | Competitive | Requires benchmarking | Usage-based | Evaluate diarization and punctuation features[^13] |
| Google Speech-to-Text | Free trial/evaluation paths | Strong coverage | Low-latency in many scenarios | Requires benchmarking | Usage-based | Natural fit if GCP is in stack; verify quotas[^13] |
| AWS Transcribe | Free tier availability varies | Broad coverage | Competitive | Requires benchmarking | Usage-based | Consider integration with AWS stack and security posture[^13] |

The provider choice does not alter the pipeline’s structure. It only influences tuning and integration details, such as streaming vs. batch upload, diarization requirements, and privacy settings.

### NLU Parsing and Categorization

After transcription, NLU maps the text to a normalized expense record. For example, “I bought groceries for $50 at Whole Foods” should yield amount=50, category=groceries, merchant=Whole Foods, and optionally currency based on locale heuristics. The parser employs deterministic rules and heuristics to identify tokens such as amounts (including currency symbols), merchants (using known lists and fuzzy matching), and categories (based on patterns or a pre-defined taxonomy). Where the parser is uncertain, the review screen prompts the user to confirm or adjust values, ensuring accuracy. Over time, the system can learn user-specific preferences to improve categorization without sacrificing determinism.

### Privacy and Compliance in Voice

Privacy controls are embedded by design. Users consent to voice processing, with clear disclosures about data handling. Audio transcripts and derived data are treated as sensitive; access is logged, retention is minimized, and encryption is enforced at rest and in transit. If regulatory requirements apply, additional controls such as explicit consent records, data residency, and extended audit logging can be enabled. While the exact compliance scope remains an information gap, the architecture anticipates those needs through flexible configuration and strong security baselines.[^2]

## Data Flow and State Synchronization

End-to-end data flow is straightforward: the user initiates an action (typed or voice), the frontend updates local state and queues the operation if offline, the backend receives the request, applies validation, updates the primary database, and mirrors changes to Google Sheets when enabled. Optimistic UI updates provide responsiveness, while reconciliation ensures server-side truth is authoritative. If a backend write fails, the frontend retries with exponential backoff and surfaces clear error messages. In parallel, server events and background tasks (such as Sheets mirroring) trigger cache invalidation and keep the UI synchronized.

![End-to-end data flow and synchronization across layers](/workspace/docs/architecture/data-flow-diagram.png)

The system favors eventual consistency across frontend caches and the server. Cache invalidation is tied to mutations and time-based stale thresholds, ensuring views refresh at appropriate times without unnecessary network traffic. Idempotency keys propagate from the frontend and synchronization service to the backend, preventing duplicate operations under retry scenarios. Race conditions are mitigated by a combination of server-side sequencing (where applicable) and conservative reconciliation policies.

To make concurrency and error handling explicit, Table 6 summarizes scenarios and policies.

### Concurrency and Error Handling Scenarios

| Scenario | Policy | Notes |
|---|---|---|
| Create expense retry (network hiccup) | Idempotent create using Idempotency-Key | Backend treats duplicate key as the same operation; returns prior result |
| Update with concurrent edits | Last-write-wins or conflict detection | Prefer conflict detection for financial fields; otherwise apply LWW |
| Delete under retry | Idempotent delete | Treat repeated deletes as success (idempotent) |
| Sheets mirroring failure | Retry with exponential backoff; mark row status=error | Reconciliation job later retries or flags for manual review |
| Frontend replay after offline | Client-supplied operation keys | Backend ensures no duplicates across replays |
| STT transient failure | Re-run STT or fallback to typed entry | User can review transcript before submission |
| Primary DB unavailable | Fail fast for non-idempotent ops; queue for later | Only idempotent operations should be queued to avoid partial state |

These policies ensure correctness even in adverse conditions, and they minimize operational complexity by leaning on idempotency and deterministic reconciliation.

## Security Considerations and Data Protection

Security is integrated from the start, not bolted on. The architecture maps risks to OWASP Top 10 categories and enforces mitigations such as input validation, output encoding, robust authentication and authorization, secure session management, encryption, and dependency hygiene. Runtime protections—including Web Application Firewall (WAF), Web Application and API Protection (WAAP), bot management, and CADR—provide layered defenses against modern threats. Edge protection further reduces exposure by blocking malicious traffic before it reaches the origin.[^1][^2]

Data classification is essential for financial applications. Access controls follow least privilege, and audit logging captures sensitive actions. Secrets and keys are managed centrally with rotation policies, and all data in transit and at rest is encrypted with modern TLS and strong cryptographic algorithms. Operational security includes regular dependency updates via Software Composition Analysis (SCA), code reviews, secure coding standards, and ongoing training for developers and operators.[^2]

Table 7 maps OWASP Top 10 risks to specific mitigations in this architecture.

### OWASP Top 10 Mapping

| Risk | Mitigation in This Architecture |
|---|---|
| Broken Access Control | Enforce least privilege; role-based access; server-side authorization checks; deny-by-default routes; audit sensitive actions[^1] |
| Cryptographic Failures | Use modern TLS; encrypt data at rest; manage keys securely with rotation and restricted access; avoid weak algorithms[^2] |
| Injection | Validate and sanitize inputs; use parameterized queries; output encoding to prevent script injection[^1] |
| Insecure Design | Threat modeling in design reviews; security requirements baked into epics; layered runtime protections (WAF/WAAP, CADR)[^1][^2] |
| Security Misconfiguration | Hardened defaults; infrastructure as code with policy checks; automated dependency updates via SCA[^2] |
| Vulnerable/Outdated Components | Dependency scanning (SCA); patch testing; maintain vetted library inventory; regular updates[^2] |
| Identity and Authentication Failures | Standards-based auth; strong session management; MFA for sensitive actions; rate limiting and anomaly detection[^1][^2] |
| Software and Data Integrity Failures | Signed artifacts; secure CI/CD pipelines; verify integrity of dependencies and configurations[^1][^2] |
| Security Logging and Monitoring Failures | Centralized logs; structured logging; metrics and traces; alerts for anomalies; SIEM integration[^2] |
| Server-Side Request Forgery (SSRF) | Egress controls; input validation; restrict outbound requests; deny-list / allow-list patterns[^1] |

These mitigations are actionable and testable, forming the backbone of a defense-in-depth strategy suitable for financial data.

## Deployment and Hosting Strategy

The deployment strategy is designed to be adaptable to different hosting platforms while preserving core patterns. A typical environment includes a frontend static site served via a CDN, a backend service behind a reverse proxy, a database (to be selected), and optional serverless functions for scheduled tasks such as reconciliation or reporting. Edge protection sits in front of the CDN and backend to filter malicious traffic early. Continuous integration and delivery (CI/CD) pipelines automate build, test, and deploy with environment-specific configuration management and secrets handling. Zero-downtime deployments use blue/green or canary strategies, and rollbacks are straightforward.

Security hardening includes TLS everywhere, HSTS to prevent protocol downgrades, certificate automation, and disciplined secret management (no secrets in code or unencrypted storage). The architecture emphasizes observability from day one: logs, metrics, and traces feed into dashboards and alerts, enabling rapid detection and remediation of incidents. Runtime protections (WAF/WAAP, CADR) integrate with DevOps via APIs for consistent policy enforcement and rapid response to anomalies.[^2][^1]

To help teams reason about environments and responsibilities, Table 8 outlines environment configurations and operational gates.

### Environment Configuration Matrix

| Environment | Components | Scaling Model | Operational Gates |
|---|---|---|---|
| Development | Frontend dev server, backend dev instance, local DB emulator | Manual | No PII; feature flags for experimental features; open logs for debugging |
| Staging | Frontend static behind CDN dev, backend staging, staging DB, Sheets test account | Horizontal auto-scaling | Security scans (SAST/SCA), integration tests, synthetic monitoring, WAF/WAAP in detect mode |
| Production | Frontend CDN, backend cluster, managed DB, Sheets production accounts | Horizontal auto-scaling with multi-AZ/region (TBD) | WAF/WAAP in enforce mode, CADR enabled, blue/green deploys, rollback plans, on-call runbooks |

### CI/CD and Release Management

Branch strategies align with release cadence. Automated pipelines run unit and integration tests, security scans (SAST/SCA), and linting. Deployment approvals ensure changes reach production only after passing policy gates. Blue/green or canary deployments minimize risk and enable quick rollback if necessary. Secrets are injected securely at deploy time using platform secret stores; configuration is environment-specific and auditable. These practices reduce operational risk and improve change velocity.[^2]

## Observability, Logging, and Monitoring

Observability is core to reliability and security. Application logs are structured and capture key events such as authentication attempts, expense mutations, Sheets mirroring status, voice pipeline outcomes, and synchronization operations. Metrics follow the RED (Requests, Errors, Duration) and USE (Utilization, Saturation, Errors) methodologies for APIs and resources respectively. Tracing captures the lifecycle of requests and background tasks, enabling developers to pinpoint bottlenecks or failures.

Security monitoring integrates with CADR and SIEM to detect anomalies such as credential stuffing, unusual API usage, or privilege escalation attempts. Alerts are tiered, with on-call escalation for high-severity incidents. Retention policies ensure logs are available for forensics without over-retaining sensitive data. Runtime visibility—function invocation, data flow deviations, and API behavior—helps contain attackers quickly, reducing dwell time.[^2]

Table 9 enumerates key observability signals, their sources, and alert policies.

### Key Observability Signals

| Signal | Source | Alert Policy |
|---|---|---|
| API error rate by endpoint | Backend metrics | Alert on sustained error rate above threshold (SLO) |
| API latency percentiles | Backend metrics/tracing | Alert on p95/p99 exceeding target for defined windows |
| Auth failures | Auth logs/metrics | Alert on spike indicating brute-force or credential stuffing |
| Sheets sync failures | Sync service logs | Alert on failures exceeding retry budget; trigger reconciliation |
| Voice pipeline failures | Frontend/backend logs | Alert on high failure rate; fallback to typed entry |
| Cache miss ratio | Frontend metrics | Alert if cache invalidation logic regresses unexpectedly |
| Anomalous traffic | CADR/WAAP | Alert and auto-block or challenge per policy |
| Dependency vulnerabilities | SCA reports | Alert and schedule patch deployment |
| Data integrity mismatches | Reconciliation jobs | Alert and open ticket for manual review |

These signals create a feedback loop that improves reliability and informs incident response.

## Testing Strategy and Quality Gates

Quality gates ensure correctness and security across layers. Unit tests cover parsers, reducers, and utility functions. Integration tests validate API endpoints and Sheets mirroring behavior. End-to-end tests exercise user workflows, including voice input and offline queue replay. Security testing includes dependency scanning (SCA), static analysis (SAST), dynamic scanning (DAST), and threat modeling. Performance testing establishes baseline latency and throughput expectations and identifies bottlenecks under load.

Quality gates are enforced in CI/CD before merging or deploying changes. Tests are run in ephemeral environments that mirror production characteristics as closely as possible. The test plan evolves with the application, adding coverage as new features and integrations are introduced.

Table 10 outlines test coverage per layer and the criteria for passing gates.

### Test Coverage Matrix

| Layer | Test Types | Gate Criteria |
|---|---|---|
| Frontend components | Unit, visual regression | All tests pass; no accessibility violations beyond agreed threshold |
| State management (Zustand/TanStack Query) | Unit, integration | Selectors and mutations behave as specified; caching/invalidation correct |
| API endpoints | Integration, contract | Auth and authorization enforced; pagination/validation correct; idempotency verified |
| Sheets mirroring | Integration | Idempotent upserts; error handling and retries; reconciliation accuracy |
| Voice pipeline | Integration, end-to-end | STT accuracy above target; parsing correctness; review screen confirms accuracy |
| Security | SAST, SCA, DAST, threat modeling | No critical vulnerabilities open; mitigations validated; risks documented |
| Performance | Load testing | Latency and throughput meet SLO targets under expected load |

## Risks, Trade-offs, and Decisions

The architecture embraces a few deliberate trade-offs. Choosing Zustand for shared state and TanStack Query for server state avoids over-centralizing state management, favoring simplicity and performance. This hybrid approach delivers fine-grained subscriptions and robust remote data primitives without imposing a heavyweight framework across all concerns.[^3][^4] A potential drawback is that teams accustomed to a single global store may need to adjust practices; this is mitigated by clear guidelines and code review standards.

Google Sheets is powerful for reporting but introduces quota constraints and eventual consistency for mirroring. The design leans on idempotency keys and reconciliation jobs to avoid duplicates and drift, accepting that Sheets is not a replacement for a transactional database. The decision to support both user-owned sheets and service accounts is intentional: it balances usability and governance. Service account access must be carefully managed to avoid overreach.[^7][^11]

Speech-to-Text provider selection carries trade-offs among accuracy, latency, cost, and integration complexity. Benchmarking on realistic expense语料 is necessary before committing to a provider; in the interim, the architecture isolates STT integration behind a service interface, allowing provider substitution without major refactoring.[^13] Finally, security and usability balance through measures such as rate limiting and CSRF defenses, with careful tuning to avoid frustrating legitimate users while maintaining strong protections.[^1][^2]

To consolidate key decisions, Table 11 records the options, trade-offs, and current status.

### Key Decisions Log

| Option | Trade-offs | Pros | Cons | Decision | Review Date |
|---|---|---|---|---|---|
| State libraries (Zustand + TanStack Query) | Two libraries to learn vs. one-size-fits-all | Simplicity, performance, clear separation | Requires guidelines to avoid misuse | Adopt hybrid approach | Quarterly |
| STT provider (AssemblyAI, Google, AWS) | Accuracy and cost vary; latency differs | Flexibility; competitive features | Benchmarking required; vendor lock-in | Benchmark then select | Before MVP launch |
| Sheets mirroring mode | Service account vs. user OAuth | Centralized control vs. user autonomy | Sharing complexity vs. token management | Support both modes | After user research |
| Hosting platform | Provider-specific features | Portability vs. optimized ops | Migration effort if not standardized | Keep neutral (TBD) | Initial MVP |

These decisions will be revisited as new information emerges, especially around compliance requirements and performance targets.

## Implementation Roadmap and Milestones

The roadmap is phased to deliver value quickly while building toward robust security and observability. The first milestone establishes the frontend skeleton with typed entry, basic forms, routing, and URL state. The second milestone integrates a first STT provider for voice input and introduces NLU parsing with a review screen. The third milestone wires the backend for core expenses endpoints with authentication and idempotency. The fourth milestone implements Sheets mirroring for early adopters, along with reconciliation and error handling. Security controls, observability, and testing rounds out the MVP before production deployment.

Table 12 outlines milestones, deliverables, and acceptance criteria.

### Milestone Plan

| Milestone | Deliverables | Dependencies | Acceptance Criteria |
|---|---|---|---|
| Frontend skeleton | React components, routing, URL state, forms | State libraries selected | Expense entry works; filters persist in URL; optimistic updates |
| Voice MVP | STT integration, NLU parsing, review screen | Frontend skeleton | Accurate transcription in test corpus; review confirms parsed fields |
| Backend core | Expenses API, auth, idempotency | Frontend hooks wired | CRUD works with idempotent retries; auth flows validated |
| Sheets mirroring | Idempotent upserts, retries, reconciliation | Backend core | No duplicates under retry; reconciliation fixes anomalies |
| Security & observability | WAF/WAAP policies, logging, metrics, tracing | Backend core | Alerts configured; security scans pass; incident runbooks drafted |
| Testing & performance | Test suite, load testing baseline | Backend, Sheets | All gates pass; latency and throughput meet targets |

## Information Gaps and Assumptions

Several decisions remain open and must be resolved during implementation:

- Hosting platform and regions: The architecture remains provider-neutral; specifics will influence CDN, WAF/WAAP integration, and multi-AZ/region strategies.
- Primary database: Selection (SQL vs. NoSQL) and schema design will affect transaction semantics and indexing strategies for search and reporting.
- Speech-to-Text provider: Accuracy and latency requirements are not yet defined; benchmarking is required.
- Compliance scope: Regional data protection obligations may dictate residency, retention, and audit logging policies.
- Offline UX specifics: Sync conflict resolution details and queue capacity limits need product input.
- Quotas and rate limits: Precise limits for Sheets API and STT providers will inform throttling and backoff strategies.
- Performance SLOs: Latency, throughput, and time-to-sync targets must be agreed to shape caching and invalidation policies.
- Incident response: RTO/RPO targets and escalation policies should be established with operations.

Assumptions in this document—such as using idempotency keys and a hybrid state approach—hold under these gaps and can be adapted as the open items are decided.

## References

[^1]: OWASP Top Ten. https://owasp.org/www-project-top-ten/
[^2]: Web App Security in 2025: 5 Technologies You Can't Do Without (Oligo Security). https://www.oligo.security/academy/web-app-security-in-2025-5-technologies-you-cant-do-without
[^3]: React State Management in 2025: What You Actually Need (The Developer Way). https://www.developerway.com/posts/react-state-management-2025
[^4]: Zustand vs Redux Toolkit: The Complete Guide to State Management in React. https://medium.com/@msmt0452/zustand-vs-redux-toolkit-the-complete-guide-to-state-management-in-react-4dce420741b4
[^5]: pmndrs/zustand: Bear necessities for state management in React. https://github.com/pmndrs/zustand
[^6]: How to use Zustand - Refine blog. https://refine.dev/blog/zustand-react-state/
[^7]: Node.js quickstart | Google Sheets API. https://developers.google.com/workspace/sheets/api/quickstart/nodejs
[^8]: Automating Google Sheets with Node.js and Google Sheets API (2025 Ultimate Guide). https://monukmodi.medium.com/automating-google-sheets-with-node-js-and-google-sheets-api-2025-ultimate-guide-d8425eafadfe
[^9]: 3 Approaches for Using the Google Sheets API in Node.js: A Tutorial. https://blog.stephsmith.io/tutorial-google-sheets-api-node-js/
[^10]: Google Sheets as a Database with Node.js and Google APIs (Dev.to). https://dev.to/drsimplegraffiti/google-sheets-as-a-database-with-nodejs-and-google-apis-59i5
[^11]: Get Google Sheet Data using V4 API without OAuth (Stack Overflow). https://stackoverflow.com/questions/73413032/get-google-sheet-data-using-v4-api-without-oauth
[^12]: Using Voice for Quick Expense Tracking: The Easiest Way to Manage Your Money (Receiptix Blog). https://receiptix.io/blog/2025/01/30/using-voice-for-quick-expense-tracking-the-easiest-way-to-manage-your-money
[^13]: Top Free Speech-to-Text APIs and Open Source Engines (AssemblyAI Blog). https://assemblyai.com/blog/the-top-free-speech-to-text-apis-and-open-source-engines
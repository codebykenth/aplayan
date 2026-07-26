# 02 — Form Requests, Policies, API Resources & CRUD Backend Controllers

**What to build:** Secure backend controller actions, validation requests, authorization policies, and Eloquent API resources allowing authenticated users to list, create, update, and delete their own job applications with structured response transformations while preventing cross-user access.

**Blocked by:** 01 — Job Applications Database Schema & Migration

**Status:** ready-for-agent

- [ ] Create `JobApplicationPolicy` with `viewAny`, `view`, `create`, `update`, and `delete` methods enforcing `$user->id === $jobApplication->user_id`.
- [ ] Create `StoreJobApplicationRequest` and `UpdateJobApplicationRequest` form requests with validation rules for all fields.
- [ ] Create `JobApplicationResource` (`app/Http/Resources/JobApplicationResource.php`) mapping all model fields to structured frontend array shapes.
- [ ] Create `JobApplicationService` encapsulating CRUD operations and user-scoped querying (`$user->jobApplications()`).
- [ ] Create `JobApplicationController` with `index`, `store`, `update`, and `destroy` methods authorizing actions via `JobApplicationPolicy`, delegating to `JobApplicationService`, and wrapping outputs in `JobApplicationResource`.
- [ ] Register routes in `routes/web.php` protected by `auth` middleware.
- [ ] Write Pest feature tests in `tests/Feature/JobApplicationCrudTest.php` asserting HTTP 403 Forbidden on unauthorized access, accurate `JobApplicationResource` prop structures, and successful CRUD for owners.
